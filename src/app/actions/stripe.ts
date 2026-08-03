'use server'

import { createClient } from '@/utils/supabase/server'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import Stripe from 'stripe'
import { revalidatePath } from 'next/cache'

/**
 * Enregistre l'IBAN du coach et connecte automatiquement Stripe Connect via API (Custom Account)
 */
export async function saveCoachIbanAndConnectStripe(iban: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Non autorisé')

  const cleanIban = iban.replace(/\s+/g, '').toUpperCase()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'coach') {
    throw new Error('Seul un coach peut enregistrer un IBAN')
  }

  if (stripe && isStripeConfigured()) {
    try {
      console.log('[Stripe] Début de saveCoachIbanAndConnectStripe pour l\'utilisateur', user.id)
      let accountId = profile.stripe_account_id
      console.log('[Stripe] Account ID actuel:', accountId)

      if (!accountId || accountId.startsWith('acct_custom_') || accountId.startsWith('acct_test_')) {
        console.log('[Stripe] Création d\'un compte Stripe Connect Custom...')
        // Création du compte Stripe Connect Custom pour le coach
        const accountPayload = {
          type: 'custom' as const,
          country: 'FR',
          email: user.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_type: 'individual' as const,
          individual: {
            first_name: profile.full_name?.split(' ')[0] || 'Coach',
            last_name: profile.full_name?.split(' ').slice(1).join(' ') || 'Trackly',
            email: user.email,
          },
          tos_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: '127.0.0.1',
          },
        }
        console.log('[Stripe] Payload de création de compte:', JSON.stringify(accountPayload))
        const account = await stripe.accounts.create(accountPayload)
        console.log('[Stripe] Compte Custom créé avec succès. ID:', account.id)
        accountId = account.id
      }

      // Attacher l'IBAN au compte Stripe du coach
      console.log('[Stripe] Ajout du compte externe bancaire à l\'ID:', accountId)
      const externalAccountPayload = {
        external_account: {
          object: 'bank_account',
          country: 'FR',
          currency: 'eur',
          account_number: cleanIban,
          account_holder_name: profile.full_name,
          account_holder_type: 'individual',
        },
      }
      // On ne loggue pas l'IBAN en entier pour des raisons de sécurité
      console.log('[Stripe] Payload de compte externe (sans IBAN complet)')
      await stripe.accounts.createExternalAccount(accountId, externalAccountPayload as any)
      console.log('[Stripe] Compte bancaire externe ajouté avec succès')

      // Sauvegarder dans Supabase
      await supabase
        .from('profiles')
        .update({
          stripe_account_id: accountId,
          stripe_connected: true,
          iban: cleanIban,
        })
        .eq('id', user.id)

      revalidatePath('/coach/payments')
      revalidatePath('/coach/settings')
      console.log('[Stripe] Profil Supabase mis à jour avec le compte Stripe')
      return { success: true, isMock: false }
    } catch (err: any) {
      console.error('Stripe Custom IBAN creation error:', err)
      console.error('[Stripe] Détails de l\'erreur brute:', err.raw || err)
      throw new Error(`Erreur Stripe lors de l'enregistrement de l'IBAN : ${err.message || err}`)
    }
  }

  console.log('[Stripe] Clé secrète Stripe non configurée, utilisation du mode démo/mock')

  // Mode démo / test (uniquement si STRIPE_SECRET_KEY n'est pas du tout configuré)
  const mockAccountId = `acct_custom_${user.id.substring(0, 8)}`
  await supabase
    .from('profiles')
    .update({
      stripe_account_id: mockAccountId,
      stripe_connected: true,
      iban: cleanIban,
    })
    .eq('id', user.id)

  revalidatePath('/coach/payments')
  revalidatePath('/coach/settings')
  return { success: true, isMock: true }
}

/**
 * Connecte ou simule la connexion du compte Stripe Connect du coach.
 */
