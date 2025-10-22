"use server";

import prisma from "../prisma"

// export async function getFinancialSummary(startDate: Date, endDate: Date) {
//   const testcontributions = await prisma.contribution.findMany({
//     where: {
//       status: 'COMPLETED',
//     },
//     select: {
//       month: true,
//       year: true,
//       amount: true,
//     },
//   });
  
//   console.log("testcontributions", testcontributions);
//     const contributions = await prisma.contribution.groupBy({
//       by: ['year', 'month'],
//       _sum: {
//         amount: true,
//       },
//       where: {
//         month: {
//           gte: startDate,
//           lte: endDate,
//         },
//         status: 'COMPLETED', // Only consider approved contributions
//       },
//       orderBy: [
//         { year: 'asc' },
//         { month: 'asc' },
//       ],
//     })

//     console.log("contributions", contributions)
  
//     const expenses = await prisma.expense.groupBy({
//       by: ['date'],
//       _sum: {
//         amount: true,
//       },
//       where: {
//         date: {
//           gte: startDate,
//           lte: endDate,
//         },
//         status: 'APPROVED', // Only consider approved expenses
//       },
//       orderBy: {
//         date: 'asc',
//       },
//     })
  
//     const events = await prisma.event.groupBy({
//       by: ['type', 'year', 'month'],
//       _count: {
//         id: true,
//       },
//       where: {
//         start: {
//           gte: startDate,
//           lte: endDate,
//         },
//         status: 'ACTIVE', // Only consider active events
//       },
//       orderBy: [
//         { year: 'asc' },
//         { month: 'asc' },
//       ],
//     })
  
//     const totalContribution = await prisma.contribution.aggregate({
//       _sum: {
//         amount: true,
//       },
//       where: {
//         month: {
//           gte: startDate,
//           lte: endDate,
//         },
//         status: 'COMPLETED',
//       },
//     })
  
//     const totalExpenses = await prisma.expense.aggregate({
//       _sum: {
//         amount: true,
//       },
//       where: {
//         date: {
//           gte: startDate,
//           lte: endDate,
//         },
//         status: 'APPROVED',
//       },
//     })
  
//     return {
//       contributions: contributions.map(c => ({
//         ...c,
//         _sum: { amount: c._sum.amount ?? 0 }
//       })),
//       expenses: expenses.map(e => ({
//         ...e,
//         _sum: { amount: e._sum.amount ?? 0 }
//       })),
//       events,
//       totalContribution: totalContribution._sum.amount ?? 0,
//       totalExpenses: totalExpenses._sum.amount ?? 0,
//     }
// }

type ContributionGroup = {
  [key: string]: {
    year: number;
    month: number;
    total: number;
  };
};

export async function getFinancialSummary(startDate: Date, endDate: Date) {
  // Normalize startDate and endDate to the start and end of their respective months
  const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const endOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);

  // Fetch raw contributions data
  const rawContributions = await prisma.contribution.findMany({
    where: {
      month: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      status: 'COMPLETED', // Only consider completed contributions
    },
    select: {
      month: true,
      year: true,
      amount: true,
    },
  });

  // Group contributions by year and month
  const groupedContributions: ContributionGroup = rawContributions.reduce((acc: ContributionGroup, curr) => {
    const key = `${curr.year}-${new Date(curr.month).getMonth() + 1}`;
    if (!acc[key]) {
      acc[key] = { year: curr.year, month: new Date(curr.month).getMonth() + 1, total: 0 };
    }
    acc[key].total += curr.amount;
    return acc;
  }, {});

  const contributions = Object.values(groupedContributions);

  // Fetch expenses data
  const expenses = await prisma.expense.groupBy({
    by: ['date'],
    _sum: { amount: true },
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      status: 'APPROVED', // Only consider approved expenses
    },
    orderBy: { date: 'asc' },
  });

  // Fetch events data
  const events = await prisma.event.groupBy({
    by: ['type', 'year', 'month'],
    _count: { id: true },
    where: {
      start: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      status: 'ACTIVE', // Only consider active events
    },
    orderBy: [
      { year: 'asc' },
      { month: 'asc' },
    ],
  });

  // Fetch total contributions
  const totalContribution = await prisma.contribution.aggregate({
    _sum: { amount: true },
    where: {
      month: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      status: 'COMPLETED',
    },
  });

  // Fetch total expenses
  const totalExpenses = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      status: 'APPROVED',
    },
  });

  // Return the financial summary
  return {
    contributions: contributions.map(c => ({
      year: c.year,
      month: c.month,
      _sum: { amount: c.total ?? 0 },
    })),
    expenses: expenses.map(e => ({
      date: e.date,
      _sum: { amount: e._sum.amount ?? 0 },
    })),
    events,
    totalContribution: totalContribution._sum.amount ?? 0,
    totalExpenses: totalExpenses._sum.amount ?? 0,
  };
}

