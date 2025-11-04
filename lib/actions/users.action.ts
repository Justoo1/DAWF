"use server";

import { revalidatePath } from 'next/cache'
import prisma from '../prisma'
import { ContributionStatus } from '@prisma/client';

export async function fetchUserWithContributions(email: string) {
  try {
    // Fetch user with their contributions
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: {
        contributions: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            userId: true,
            month: true,
            year: true,
            quarter: true,
            amount: true,
            status: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            contributions: true,
            events: true,
            expenses: true
          }
        }
      }
    })
    if (!user) {
      throw new Error('User not found')
    }

    // Calculate total amount contributed
    const totalAmountContributed = user.contributions.reduce((sum, contribution) => {
      return sum + (contribution.status === ContributionStatus.COMPLETED ? contribution.amount : 0)
    }, 0)

    // Calculate total months of contributions
    const contributionMonths = new Set(
      user.contributions.map(contribution => {
        const date = new Date(contribution.month)
        return `${date.getFullYear()}-${date.getMonth() + 1}` // "YYYY-MM"
      })
    )

    return {
      success: true,
      user: {
        ...user,
        contributionsCount: user._count.contributions,
        eventsCount: user._count.events,
        expensesCount: user._count.expenses,
        totalAmountContributed: totalAmountContributed,
        totalContributionMonths: contributionMonths.size
      }
    }
  } catch (error) {
    console.error('Error fetching user with contributions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
}


// Existing fetchUsers and revalidateUserPath methods remain the same
// export async function fetchUsers() {
//   try {
//     const { userId } = await auth()

//     if (!userId) {
//       throw new Error('User not authenticated')
//     }

//     const users = await prisma.user.findMany({
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         department: true,
//         clerkId: true,
//         role: true,
//         createdAt: true,
//         contributions: {
//           select: {
//             amount: true,
//             status: true,
//             createdAt: true
//           }
//         },
//         _count: {
//           select: {
//             contributions: true,
//             events: true,
//             expenses: true
//           }
//         }
//       },
//       orderBy: {
//         createdAt: 'desc'
//       }
//     })

//     return {
//       success: true,
//       users: users.map(user => {
//         // Calculate total amount contributed for each user
//         const totalAmountContributed = user.contributions.reduce((sum, contribution) => {
//           // Only sum contributions with a specific status (e.g., 'APPROVED')
//           return sum + (contribution.status === ContributionStatus.COMPLETED ? contribution.amount : 0)
//         }, 0)

//         // Calculate total months of contributions
//         const contributionMonths = new Set(
//           user.contributions.map(contribution => 
//             `${new Date(contribution.createdAt).getFullYear()}-${new Date(contribution.createdAt).getMonth()}`
//           )
//         )

//         return {
//           ...user,
//           contributionsCount: user._count.contributions,
//           eventsCount: user._count.events,
//           expensesCount: user._count.expenses,
//           totalAmountContributed: totalAmountContributed,
//           totalContributionMonths: contributionMonths.size
//         }
//       })
//     }
//   } catch (error) {
//     console.error('Error fetching users:', error)
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'An unknown error occurred'
//     }
//   }
// }

export async function fetchUsers(page: number = 1, pageSize: number = 10) {
  try {
    const skip = (page - 1) * pageSize

    // Get total count for pagination
    const totalCount = await prisma.user.count()

    // Fetch users with their contributions, events, and expenses
    const users = await prisma.user.findMany({
      include: {
        contributions: true,
        events: true,
        expenses: true,
      },
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Map the users to the UserValues type
    const userValues = users.map((user) => ({
      ...user,
      contributionsCount: user.contributions.length,
      eventsCount: user.events.length,
      expensesCount: user.expenses.length,
      totalAmountContributed: user.contributions.reduce((sum, contribution) => sum + contribution.amount, 0),
      totalContributionMonths: user.contributions.length,
      contributions: user.contributions,
      events: user.events,
      expenses: user.expenses,
    }));

    return {
      success: true,
      users: userValues,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

// Server action to fetch only user IDs and names
export async function fetchUsersIdAndName() {
    try {
      // Fetch only id, name, email, isActive, and isContributor for all users
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          isContributor: true
        },
        orderBy: {
          name: 'asc'
        }
      })

      return {
        success: true,
        users: users
      }
    } catch (error) {
      console.error('Error fetching user IDs and names:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }
    }
  }


  export async function deleteUser(userId: string) {
    try {
      await prisma.user.delete({ where: { id: userId } })
      return { success: true }
    } catch (error) {
      console.error('Error deleting user:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
    }
  }

  export async function fetchMembers() {
    try {
      const members = await prisma.user.findMany()
      const totalMembers = members.length
  
      // Calculate new members this month
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const newMembersThisMonth = await prisma.user.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth
          }
        }
      })
  
      // Calculate percentage change from last month
      const firstDayOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
      // const lastDayOfLastMonth = new Date(firstDayOfMonth.getTime() - 1)
      const membersLastMonth = await prisma.user.count({
        where: {
          createdAt: {
            gte: firstDayOfLastMonth,
            lt: firstDayOfMonth
          }
        }
      })
  
      const percentageChange = membersLastMonth 
        ? ((newMembersThisMonth - membersLastMonth) / membersLastMonth) * 100 
        : 100 // If there were no members last month, the growth is 100%
  
      return {
        success: true,
        totalMembers,
        newMembersThisMonth,
        percentageChange: percentageChange.toFixed(1)
      }
    } catch (error) {
      console.error('Member fetch error:', error)
      return { error: 'Failed to fetch members' }
    }
}

export async function fetchUser(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email: email } })
    if (!user) {
      return { error: 'User Not found' }
    }
    return { success: true, user }
  } catch (error) {
    console.error('User fetch error:', error)
    return { error: 'Failed to fetch user' }
  }
}

export async function revalidateUserPath(path: string) {
  revalidatePath(path)
}

export async function updateEmployeeStatus(userId: string, isActive: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    })
    revalidatePath('/admin/employees')
    return { success: true }
  } catch (error) {
    console.error('Error updating employee status:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}

export async function updateContributorStatus(userId: string, isContributor: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isContributor }
    })
    revalidatePath('/admin/employees')
    return { success: true }
  } catch (error) {
    console.error('Error updating contributor status:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}