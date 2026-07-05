import { loadStripe, type Stripe } from '@stripe/stripe-js'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

export const isStripeConfigured = () => !!publishableKey

let stripePromise: Promise<Stripe | null> | null = null

function getStripe(): Promise<Stripe | null> {
  if (!publishableKey) return Promise.resolve(null)
  if (!stripePromise) stripePromise = loadStripe(publishableKey)
  return stripePromise
}

export async function startProCheckout(userId: string, email: string): Promise<{ error: string | null }> {
  if (!isStripeConfigured()) {
    return { error: 'Stripe ist noch nicht konfiguriert.' }
  }

  try {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      return { error: body?.error || 'Checkout konnte nicht gestartet werden.' }
    }

    const { url, id } = await res.json()
    if (url) {
      window.location.href = url
      return { error: null }
    }

    const stripe = await getStripe()
    if (!stripe) return { error: 'Stripe konnte nicht geladen werden.' }
    const { error } = await stripe.redirectToCheckout({ sessionId: id })
    return { error: error?.message || null }
  } catch {
    return { error: 'Checkout konnte nicht gestartet werden.' }
  }
}