export async function connectStripeAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Non autorisé')

  // Récupère le profil du coach
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'coach') {
    throw new Error('Seul un coach peut connecter un compte Stripe')
  }

  // Si Stripe est configuré avec de vraies clés de test
  if (stripe && isStripeConfigured()) {
    try {
      console.log('[Stripe Connect] Début de connectStripeAccount pour l\'utilisateur', user.id)
      let accountId = profile.stripe_account_id
      console.log('[Stripe Connect] Account ID actuel:', accountId)

      if (!accountId || accountId.startsWith('acct_custom_') || accountId.startsWith('acct_test_')) {
        console.log('[Stripe Connect] Création d\'un compte Stripe Connect Express...')
        // Créer un compte Stripe Connect Express pour le coach
        const accountPayload = {
          type: 'express' as const,
          country: 'FR',
          email: user.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_type: 'individual' as const,
          individual: {
            first_name: profile.full_name?.split(' ')[0] || 'Coach',
            last_name: profile.full_name?.split(' ').slice(1).join(' ') || 'Trackly',
          },
        }
        console.log('[Stripe Connect] Payload:', JSON.stringify(accountPayload))
        const account = await stripe.accounts.create(accountPayload)
        console.log('[Stripe Connect] Compte Express créé. ID:', account.id)
        accountId = account.id

        // Sauvegarder l'ID du compte Stripe dans Supabase
        await supabase
          .from('profiles')
          .update({
            stripe_account_id: accountId,
            stripe_connected: true,
          })
          .eq('id', user.id)
      }

      // Générer le lien d'embarquement (Onboarding) Stripe
      const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      console.log('[Stripe Connect] Création du Account Link pour l\'URL de retour...', domain)
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${domain}/coach/payments?connect=refresh`,
        return_url: `${domain}/coach/payments?connect=success`,
        type: 'account_onboarding',
      })
      console.log('[Stripe Connect] URL d\'onboarding générée:', accountLink.url)

      return { url: accountLink.url, isMock: false }
    } catch (err: any) {
      console.error('Stripe Connect error:', err)
      console.error('[Stripe Connect] Détails de l\'erreur brute:', err.raw || err)
      throw new Error(`Erreur Stripe Connect : ${err.message || err}`)
    }
  }

  console.log('[Stripe Connect] Mode Simulation / Démo, aucune clé Stripe.')
  // Mode Simulation / Démo Test (sans clés Stripe renseignées)
  const mockAccountId = `acct_test_${user.id.substring(0, 8)}`
  await supabase
    .from('profiles')
    .update({
      stripe_account_id: mockAccountId,
      stripe_connected: true,
    })
    .eq('id', user.id)

  revalidatePath('/coach/payments')
  return { url: null, isMock: true, connected: true }
}

/**
 * Déconnecte le compte Stripe du coach.
 */
export async function disconnectStripeAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Non autorisé')

  await supabase
    .from('profiles')
    .update({
      stripe_connected: false,
      iban: null,
    })
    .eq('id', user.id)

  revalidatePath('/coach/payments')
  revalidatePath('/coach/settings')
  return { success: true }
}

/**
 * Crée une session de paiement Stripe Checkout (ou renvoie les infos de test)
 */
export async function createCheckoutSession(paymentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Non autorisé')

  // Récupérer le paiement
  const { data: payment, error } = await supabase
    .from('payments')
    .select('*, coach:profiles!payments_coach_id_fkey(*)')
    .eq('id', paymentId)
    .single()

  if (error || !payment) {
    throw new Error('Paiement introuvable')
  }

  if (payment.client_id !== user.id) {
    throw new Error('Non autorisé à régler ce paiement')
  }

  const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Si Stripe est configuré avec des clés réelles
  if (stripe && isStripeConfigured()) {
    try {
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: payment.title || 'Prestation de coaching',
                description: `Coaching Trackly - ${payment.title}`,
              },
              unit_amount: Math.round(Number(payment.amount) * 100), // en centimes
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${domain}/client/payments?success=true&payment_id=${payment.id}`,
        cancel_url: `${domain}/client/payments?canceled=true`,
        metadata: {
          payment_id: payment.id,
          client_id: user.id,
          coach_id: payment.coach_id,
        },
      }

      // Si le coach a un compte Stripe Connect valide
      if (
        payment.coach?.stripe_account_id && 
        payment.coach?.stripe_connected &&
        !payment.coach.stripe_account_id.startsWith('acct_custom_') &&
        !payment.coach.stripe_account_id.startsWith('acct_test_')
      ) {
        // Appliquer 2% de frais de plateforme pour Trackly
        const platformFee = Math.round(Number(payment.amount) * 100 * 0.02)
        sessionParams.payment_intent_data = {
          application_fee_amount: platformFee,
          transfer_data: {
            destination: payment.coach.stripe_account_id,
          },
        }
      }

      const session = await stripe.checkout.sessions.create(sessionParams)

      // Enregistrer l'ID de session dans Supabase
      await supabase
        .from('payments')
        .update({
          stripe_checkout_session_id: session.id,
          payment_method: 'stripe',
        })
        .eq('id', payment.id)

      return { url: session.url, isTestModal: false }
    } catch (err: any) {
      console.error('Stripe Checkout session creation error:', err)
      throw new Error(`Erreur Stripe lors du paiement : ${err.message}`)
    }
  }

  // Mode Test / Démo interactif uniquement si pas de clés Stripe renseignées
  return { url: null, isTestModal: true, payment }
}

/**
 * Valide un paiement en mode test ou après confirmation du guichet de paiement.
 */
export async function confirmPaymentSuccess(paymentId: string, method: string = 'stripe_test') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('payments')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_method: method,
    })
    .eq('id', paymentId)

  if (error) {
    throw new Error('Erreur lors de la confirmation du paiement : ' + error.message)
  }

  revalidatePath('/client/payments')
  revalidatePath('/coach/payments')
  return { success: true }
}
