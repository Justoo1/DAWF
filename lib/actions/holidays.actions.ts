"use server"

import Holidays from "date-holidays"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Syncs public holidays for a given year into the database.
 * Defaults to Ghana (GH) if no country is provided.
 */
export async function syncPublicHolidays(year: number, country: string = "GH") {
  try {
    const hd = new Holidays(country)
    const holidays = hd.getHolidays(year)

    if (!holidays || holidays.length === 0) {
      return { success: false, error: `No holidays found for ${country} in ${year}` }
    }

    let createdCount = 0
    let skippedCount = 0

    for (const holiday of holidays) {
      // Upsert by name (assuming name is unique in PublicHoliday model)
      // Some holidays might change dates annually (like Easter), so we handle matches carefully.
      
      const holidayDate = new Date(holiday.date)
      
      // We check if this holiday already exists for this exact date
      const existing = await prisma.publicHoliday.findFirst({
        where: {
          date: {
            gte: new Date(holidayDate.getFullYear(), holidayDate.getMonth(), holidayDate.getDate()),
            lt: new Date(holidayDate.getFullYear(), holidayDate.getMonth(), holidayDate.getDate() + 1),
          },
          name: holiday.name
        }
      })

      if (existing) {
        skippedCount++
        continue
      }

      await prisma.publicHoliday.create({
        data: {
          name: holiday.name,
          date: holidayDate,
          isRecurring: holiday.type === 'public' // If it's a fixed date, we could mark as recurring, but date-holidays handles movement.
        }
      })
      createdCount++
    }

    revalidatePath("/admin/leave-management/calendar")
    
    return { 
      success: true, 
      created: createdCount, 
      skipped: skippedCount, 
      total: holidays.length 
    }
  } catch (error) {
    console.error("Error syncing holidays:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to sync holidays" }
  }
}
