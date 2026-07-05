import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: { bodyParser: false },
}

function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    res.status(503).json({ error: 'stripe_not_configured' })
    return
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY)
  const rawBody = await readRawBody(req)
  const signature = req.headers['stripe-signature']

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature as string, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    res.status(400).json({ error: `invalid_signature: ${err instanceof Error ? err.message : 'unknown'}` })
    return
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

  res.status(200).json({ received: true })
}
