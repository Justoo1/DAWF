'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserValues } from '@/lib/validation'
import { Trash2Icon } from 'lucide-react'
import { deleteUser, revalidateUserPath, updateEmployeeStatus } from '@/lib/actions/users.action'
import { Button } from '../ui/button'
import { useToast } from '@/hooks/use-toast'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

interface EmployeesProps {
    employees: UserValues[]
}

const Employees = ({employees}: EmployeesProps) => {
    const [searchTerm, setSearchTerm] = useState('')
    const { toast } = useToast()

  const filteredRecords = employees.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete =  async (id: string | undefined) => {
    if (!id) return
    const deleted = await deleteUser(id)
    if (deleted.success) {
      revalidateUserPath('/admin/employees')
    }else{
      toast({
        variant: 'destructive',
        title: 'Error',
        description: deleted.error,
      })
    }
  }

  const handleStatusToggle = async (id: string | undefined, currentStatus: boolean | undefined) => {
    if (!id) return
    const newStatus = !currentStatus
    const result = await updateEmployeeStatus(id, newStatus)
    if (result.success) {
      toast({
        title: 'Success',
        description: `Employee marked as ${newStatus ? 'active' : 'inactive'}`,
      })
      revalidateUserPath('/admin/employees')
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Employee</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Contribution</TableHead>
              <TableHead>Total Months</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={record.isActive ?? true}
                      onCheckedChange={() => handleStatusToggle(record.id, record.isActive)}
                      aria-label="Toggle employee status"
                    />
                    <Badge variant={record.isActive ?? true ? 'default' : 'secondary'}>
                      {record.isActive ?? true ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{record.totalAmountContributed}</TableCell>
                <TableCell>{record.totalContributionMonths}</TableCell>
                <TableCell>

                  <Button asChild size='icon' onClick={() => {
                    handleDelete(record.id)
                  }} className='bg-transparent hover:bg-red-600 cursor-pointer'>
                    <Trash2Icon className="size-10 text-red-600 hover:text-white" />
                  </Button>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default Employees