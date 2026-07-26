import { createClient as createAdminClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

export function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function getUserProfileAndEmail(userId: string) {
  const admin = getSupabaseAdmin()
  if (!admin) return { name: 'Utilisateur', email: null, coachId: null, role: null }

  try {
    const { data: profile } = await admin.from('profiles').select('full_name, coach_id, role').eq('id', userId).single()
    const { data: authUser } = await admin.auth.admin.getUserById(userId)

    return {
      name: profile?.full_name || 'Utilisateur',
      email: authUser?.user?.email || null,
      coachId: profile?.coach_id || null,
      role: profile?.role || null
    }
  } catch (err) {
    console.error("Erreur lors de la récupération du profil/email:", err)
    return { name: 'Utilisateur', email: null, coachId: null, role: null }
  }
}

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[Email non envoyé - Identifiants EMAIL_USER/EMAIL_PASS absents] Destinataire: ${to} | Sujet: ${subject}`)
    return false
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    })

    await transporter.sendMail({
      from: `"Trackly Coaching" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    })

    console.log(`[Email envoyé avec succès] Destinataire: ${to} | Sujet: ${subject}`)
    return true
  } catch (error) {
    console.error(`[Erreur d'envoi d'email] Destinataire: ${to} | Erreur:`, error)
    return false
  }
}

/**
 * Notifier de la création/modification d'un rendez-vous
 */
