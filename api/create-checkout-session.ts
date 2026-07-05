import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const { STRIPE_SECRET_KEY, STRIPE_PRICE_ID_PRO } = process.env
  if (!STRIPE_SECRET_KEY || !STRIPE_PRICE_ID_PRO) {
    res.status(503).json({ error: 'stripe_not_configured' })
    return
  }

  const { userId, email } = req.body ?? {}
  if (!userId) {
    res.status(400).json({ error: 'missing_user_id' })
    return
  }

  const origin = req.headers.origin || `https://${req.headers.host}`
  const stripe = new Stripe(STRIPE_SECRET_KEY)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: STRIPE_PRICE_ID_PRO, quantity: 1 }],
      client_reference_id: userId,
      customer_email: email || undefined,
      metadata: { supabase_user_id: userId },
      subscription_data: { metadata: { supabase_user_id: userId } },
      success_url: `${origin}/shop?checkout=success`,
      cancel_url: `${origin}/shop?checkout=cancelled`,
    })

    res.status(200).json({ id: session.id, url: session.url })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'checkout_failed' })
  }
}
