// app/actions/contribution.ts
"use server"

import prisma from '@/lib/prisma'
// import { auth } from '@clerk/nextjs/server'
import { auth } from "@/lib/auth"
import { revalidatePath } from 'next/cache'
import { Contribution, ContributionCreateSchema, ExpenseSchema } from '../validation'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'


export async function createContribution(values: Contribution) {
  // const { userId: adminId } = await auth()


  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if(!session) {
      return redirect('/sign-in')
    }

    const validatedData = ContributionCreateSchema.parse(values)

    const existingContribution = await prisma.contribution.findFirst({
      where: {
        userId: validatedData.userId,
        month: validatedData.month,
        year: validatedData.year,
        quarter: validatedData.quarter
      }
    })

    if (existingContribution) {
      return { error: 'Contribution already exists' }
    }

    const contribution = await prisma.contribution.create({
      data: {
        ...validatedData,
        createdAt: new Date()
      }
    })

    revalidatePath('/admin/contributions')

    return { success: true, contribution }
  } catch (error) {
    console.error('Contribution creation error:', error)
    return { error: 'Failed to create contribution' }
  }
}

export async function deleteContribution(contributionId: string) {
  try {
    await prisma.contribution.delete({ where: { id: contributionId } })
    revalidatePath('/admin/contribution')
    return { success: true }
  } catch (error) {
    console.error('Contribution deletion error:', error)
    return { error: 'Failed to delete contribution' }
  }
}

export async function updateContribution(contributionId: string, values: Contribution) {
  try {
    const contribution = await prisma.contribution.update({
      where: { id: contributionId },
      data: values
    })
    revalidatePath('/admin/contribution')
    return { success: true, contribution }
  } catch (error) {
    console.error('Contribution update error:', error)
    return { error: 'Failed to update contribution' }
  }
}

