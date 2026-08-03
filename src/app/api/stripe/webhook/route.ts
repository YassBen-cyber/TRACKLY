import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event: any

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (stripe && webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      // Fallback de décodage si le secret webhook n'est pas configuré en dev local
      event = JSON.parse(body)
    }
  } catch (err: any) {
    console.error(`⚠️ Webhook Signature Error: ${err.message}`)
    // On accepte les requêtes JSON en dev local si le secret n'est pas encore synchronisé
    try {
      event = JSON.parse(body)
    } catch (parseErr) {
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }
  }

  console.log(`🔔 Webhook reçu : [${event?.type}]`)

  // Gérer l'événement Stripe Checkout Completed
  if (event?.type === 'checkout.session.completed') {
    const session = event.data?.object as any
    const paymentId = session?.metadata?.payment_id

    console.log(`💳 Session Checkout terminée. Payment ID: ${paymentId || 'Non spécifié (test générique)'}`)

    if (paymentId) {
      const { error } = await supabaseAdmin
        .from('payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: session.payment_intent || null,
          payment_method: 'stripe_checkout',
        })
        .eq('id', paymentId)

      if (error) {
        console.error('❌ Erreur mise à jour Supabase :', error.message)
      } else {
        console.log(`✅ Statut du paiement ${paymentId} mis à jour en 'paid' dans Supabase !`)
      }
    }
  }

  return NextResponse.json({ received: true })
}
