import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import Link from 'next/link'

const QuickActions = () => {
  return (
    <div className="gap-6 mb-8 md:grid-cols-2 mt-8 hidden">
        <Card>
            <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid gap-4">
                
                <Link href="/admin/expenses/add" className="text-blue-600 hover:underline">New Expense</Link>
                <Link href="/admin/expenses" className="text-blue-600 hover:underline">View Expenses</Link>
                
                <Link href="/admin/contribution/add" className="text-blue-600 hover:underline">New Contribution</Link>
                <Link href="/admin/contribution" className="text-blue-600 hover:underline">View Contributions</Link>
                
                <Link href="/admin/events/add" className="text-blue-600 hover:underline">New Event</Link>
                <Link href="/admin/events" className="text-blue-600 hover:underline">View Events</Link>
                <Link href="/admin/employees" className="text-blue-600 hover:underline">View Employees</Link>
                
                <Link href="/admin/reports" className="text-blue-600 hover:underline">Generate Report</Link>
                <Link href="/admin/analytics" className="text-blue-600 hover:underline">View Analytics</Link>
            </div>
            </CardContent>
        </Card>
            {/* <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>John Doe contributed 100 cedis</li>
                  <li>Birthday event for Jane Smith</li>
                  <li>New member: Bob Johnson</li>
                  <li>Monthly report generated</li>
                </ul>
              </CardContent>
            </Card> */}
            
    </div>
  )
}

export default QuickActions