/**
 * Get contribution report by employee
 */
export async function getContributionsByEmployee(startDate: Date, endDate: Date) {
  const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const endOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);

  const users = await prisma.user.findMany({
    include: {
      contributions: {
        where: {
          month: { gte: startOfMonth, lte: endOfMonth },
          status: 'COMPLETED'
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  return users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department,
    totalContributions: user.contributions.reduce((sum, c) => sum + c.amount, 0),
    monthsContributed: user.contributions.length,
    averagePerMonth: user.contributions.length > 0
      ? user.contributions.reduce((sum, c) => sum + c.amount, 0) / user.contributions.length
      : 0,
    contributions: user.contributions.map(c => ({
      amount: c.amount,
      month: c.month,
      year: c.year
    }))
  }));
}

/**
 * Get expense report by type
 */
export async function getExpensesByType(startDate: Date, endDate: Date) {
  const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const endOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);

  const expenses = await prisma.expense.groupBy({
    by: ['type'],
    _sum: { amount: true },
    _count: { id: true },
    where: {
      date: { gte: startOfMonth, lte: endOfMonth },
      status: 'APPROVED'
    }
  });

  // Also get detailed expenses
  const detailedExpenses = await prisma.expense.findMany({
    where: {
      date: { gte: startOfMonth, lte: endOfMonth },
      status: 'APPROVED'
    },
    orderBy: {
      date: 'desc'
    }
  });

  return {
    summary: expenses.map(expense => ({
      type: expense.type,
      totalAmount: expense._sum.amount || 0,
      count: expense._count.id,
      averagePerExpense: expense._count.id > 0
        ? (expense._sum.amount || 0) / expense._count.id
        : 0
    })),
    details: detailedExpenses.map(e => ({
      id: e.id,
      type: e.type,
      amount: e.amount,
      date: e.date,
      recipient: e.recipient,
      description: e.description,
      approvedBy: e.approvedBy
    }))
  };
}

/**
 * Get event summary report
 */
export async function getEventSummary(startDate: Date, endDate: Date) {
  const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const endOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);

  const eventsByType = await prisma.event.groupBy({
    by: ['type'],
    _count: { id: true },
    where: {
      start: { gte: startOfMonth, lte: endOfMonth },
      status: 'ACTIVE'
    }
  });

  const events = await prisma.event.findMany({
    where: {
      start: { gte: startOfMonth, lte: endOfMonth },
      status: 'ACTIVE'
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      start: 'desc'
    }
  });

  return {
    summary: eventsByType.map(e => ({
      type: e.type,
      count: e._count.id
    })),
    details: events.map(e => ({
      id: e.id,
      type: e.type,
      title: e.title,
      start: e.start,
      end: e.end,
      description: e.description,
      location: e.location,
      user: e.user.name
    }))
  };
}

/**
 * Get quarterly comparison data
 */
export async function getQuarterlyComparison(year: number) {
  const quarters = [1, 2, 3, 4];

  const quarterlyData = await Promise.all(
    quarters.map(async (quarter) => {
      const contributions = await prisma.contribution.aggregate({
        _sum: { amount: true },
        where: {
          year,
          quarter,
          status: 'COMPLETED'
        }
      });

      // Calculate quarter date range for expenses
      const startMonth = (quarter - 1) * 3;
      const startDate = new Date(year, startMonth, 1);
      const endDate = new Date(year, startMonth + 3, 0);

      const expenses = await prisma.expense.aggregate({
        _sum: { amount: true },
        where: {
          date: { gte: startDate, lte: endDate },
          status: 'APPROVED'
        }
      });

      const events = await prisma.event.count({
        where: {
          year,
          quarter,
          status: 'ACTIVE'
        }
      });

      return {
        quarter: `Q${quarter}`,
        contributions: contributions._sum.amount || 0,
        expenses: expenses._sum.amount || 0,
        net: (contributions._sum.amount || 0) - (expenses._sum.amount || 0),
        events
      };
    })
  );

  return quarterlyData;
}
