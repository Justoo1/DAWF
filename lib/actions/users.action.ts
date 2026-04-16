"use server";

import { revalidatePath } from 'next/cache'
import prisma from '../prisma'
import { ContributionStatus, UserRole } from '@prisma/client';
import { allowedWorkEmailMessage, isAllowedWorkEmail } from '@/lib/allowed-email-domains';
import { auth } from '@/lib/auth'
import { getAuthAppOrigin } from '@/lib/auth-app-url';
import { sendEmployeeVerificationEmail } from '@/lib/auth-email';
import { headers } from 'next/headers'
import { randomBytes, randomUUID } from 'crypto'

const EMPLOYEE_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24 * 2 // 48 hours

async function sendEmployeeVerificationInvite(email: string, displayName: string) {
  const token = randomBytes(32).toString('hex')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + EMPLOYEE_VERIFICATION_TTL_MS)
  const verifyUrl = `${getAuthAppOrigin()}/api/employee-verification?token=${encodeURIComponent(token)}`

  await prisma.$transaction(async (tx) => {
    await tx.verification.deleteMany({
      where: {
        identifier: {
          equals: email,
          mode: 'insensitive',
        },
      },
    })
    await tx.verification.create({
      data: {
        id: randomUUID(),
        identifier: email,
        value: token,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      },
    })
  })

  await sendEmployeeVerificationEmail(email, displayName, verifyUrl)
}

