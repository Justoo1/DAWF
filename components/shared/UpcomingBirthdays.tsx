'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cake } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Birthday {
  id: string
  name: string
  email: string
  dateOfBirth: Date
  daysUntilBirthday: number
}

interface UpcomingBirthdaysProps {
  initialBirthdays?: Birthday[]
}

export default function UpcomingBirthdays({ initialBirthdays = [] }: UpcomingBirthdaysProps) {
  const [birthdays, setBirthdays] = useState<Birthday[]>(initialBirthdays)

  useEffect(() => {
    // Fetch upcoming birthdays
    const fetchBirthdays = async () => {
      try {
        const response = await fetch('/api/birthdays/upcoming')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setBirthdays(data.birthdays)
          }
        }
      } catch (error) {
        console.error('Failed to fetch birthdays:', error)
      }
    }

    if (initialBirthdays.length === 0) {
      fetchBirthdays()
    }
  }, [initialBirthdays])

  if (birthdays.length === 0) {
    return (
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cake className="h-5 w-5" />
            Upcoming Birthdays
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-sm">No upcoming birthdays in the next 7 days</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-300/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Cake className="h-5 w-5" />
          Upcoming Birthdays 🎉
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {birthdays.map((birthday) => (
          <div
            key={birthday.id}
            className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <div>
              <p className="text-white font-medium">{birthday.name}</p>
              <p className="text-gray-300 text-xs">
                {birthday.daysUntilBirthday === 0
                  ? 'Today! 🎂'
                  : birthday.daysUntilBirthday === 1
                  ? 'Tomorrow'
                  : `In ${birthday.daysUntilBirthday} days`}
              </p>
            </div>
            <div className="text-2xl">🎈</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
