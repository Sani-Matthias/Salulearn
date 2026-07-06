import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Uses the Web API (Request/Response) function signature instead of the
// classic Node (req, res) one: Vercel's Node handler auto-parses the body
// before the handler runs, which corrupts the exact raw bytes Stripe signed
// and makes constructEvent() always fail. Request.text() gives the raw body.
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405 })
  }

  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'stripe_not_configured' }), { status: 503 })
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY)
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? '', STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `invalid_signature: ${err instanceof Error ? err.message : 'unknown'}` }),
      { status: 400 }
    )
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  const setProStatus = async (userId: string, updates: Record<string, unknown>) => {
    await supabase.from('profiles').update(updates).eq('id', userId)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.client_reference_id || session.metadata?.supabase_user_id
      if (userId) {
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
        let proExpiresAt: string | null = null
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          proExpiresAt = new Date(subscription.current_period_end * 1000).toISOString()
        }
        await setProStatus(userId, {
          is_pro: true,
          pro_expires_at: proExpiresAt,
          stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null,
          stripe_subscription_id: subscriptionId ?? null,
        })
      }
      break
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.supabase_user_id
      if (userId) {
        await setProStatus(userId, {
          is_pro: subscription.status === 'active' || subscription.status === 'trialing',
          pro_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
        })
      }
      break
    }
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata?.supabase_user_id
        if (userId) {
          await setProStatus(userId, {
            is_pro: subscription.status === 'active' || subscription.status === 'trialing',
            pro_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
          })
        }
      }
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.supabase_user_id
      if (userId) {
        await setProStatus(userId, { is_pro: false })
      }
      break
    }
    default:
      break
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}
