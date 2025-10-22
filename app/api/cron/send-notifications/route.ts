import { NextRequest, NextResponse } from 'next/server'
import { sendBirthdayWishes, checkAndSendUpcomingEventNotifications } from '@/lib/actions/email.actions'

/**
 * API Route for scheduled email notifications
 * This should be called by a cron job service (e.g., Vercel Cron, GitHub Actions, or external cron service)
 *
 * Recommended schedule:
 * - Run daily at 8:00 AM to send birthday wishes and event notifications
 *
 * To secure this endpoint, you can add an authorization header check
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authorization check
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Send birthday wishes
    const birthdayResult = await sendBirthdayWishes()

    // Send event notifications
    const eventResult = await checkAndSendUpcomingEventNotifications()

    return NextResponse.json({
      success: true,
      birthday: birthdayResult,
      events: eventResult,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}

// Allow manual trigger via POST (for testing)
export async function POST(request: NextRequest) {
  return GET(request)
}
