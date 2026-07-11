import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/utils/supabase/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const { email, fullName } = await request.json()

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Email et nom complet requis' }, { status: 400 })
    }

    const supabaseAuth = await createServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'La clé SUPABASE_SERVICE_ROLE_KEY est manquante' }, { status: 500 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // On utilise le domaine configuré dans .env, sinon on prend celui de la requête, sinon localhost
    const origin = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'http://localhost:3000'
    
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        redirectTo: `${origin}/auth/callback`,
        data: {
          full_name: fullName,
          role: 'client',
          coach_id: user.id
        }
      }
    })

    if (error) throw error

    const hashedToken = data.properties.hashed_token
    const customLink = `${origin}/auth/callback?token_hash=${hashedToken}&type=invite`

    let emailSent = false
    let emailError = null
    
    // Si les identifiants Gmail sont configurés, on envoie le mail
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          // Timeouts pour éviter que ça tourne en rond indéfiniment
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000,
        })

        const mailOptions = {
          from: `"Coaching via Trackly" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `Invitation à rejoindre votre espace d'entraînement`,
          text: `Bonjour ${fullName},\n\nVotre coach vous a invité(e) à rejoindre son espace sur Trackly pour suivre vos entraînements, vos rendez-vous et vos performances.\n\nCopiez ce lien dans votre navigateur pour accepter l'invitation :\n${customLink}\n\nCeci est un message automatique envoyé par votre coach via Trackly.`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #111827; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">TRACKLY</h1>
              </div>
              <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin-bottom: 20px;">Bienvenue !</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Bonjour <strong>${fullName}</strong>,</p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Votre coach vous a invité(e) à rejoindre son espace sur Trackly pour suivre vos entraînements, vos rendez-vous et vos performances.</p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${customLink}" style="background-color: #000000; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 9999px; font-weight: 600; font-size: 16px; display: inline-block;">Accepter l'invitation</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; text-align: center;">Ou copiez ce lien manuellement : <br><br><a href="${customLink}" style="color: #2563eb; word-break: break-all;">${customLink}</a></p>
              
              <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 40px 0 20px 0;" />
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">Ceci est un message automatique envoyé par votre coach via Trackly.</p>
            </div>
          `,
        }

        await transporter.sendMail(mailOptions)
        emailSent = true
      } catch (err: any) {
        console.error("Erreur d'envoi d'email :", err)
        emailError = "Le lien a été créé mais l'email n'a pas pu être envoyé (délai d'attente dépassé)."
      }
    }

    return NextResponse.json({ success: true, link: customLink, emailSent, emailError })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
