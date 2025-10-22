import { NextRequest, NextResponse } from 'next/server'
import { createMonthlyContributions } from '@/lib/actions/contribution'

/**
 * API Route for automated monthly contributions
 * This should be called by a cron job at the end of each month
 *
 * Recommended schedule: Last day of month at 11:59 PM
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

    // Create monthly contributions for all employees (100 GH₵ each)
    const result = await createMonthlyContributions(100)

    return NextResponse.json({
      success: result.success,
      data: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Monthly contributions cron error:', error)
    return NextResponse.json(
      { error: 'Failed to create monthly contributions' },
      { status: 500 }
    )
  }
}

// Allow manual trigger via POST (for testing)
export async function POST(request: NextRequest) {
  return GET(request)
}
