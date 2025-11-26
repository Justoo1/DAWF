"use server";

import { revalidatePath } from 'next/cache'
import prisma from '../prisma'
import { ContributionStatus, UserRole } from '@prisma/client';
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

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
    // Check if user is authenticated and has ADMIN role
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return { success: false, error: 'Unauthorized: You must be logged in' }
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Only admins can update employee status' }
    }

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
    // Check if user is authenticated and has ADMIN role
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return { success: false, error: 'Unauthorized: You must be logged in' }
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Only admins can update contributor status' }
    }

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

export async function updateBookingApprovalPermission(userId: string, canApproveBookings: boolean) {
  try {
    // Check if user is authenticated and has ADMIN role
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return { success: false, error: 'Unauthorized: You must be logged in' }
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Only admins can update booking approval permissions' }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { canApproveBookings }
    })
    revalidatePath('/admin/employees')
    return { success: true }
  } catch (error) {
    console.error('Error updating booking approval permission:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    // Check if user is authenticated and has ADMIN role
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return { success: false, error: 'Unauthorized: You must be logged in' }
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Only admins can update user roles' }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole }
    })
    revalidatePath('/admin/employees')
    return { success: true }
  } catch (error) {
    console.error('Error updating user role:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}

export async function updateUserDepartment(userId: string, department: string) {
  try {
    // Check if user is authenticated and has ADMIN or FOOD_COMMITTEE role
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return { success: false, error: 'Unauthorized: You must be logged in' }
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'FOOD_COMMITTEE')) {
      return { success: false, error: 'Unauthorized: Only admins and food committee can update departments' }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { department }
    })
    revalidatePath('/admin/employees')
    return { success: true }
  } catch (error) {
    console.error('Error updating user department:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}

export async function createEmployee(data: {
  name: string
  email: string
  department?: string
  dateOfBirth?: Date
  startDate?: Date
  role?: string
  isActive?: boolean
  isContributor?: boolean
  exitDate?: Date
  welfareContributionsBeforeExit?: number
}) {
  try {
    // Check if user is authenticated and has ADMIN role
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return { success: false, error: 'Unauthorized: You must be logged in' }
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Only admins can add new employees' }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return { success: false, error: 'An employee with this email already exists' }
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        department: data.department,
        dateOfBirth: data.dateOfBirth,
        startDate: data.startDate,
        role: (data.role as UserRole) || 'EMPLOYEE',
        isActive: data.isActive ?? true,
        isContributor: data.isContributor ?? true,
        exitDate: data.exitDate,
        welfareContributionsBeforeExit: data.welfareContributionsBeforeExit,
        emailVerified: false,
        password: '',
      }
    })

    revalidatePath('/admin/employees')
    return { success: true, user }
  } catch (error) {
    console.error('Error creating employee:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}

export async function updateEmployeeDates(userId: string, data: {
  startDate?: Date | null
  dateOfBirth?: Date | null
  exitDate?: Date | null
}) {
  try {
    // Check if user is authenticated and has MANAGER or ADMIN role
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return { success: false, error: 'Unauthorized: You must be logged in' }
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER')) {
      return { success: false, error: 'Unauthorized: Only admins and managers can update employee dates' }
    }

    // Permission checks:
    // - Managers can update startDate and exitDate
    // - Admins can update startDate, exitDate, and dateOfBirth
    const updateData: { startDate?: Date | null; dateOfBirth?: Date | null; exitDate?: Date | null } = {}

    // Both managers and admins can update startDate
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate
    }

    // Both managers and admins can update exitDate
    if (data.exitDate !== undefined) {
      updateData.exitDate = data.exitDate
    }

    // Only admins can update dateOfBirth
    if (data.dateOfBirth !== undefined) {
      if (currentUser.role === 'ADMIN') {
        updateData.dateOfBirth = data.dateOfBirth
      } else {
        return { success: false, error: 'Unauthorized: Only admins can update date of birth' }
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    revalidatePath('/admin/employees')
    return { success: true }
  } catch (error) {
    console.error('Error updating employee dates:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}