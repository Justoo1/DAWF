import { NextRequest, NextResponse } from 'next/server'
import { generateBirthdayEvents } from '@/lib/actions/events.actions'

/**
 * API Route for automatic birthday event generation
 * Schedule: Runs on January 1st each year to create birthday events for the new year
 * Can also be triggered manually via POST request
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization (cron secret)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get year from query params or use current year
    const searchParams = request.nextUrl.searchParams
    const yearParam = searchParams.get('year')
    const year = yearParam ? parseInt(yearParam) : undefined

    // Generate birthday events
    const result = await generateBirthdayEvents(year)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Birthday events cron error:', error)
    return NextResponse.json(
      { error: 'Failed to generate birthday events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
