'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserValues } from '@/lib/validation'
import { Trash2Icon } from 'lucide-react'
import { deleteUser, revalidateUserPath, updateEmployeeStatus, updateContributorStatus, updateBookingApprovalPermission, updateUserRole, updateUserDepartment } from '@/lib/actions/users.action'
import { Button } from '../ui/button'
import { useToast } from '@/hooks/use-toast'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { EditEmployeeDatesDialog } from './EditEmployeeDatesDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useRouter, useSearchParams } from 'next/navigation'

interface EmployeesProps {
    employees: UserValues[]
    pagination: {
      page: number
      pageSize: number
      totalCount: number
      totalPages: number
    }
    isAdmin: boolean
    isManager: boolean
    isFoodCommittee: boolean
}

const Employees = ({employees, pagination, isAdmin, isManager, isFoodCommittee}: EmployeesProps) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [editingDepartment, setEditingDepartment] = useState<string | null>(null)
    const [departmentValue, setDepartmentValue] = useState('')
    const { toast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()

  const filteredRecords = employees.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`?${params.toString()}`)
  }

  const renderPaginationItems = () => {
    const items = []
    const { page, totalPages } = pagination

    // Always show first page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={page === 1}
          className="cursor-pointer"
        >
          1
        </PaginationLink>
      </PaginationItem>
    )

    // Show ellipsis if current page is far from start
    if (page > 3) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }

    // Show pages around current page
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={page === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    // Show ellipsis if current page is far from end
    if (page < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={page === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

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

  const handleContributorToggle = async (id: string | undefined, currentStatus: boolean | undefined) => {
    if (!id) return
    const newStatus = !currentStatus
    const result = await updateContributorStatus(id, newStatus)
    if (result.success) {
      toast({
        title: 'Success',
        description: `Employee marked as ${newStatus ? 'contributor' : 'non-contributor'}`,
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

  const handleApprovalPermissionToggle = async (id: string | undefined, currentStatus: boolean | undefined) => {
    if (!id) return
    const newStatus = !currentStatus
    const result = await updateBookingApprovalPermission(id, newStatus)
    if (result.success) {
      toast({
        title: 'Success',
        description: `Booking approval permission ${newStatus ? 'granted' : 'revoked'}`,
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

  const handleRoleChange = async (id: string | undefined, newRole: string) => {
    if (!id) return
    const result = await updateUserRole(id, newRole)
    if (result.success) {
      toast({
        title: 'Success',
        description: `Employee role updated to ${newRole}`,
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

  const handleDepartmentEdit = (id: string, currentDepartment: string | null) => {
    setEditingDepartment(id)
    setDepartmentValue(currentDepartment || '')
  }

  const handleDepartmentSave = async (id: string) => {
    const result = await updateUserDepartment(id, departmentValue)
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Department updated successfully',
      })
      setEditingDepartment(null)
      revalidateUserPath('/admin/employees')
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      })
    }
  }

  const handleDepartmentCancel = () => {
    setEditingDepartment(null)
    setDepartmentValue('')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Employee</CardTitle>
        </div>
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
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Active Status</TableHead>
              <TableHead>Contributor Status</TableHead>
              <TableHead>Can Approve Bookings</TableHead>
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
                  {(isAdmin || isFoodCommittee) && editingDepartment === record.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={departmentValue}
                        onChange={(e) => setDepartmentValue(e.target.value)}
                        className="h-8 w-[150px]"
                        placeholder="Department"
                      />
                      <Button size="sm" onClick={() => handleDepartmentSave(record.id!)} className="h-8 px-2">
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleDepartmentCancel} className="h-8 px-2">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{record.department || 'N/A'}</span>
                      {(isAdmin || isFoodCommittee) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDepartmentEdit(record.id!, record.department)}
                          className="h-6 px-2 text-xs"
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {isAdmin ? (
                    <Select
                      value={record.role}
                      onValueChange={(value) => handleRoleChange(record.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMPLOYEE">Employee</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="FOOD_COMMITTEE">Food Committee</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge>{record.role}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <Switch
                        checked={record.isActive ?? true}
                        onCheckedChange={() => handleStatusToggle(record.id, record.isActive)}
                        aria-label="Toggle employee status"
                      />
                    )}
                    <Badge variant={record.isActive ?? true ? 'default' : 'secondary'}>
                      {record.isActive ?? true ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <Switch
                        checked={record.isContributor ?? true}
                        onCheckedChange={() => handleContributorToggle(record.id, record.isContributor)}
                        aria-label="Toggle contributor status"
                      />
                    )}
                    <Badge variant={record.isContributor ?? true ? 'default' : 'outline'}>
                      {record.isContributor ?? true ? 'Contributor' : 'Non-Contributor'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <Switch
                        checked={record.canApproveBookings ?? false}
                        onCheckedChange={() => handleApprovalPermissionToggle(record.id, record.canApproveBookings)}
                        aria-label="Toggle booking approval permission"
                      />
                    )}
                    <Badge variant={record.canApproveBookings ? 'default' : 'outline'}>
                      {record.canApproveBookings ? 'Can Approve' : 'Cannot Approve'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{record.totalAmountContributed}</TableCell>
                <TableCell>{record.totalContributionMonths}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {(isAdmin || isManager) && (
                      <EditEmployeeDatesDialog
                        userId={record.id!}
                        employeeName={record.name}
                        currentStartDate={record.startDate}
                        currentDateOfBirth={record.dateOfBirth}
                        currentExitDate={record.exitDate}
                        isAdmin={isAdmin}
                      />
                    )}
                    {isAdmin && (
                      <Button asChild size='icon' onClick={() => {
                        handleDelete(record.id)
                      }} className='bg-transparent hover:bg-red-600 cursor-pointer'>
                        <Trash2Icon className="size-10 text-red-600 hover:text-white" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
              {pagination.totalCount} employees
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className={pagination.page === 1 ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className={pagination.page === pagination.totalPages ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default Employees