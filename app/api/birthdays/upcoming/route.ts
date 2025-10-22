import { NextResponse } from 'next/server'
import { getUpcomingBirthdays } from '@/lib/actions/email.actions'

export async function GET() {
  try {
    const result = await getUpcomingBirthdays()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Upcoming birthdays API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch upcoming birthdays' },
      { status: 500 }
    )
  }
}