/** Fast path for layout chrome: one indexed lookup, no contribution rows or aggregates. */
export async function fetchAdminShellUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        canApproveBookings: true,
        isActive: true,
      },
    })
    if (!user) {
      throw new Error('User not found')
    }
    return { success: true as const, user }
  } catch (error) {
    console.error('Error fetching admin shell user:', error)
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}

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

    // Fetch users with only the requested fields and exact relation aggregates
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        email: true,
        department: true,
        role: true,
        isActive: true,
        isContributor: true,
        emailVerified: true,
        createdAt: true,
        dateOfBirth: true,
        startDate: true,
        exitDate: true,
        welfareContributionsBeforeExit: true,
        clientId: true,
        client: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            contributions: true,
            events: true,
            expenses: true,
          }
        },
        contributions: {
          select: { amount: true }
        }
      },
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Map the users to keep the API contract consistent but drastically smaller payload
    const userValues = users.map((user) => {
      const { client, ...rest } = user
      return {
      ...rest,
      clientName: client?.name ?? null,
      contributionsCount: user._count.contributions,
      eventsCount: user._count.events,
      expensesCount: user._count.expenses,
      totalAmountContributed: user.contributions.reduce((sum, contribution) => sum + contribution.amount, 0),
      totalContributionMonths: user._count.contributions,
      // We clear out the full nested object since the UI does not read thousands of relational rows
      contributions: [], 
      events: [],
      expenses: [],
    }
    });

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

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { isActive },
      })
      if (!isActive) {
        await tx.session.deleteMany({ where: { userId } })
      }
    })
    revalidatePath('/admin/employees')
    revalidatePath('/admin/manage-employees')
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
    revalidatePath('/admin/manage-employees')
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
    revalidatePath('/admin/manage-employees')
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
    revalidatePath('/admin/manage-employees')
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
    revalidatePath('/admin/manage-employees')
    return { success: true }
  } catch (error) {
    console.error('Error updating user department:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}

export async function createEmployee(data: {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  clientId: string
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

    const email = data.email.trim().toLowerCase()
    if (!isAllowedWorkEmail(email)) {
      return { success: false, error: allowedWorkEmailMessage() }
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    })

    if (existingUser) {
      return { success: false, error: 'An employee with this email already exists' }
    }

    const client = await prisma.client.findFirst({
      where: { id: data.clientId },
      select: { id: true, isActive: true },
    })
    if (!client) {
      return { success: false, error: 'Client not found' }
    }
    if (!client.isActive) {
      return {
        success: false,
        error:
          'That client is inactive. Enable it on the Clients page or choose an active client.',
      }
    }

    const firstName = data.firstName.trim()
    const lastName = data.lastName.trim()
    const displayName = `${firstName} ${lastName}`.trim() || email

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phoneNumber: data.phoneNumber.trim(),
        name: displayName,
        email,
        clientId: data.clientId,
        department: data.department,
        dateOfBirth: data.dateOfBirth,
        startDate: data.startDate,
        role: (data.role as UserRole) || 'EMPLOYEE',
        isActive: data.isActive ?? true,
        isContributor: data.isContributor ?? true,
        exitDate: data.exitDate,
        welfareContributionsBeforeExit: data.welfareContributionsBeforeExit,
        emailVerified: false,
      },
    })

    let verificationEmailSent = false
    try {
      await sendEmployeeVerificationInvite(email, displayName)
      verificationEmailSent = true
    } catch (emailError) {
      console.error('Employee verification email failed:', emailError)
    }

    revalidatePath('/admin/employees')
    revalidatePath('/admin/manage-employees')
    return {
      success: true,
      user,
      verificationEmailSent,
    }
  } catch (error) {
    console.error('Error creating employee:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}

export async function updateEmployeeProfile(
  userId: string,
  data: {
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
    clientId: string
    department?: string
    dateOfBirth?: Date
    startDate?: Date
    role?: string
    isActive?: boolean
    isContributor?: boolean
    exitDate?: Date | null
    welfareContributionsBeforeExit?: number | null
  }
): Promise<
  | { success: true; emailChanged: boolean; verificationEmailSent: boolean }
  | { success: false; error: string }
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session?.user) {
      return { success: false, error: 'Unauthorized: You must be logged in' }
    }
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized: Only admins can edit employee profiles',
      }
    }

    const newEmail = data.email.trim().toLowerCase()
    if (!isAllowedWorkEmail(newEmail)) {
      return { success: false, error: allowedWorkEmailMessage() }
    }

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })
    if (!existing) {
      return { success: false, error: 'Employee not found' }
    }

    const emailChanged =
      newEmail !== existing.email.trim().toLowerCase()

    if (emailChanged) {
      const others = await prisma.user.findMany({
        where: { NOT: { id: userId } },
        select: { email: true },
      })
      if (others.some((u) => u.email.toLowerCase() === newEmail)) {
        return {
          success: false,
          error: 'Another employee already uses this email',
        }
      }
    }

    const client = await prisma.client.findFirst({
      where: { id: data.clientId },
      select: { id: true, isActive: true },
    })
    if (!client) {
      return { success: false, error: 'Client not found' }
    }
    if (!client.isActive) {
      return {
        success: false,
        error:
          'That client is inactive. Enable it on the Clients page or choose an active client.',
      }
    }

    const firstName = data.firstName.trim()
    const lastName = data.lastName.trim()
    const displayName = `${firstName} ${lastName}`.trim()
    if (!displayName) {
      return { success: false, error: 'First and last name are required' }
    }

    const department =
      data.department === 'none' || !data.department?.trim()
        ? null
        : data.department.trim()

    const active = data.isActive ?? true

    const userUpdate = {
      email: newEmail,
      firstName,
      lastName,
      name: displayName,
      phoneNumber: data.phoneNumber.trim(),
      clientId: data.clientId,
      department,
      dateOfBirth: data.dateOfBirth,
      startDate: data.startDate,
      role: (data.role as UserRole) || 'EMPLOYEE',
      isActive: active,
      isContributor: data.isContributor ?? true,
      ...(active
        ? {
            exitDate: null,
            welfareContributionsBeforeExit: null,
          }
        : {
            exitDate: data.exitDate ?? null,
            welfareContributionsBeforeExit:
              data.welfareContributionsBeforeExit ?? null,
          }),
      ...(emailChanged
        ? {
            emailVerified: false,
          }
        : {}),
    }

    let verificationEmailSent = false

    await prisma.$transaction(async (tx) => {
      if (emailChanged) {
        await tx.session.deleteMany({ where: { userId } })
        await tx.verification.deleteMany({
          where: {
            OR: [
              { identifier: existing.email },
              { identifier: newEmail },
            ],
          },
        })
      } else if (!active) {
        await tx.session.deleteMany({ where: { userId } })
      }
      await tx.user.update({
        where: { id: userId },
        data: userUpdate,
      })
    })

    if (emailChanged) {
      try {
        await sendEmployeeVerificationInvite(newEmail, displayName)
        verificationEmailSent = true
      } catch (emailError) {
        console.error('Employee verification email failed after email update:', emailError)
      }
    }

    revalidatePath('/admin/employees')
    revalidatePath('/admin/manage-employees')
    return { success: true, emailChanged, verificationEmailSent }
  } catch (error) {
    console.error('Error updating employee profile:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    }
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
    revalidatePath('/admin/manage-employees')
    return { success: true }
  } catch (error) {
    console.error('Error updating employee dates:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}

async function requireAdminSessionForAuthActions(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session?.user) {
    return { ok: false, error: 'Unauthorized' }
  }
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  })
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return { ok: false, error: 'Unauthorized: Only admins can perform this action' }
  }
  return { ok: true }
}

export async function adminResendEmployeeVerificationEmail(userId: string) {
  const gate = await requireAdminSessionForAuthActions()
  if (!gate.ok) return { success: false, error: gate.error }
  const employee = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, emailVerified: true },
  })
  if (!employee) {
    return { success: false, error: 'Employee not found' }
  }
  if (employee.emailVerified) {
    return {
      success: false,
      error: 'This employee is already verified.',
    }
  }
  if (!isAllowedWorkEmail(employee.email)) {
    return { success: false, error: allowedWorkEmailMessage() }
  }

  try {
    await sendEmployeeVerificationInvite(
      employee.email.trim().toLowerCase(),
      employee.name || employee.email
    )
    revalidatePath('/admin/employees')
    revalidatePath('/admin/manage-employees')
    return { success: true }
  } catch (error) {
    console.error('Error resending employee verification email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send verification email',
    }
  }
}

/** @deprecated Password sign-in is disabled. */
export async function adminSendEmployeePasswordReset(_userId: string) {
  const gate = await requireAdminSessionForAuthActions()
  if (!gate.ok) return { success: false, error: gate.error }
  return {
    success: false,
    error: 'Password sign-in is disabled. Employees use Google sign-in.',
  }
}