export async function notifyAppointmentEvent({
  coachId,
  clientId,
  title,
  startTime,
  endTime,
  locationType = 'remote',
  locationDetails = '',
  meetingUrl = '',
  notes = '',
  createdByRole
}: {
  coachId: string
  clientId: string
  title: string
  startTime: string
  endTime: string
  locationType?: string
  locationDetails?: string
  meetingUrl?: string
  notes?: string
  createdByRole: 'coach' | 'client'
}) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const coachInfo = await getUserProfileAndEmail(coachId)
  const clientInfo = await getUserProfileAndEmail(clientId)

  const startDate = new Date(startTime)
  const endDate = new Date(endTime)
  const dateFormatted = startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeFormatted = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')} - ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

  const isRemote = locationType === 'remote'
  const locationText = isRemote ? 'Visio' : `Présentiel (${locationDetails || 'Adresse communiquée par le coach'})`

  if (createdByRole === 'coach' && clientInfo.email) {
    // Le coach crée un RDV -> Alerte le client
    const subject = `[Trackly] Nouveau rendez-vous : ${title}`
    const text = `Bonjour ${clientInfo.name},\n\nVotre coach ${coachInfo.name} a planifié un rendez-vous avec vous :\n\n- Motif : ${title}\n- Date : ${dateFormatted}\n- Horaires : ${timeFormatted}\n- Lieu : ${locationText}${notes ? `\n- Notes : ${notes}` : ''}\n\nConnectez-vous à votre espace Trackly pour plus de détails :\n${origin}/client/appointments`

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2563eb; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin: 0;">TRACKLY</h1>
          <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">Plateforme de Coaching</p>
        </div>
        <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;">Nouveau rendez-vous planifié 📅</h2>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">Bonjour <strong>${clientInfo.name}</strong>,</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">Votre coach <strong>${coachInfo.name}</strong> vient de fixer un nouveau rendez-vous avec vous :</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 16px; margin: 24px 0; border-left: 4px solid #2563eb;">
          <p style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 700;">${title}</p>
          <p style="margin: 0 0 6px 0; color: #4b5563; font-size: 14px;">📆 <strong>Date :</strong> ${dateFormatted}</p>
          <p style="margin: 0 0 6px 0; color: #4b5563; font-size: 14px;">⏰ <strong>Horaires :</strong> ${timeFormatted}</p>
          <p style="margin: 0 0 6px 0; color: #4b5563; font-size: 14px;">📍 <strong>Modalité :</strong> ${locationText}</p>
          ${meetingUrl ? `<p style="margin: 6px 0 0 0; color: #2563eb; font-size: 14px;">💻 <a href="${meetingUrl}" style="color: #2563eb; text-decoration: underline;">Rejoindre le lien visio</a></p>` : ''}
          ${notes ? `<p style="margin: 8px 0 0 0; color: #6b7280; font-size: 13px; font-style: italic;">📝 "${notes}"</p>` : ''}
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${origin}/client/appointments" style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block;">Consulter mon rendez-vous</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">Notification automatique envoyée via Trackly.</p>
      </div>
    `

    await sendEmail({ to: clientInfo.email, subject, text, html })
  } else if (createdByRole === 'client' && coachInfo.email) {
    // Le client réserve un RDV -> Alerte le coach
    const subject = `[Trackly] Nouveau RDV réservé par ${clientInfo.name}`
    const text = `Bonjour ${coachInfo.name},\n\nVotre athlète ${clientInfo.name} a réservé un rendez-vous avec vous :\n\n- Motif : ${title}\n- Date : ${dateFormatted}\n- Horaires : ${timeFormatted}\n\nAccédez à votre agenda sur Trackly :\n${origin}/coach/calendar`

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2563eb; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin: 0;">TRACKLY</h1>
          <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">Espace Coach</p>
        </div>
        <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;">Nouveau rendez-vous réservé ! 🔔</h2>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">Bonjour <strong>${coachInfo.name}</strong>,</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">Votre athlète <strong>${clientInfo.name}</strong> vient de réserver un creneau de rendez-vous :</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 16px; margin: 24px 0; border-left: 4px solid #10b981;">
          <p style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 700;">${title}</p>
          <p style="margin: 0 0 6px 0; color: #4b5563; font-size: 14px;">👤 <strong>Athlète :</strong> ${clientInfo.name}</p>
          <p style="margin: 0 0 6px 0; color: #4b5563; font-size: 14px;">📆 <strong>Date :</strong> ${dateFormatted}</p>
          <p style="margin: 0 0 6px 0; color: #4b5563; font-size: 14px;">⏰ <strong>Horaires :</strong> ${timeFormatted}</p>
          ${notes ? `<p style="margin: 8px 0 0 0; color: #6b7280; font-size: 13px; font-style: italic;">📝 Message de l'athlète : "${notes}"</p>` : ''}
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${origin}/coach/calendar" style="background-color: #111827; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block;">Voir dans mon agenda</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">Notification automatique envoyée via Trackly.</p>
      </div>
    `

    await sendEmail({ to: coachInfo.email, subject, text, html })
  }
}

/**
 * Notifier le coach quand un client ajoute ses disponibilités
 */
export async function notifyClientAvailabilitiesAdded({
  clientId,
  date,
  startTime,
  endTime,
  availabilityType = 'workout'
}: {
  clientId: string
  date: string
  startTime: string
  endTime: string
  availabilityType?: string
}) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const clientInfo = await getUserProfileAndEmail(clientId)
  if (!clientInfo.coachId) return

  const coachInfo = await getUserProfileAndEmail(clientInfo.coachId)
  if (!coachInfo.email) return

  const dateObj = new Date(date + 'T00:00:00')
  const formattedDate = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const typeLabel = availabilityType === 'workout' ? 'Entraînement' : availabilityType === 'appointment' ? 'Appel / Visio' : 'Entraînement & Appel'

  const subject = `[Trackly] ${clientInfo.name} a ajouté des disponibilités`
  const text = `Bonjour ${coachInfo.name},\n\nVotre athlète ${clientInfo.name} a mis à jour ses créneaux de disponibilité :\n\n- Date : ${formattedDate}\n- Horaires : ${startTime} à ${endTime}\n- Type : ${typeLabel}\n\nConsultez sa fiche sur Trackly :\n${origin}/coach/client/${clientId}`

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2563eb; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin: 0;">TRACKLY</h1>
        <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">Espace Coach</p>
      </div>
      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;">Mise à jour des disponibilités d'un athlète ⏱️</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">Bonjour <strong>${coachInfo.name}</strong>,</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">Votre athlète <strong>${clientInfo.name}</strong> a renseigné un nouveau créneau de disponibilité :</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 16px; margin: 24px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0 0 6px 0; color: #111827; font-size: 15px; font-weight: 700;">👤 <strong>Athlète :</strong> ${clientInfo.name}</p>
        <p style="margin: 0 0 6px 0; color: #4b5563; font-size: 14px;">📆 <strong>Date :</strong> ${formattedDate}</p>
        <p style="margin: 0 0 6px 0; color: #4b5563; font-size: 14px;">⏰ <strong>Créneau :</strong> de ${startTime} à ${endTime}</p>
        <p style="margin: 0; color: #4b5563; font-size: 14px;">🎯 <strong>Souhait :</strong> ${typeLabel}</p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${origin}/coach/client/${clientId}" style="background-color: #111827; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block;">Voir la fiche de l'athlète</a>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">Notification automatique envoyée via Trackly.</p>
    </div>
  `

  await sendEmail({ to: coachInfo.email, subject, text, html })
}
