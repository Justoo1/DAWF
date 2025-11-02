"use server"

import prisma from "../prisma"
import { Expense } from "../validation"
import { revalidatePath } from "next/cache"
import { createNotificationForAllUsers } from './notification.actions'

export async function createExpenses(expenses: Expense[]) {
    const createdExpenses = await prisma.$transaction(
      expenses.map((expense) =>
        prisma.expense.create({
          data: {
            ...expense,
            date: new Date(expense.date),
            approvedBy: "Welfare Team",
          }
        })
      )
    )

    // Notify all users about the new expenses
    if (createdExpenses.length > 0) {
      const totalAmount = createdExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      await createNotificationForAllUsers({
        type: 'EXPENSE_ADDED',
        title: 'New Expenses Recorded',
        message: `${createdExpenses.length} new expense(s) totaling GH₵${totalAmount.toFixed(2)} have been recorded.`,
        linkUrl: '/expenses',
      })
    }

    return createdExpenses
  }

  export async function fetchExpenses() {
    try {
      const expenses = await prisma.expense.findMany({
        include: {
          user: true
        }
      })
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
      
      // Calculate the percentage change from last month
      const lastMonthStart = new Date()
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
      lastMonthStart.setDate(1)
      
      const lastMonthExpenses = await prisma.expense.findMany({
        where: {
          date: {
            gte: lastMonthStart,
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
      
      const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      const percentageChange = lastMonthTotal ? ((totalExpenses - lastMonthTotal) / lastMonthTotal) * 100 : 0
  
      return { 
        success: true, 
        expenses,
        totalExpenses,
        percentageChange: percentageChange.toFixed(1)
      }
    } catch (error) {
      console.error('Expense fetch error:', error)
      return { error: 'Failed to fetch expenses' }
    }
}

export async function deleteExpense(expenseId: number) {
  try {
    await prisma.expense.delete({
      where: {
        id: expenseId,
      },
    })
    revalidatePath('/admin/expenses')
    return { success: true }
  } catch (error) {
    console.error('Expense delete error:', error)
    return { error: 'Failed to delete expense' }
  }
}

export async function updateExpense(expenseId: number, expense: Expense) {
  try {
    await prisma.expense.update({
      where: {
        id: expenseId,
      },
      data: {
        ...expense,
        date: new Date(expense.date),
      },
    })
    revalidatePath('/admin/expenses')
    return { success: true }
  } catch (error) {
    console.error('Expense update error:', error)
    return { error: 'Failed to update expense' }
  }
}