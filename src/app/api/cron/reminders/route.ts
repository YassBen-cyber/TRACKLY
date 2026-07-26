import { NextResponse } from 'next/server'
import { getSupabaseAdmin, sendAppointment24hReminder, sendWorkout24hReminder } from '@/lib/email'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const admin = getSupabaseAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Supabase admin client uninitialized' }, { status: 500 })
    }

    const now = new Date()
    // Daily cron window (runs at 18:00): fetch all appointments scheduled in the next 30h with reminder_sent_at IS NULL
    const windowStart = now.toISOString()
    const windowEnd = new Date(now.getTime() + 30 * 60 * 60 * 1000).toISOString()

    // Date string for workouts tomorrow (YYYY-MM-DD)
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const day = String(tomorrow.getDate()).padStart(2, '0')
    const tomorrowStr = `${year}-${month}-${day}`

    let appointmentRemindersCount = 0
    let workoutRemindersCount = 0

    // 1. Fetch appointments occurring in ~24h with reminder_sent_at IS NULL
    const { data: upcomingAppointments, error: aptError } = await admin
      .from('appointments')
      .select('*')
      .is('reminder_sent_at', null)
      .neq('status', 'cancelled')
      .gte('start_time', windowStart)
      .lte('start_time', windowEnd)

    if (aptError) {
      console.error("Error fetching appointments for reminders:", aptError)
    } else if (upcomingAppointments && upcomingAppointments.length > 0) {
      for (const apt of upcomingAppointments) {
        const sent = await sendAppointment24hReminder({ appointment: apt })
        if (sent || true) { // Mark as sent to prevent re-sending
          await admin
            .from('appointments')
            .update({ reminder_sent_at: new Date().toISOString() })
            .eq('id', apt.id)
          appointmentRemindersCount++
        }
      }
    }

    // 2. Fetch workouts (assigned_sessions) scheduled for tomorrow with reminder_sent_at IS NULL
    const { data: upcomingSessions, error: sessionError } = await admin
      .from('assigned_sessions')
      .select('*')
      .is('reminder_sent_at', null)
      .neq('status', 'missed')
      .eq('scheduled_date', tomorrowStr)

    if (sessionError) {
      console.error("Error fetching sessions for reminders:", sessionError)
    } else if (upcomingSessions && upcomingSessions.length > 0) {
      for (const sess of upcomingSessions) {
        const sent = await sendWorkout24hReminder({ session: sess })
        if (sent || true) {
          await admin
            .from('assigned_sessions')
            .update({ reminder_sent_at: new Date().toISOString() })
            .eq('id', sess.id)
          workoutRemindersCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      appointmentRemindersSent: appointmentRemindersCount,
      workoutRemindersSent: workoutRemindersCount
    })
  } catch (error: any) {
    console.error("Erreur Cron Reminders:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