export async function fetchContributions(page: number = 1, pageSize: number = 10) {
  try {
    const skip = (page - 1) * pageSize

    // Get total count for pagination
    const totalCount = await prisma.contribution.count()

    const contributions = await prisma.contribution.findMany({
      include: {
        user: true
      },
      orderBy:{
        month: "desc"
      },
      skip,
      take: pageSize
    })

    const totalContributions = contributions.reduce((sum, contribution) => sum + contribution.amount, 0)

    // Calculate the percentage change from last month
    const lastMonthStart = new Date()
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
    lastMonthStart.setDate(1)

    const lastMonthContributions = await prisma.contribution.findMany({
      where: {
        month: {
          gte: lastMonthStart,
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })

    const lastMonthTotal = lastMonthContributions.reduce((sum, contribution) => sum + contribution.amount, 0)
    const percentageChange = lastMonthTotal ? ((totalContributions - lastMonthTotal) / lastMonthTotal) * 100 : 0

    return {
      success: true,
      contributions,
      totalContributions,
      percentageChange: percentageChange.toFixed(1),
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    }
  } catch (error) {
    console.error('Contribution fetch error:', error)
    return { error: 'Failed to fetch contributions' }
  }
}


export async function fetchContribution(contributionId: string) {
  try {
    const contribution = await prisma.contribution.findUnique({ where: { id: contributionId } })
    return { success: true, contribution }
  } catch (error) {
    console.error('Contribution fetch error:', error)
    return { error: 'Failed to fetch contribution' }
  }
}

/**
 * Create bulk contributions for selected employees for selected months
 * @param userIds - Array of user IDs
 * @param startMonth - Start month (Date)
 * @param endMonth - End month (Date)
 * @param amount - Contribution amount (default 100)
 */
export async function createBulkContributions(
  userIds: string[],
  startMonth: Date,
  endMonth: Date,
  amount: number = 100
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: 'Unauthorized' }
    }

    // Generate list of months between start and end
    const months: Date[] = []
    // eslint-disable-next-line prefer-const
    let currentMonth = new Date(startMonth)
    currentMonth.setDate(1) // Set to first day of month

    const endDate = new Date(endMonth)
    endDate.setDate(1)

    while (currentMonth <= endDate) {
      months.push(new Date(currentMonth))
      currentMonth.setMonth(currentMonth.getMonth() + 1)
    }

    // Create contributions for each user and each month
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contributionsToCreate: any[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const skipped: any[] = []

    for (const userId of userIds) {
      for (const month of months) {
        const year = month.getFullYear()
        const quarter = Math.ceil((month.getMonth() + 1) / 3)

        // Check if contribution already exists
        const existing = await prisma.contribution.findFirst({
          where: {
            userId,
            month,
            year,
            quarter
          }
        })

        if (existing) {
          skipped.push({ userId, month: month.toISOString(), reason: 'Already exists' })
        } else {
          contributionsToCreate.push({
            userId,
            amount,
            month,
            year,
            quarter,
            status: 'COMPLETED' as const,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      }
    }

    // Bulk create all contributions
    if (contributionsToCreate.length > 0) {
      await prisma.contribution.createMany({
        data: contributionsToCreate
      })
    }

    revalidatePath('/admin/contribution')

    return {
      success: true,
      created: contributionsToCreate.length,
      skipped: skipped.length,
      skippedDetails: skipped,
      message: `Created ${contributionsToCreate.length} contributions. Skipped ${skipped.length} duplicates.`
    }
  } catch (error) {
    console.error('Bulk contribution creation error:', error)
    return { error: 'Failed to create bulk contributions' }
  }
}

/**
 * Automatically create contributions for all active employees for the current month
 * This should be called by a cron job at the end of each month
 */
export async function createMonthlyContributions(amount: number = 100) {
  try {
    // Get all active employees only
    const users = await prisma.user.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    if (users.length === 0) {
      return { success: true, message: 'No users found', created: 0 }
    }

    const currentDate = new Date()
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const year = currentDate.getFullYear()
    const quarter = Math.ceil((currentDate.getMonth() + 1) / 3)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contributionsToCreate: any[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const skipped: any[] = []

    for (const user of users) {
      // Check if contribution already exists for this month
      const existing = await prisma.contribution.findFirst({
        where: {
          userId: user.id,
          month,
          year,
          quarter
        }
      })

      if (existing) {
        skipped.push({ userId: user.id, email: user.email, reason: 'Already exists for this month' })
      } else {
        contributionsToCreate.push({
          userId: user.id,
          amount,
          month,
          year,
          quarter,
          status: 'COMPLETED' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    }

    // Bulk create all contributions
    if (contributionsToCreate.length > 0) {
      await prisma.contribution.createMany({
        data: contributionsToCreate
      })
    }

    revalidatePath('/admin/contribution')

    return {
      success: true,
      created: contributionsToCreate.length,
      skipped: skipped.length,
      skippedDetails: skipped,
      message: `Created ${contributionsToCreate.length} monthly contributions. Skipped ${skipped.length}.`,
      month: month.toISOString(),
      totalUsers: users.length
    }
  } catch (error) {
    console.error('Monthly contribution creation error:', error)
    return { error: 'Failed to create monthly contributions' }
  }
}


// Define the response structure
// interface AnalyticsResponse {
//   success: boolean;
//   monthlyContributions: { month: string; amount: number }[];
//   incomeVsExpenses: { month: string; income: number; expenses: number }[];
//   error?: string;
// }

export async function IncomeVsExpense(): Promise<{
  success: boolean;
  monthlyContributions: Array<{ month: string; year: number; amount: number }>;
  incomeVsExpenses: Array<{ month: string; year: number; income: number; expenses: number }>;
  error?: string;
}> {
  try {
    // Fetch contributions and expenses from the database
    const contributions: Contribution[] = await prisma.contribution.findMany();
    const rawExpenses = await prisma.expense.findMany();
    
    const expenses = rawExpenses.map((expense) => ExpenseSchema.parse({
      ...expense,
      description: expense.description ?? undefined, // Ensure compatibility
    }));

    // Initialize objects to accumulate totals
    const contributionTotals: Record<string, { amount: number; year: number }> = {};
    const expenseTotals: Record<string, { amount: number; year: number }> = {};

    // Group contributions by month and year, sum the amounts
    contributions.forEach(({ month: date, amount }) => {
      const monthDate = new Date(date);
      const month = monthDate.toLocaleString('default', { month: 'short' });
      const year = monthDate.getFullYear();
      const key = `${month}-${year}`;

      contributionTotals[key] = {
        amount: (contributionTotals[key]?.amount || 0) + amount,
        year
      };
    });

    // Group expenses by month and year, sum the amounts
    expenses.forEach(({ date, amount }) => {
      const monthDate = new Date(date);
      const month = monthDate.toLocaleString('default', { month: 'short' });
      const year = monthDate.getFullYear();
      const key = `${month}-${year}`;

      expenseTotals[key] = {
        amount: (expenseTotals[key]?.amount || 0) + amount,
        year
      };
    });

    // Generate analytics arrays
    const monthlyContributions = Object.entries(contributionTotals).map(
      ([key, { amount, year }]) => {
        const [month] = key.split('-');
        return { month, year, amount };
      }
    );

    // Combine keys from contributions and expenses
    const allKeys = new Set([
      ...Object.keys(contributionTotals),
      ...Object.keys(expenseTotals),
    ]);

    const incomeVsExpenses = Array.from(allKeys).map((key) => {
      const [month, year] = key.split('-');
      return {
        month,
        year: parseInt(year),
        income: contributionTotals[key]?.amount || 0,
        expenses: expenseTotals[key]?.amount || 0,
      };
    });

    return { 
      success: true, 
      monthlyContributions, 
      incomeVsExpenses 
    };
  } catch (error) {
    console.error('Contribution fetch error:', error);
    return { 
      success: false, 
      error: 'Failed to fetch data', 
      monthlyContributions: [], 
      incomeVsExpenses: [] 
    };
  }
}
