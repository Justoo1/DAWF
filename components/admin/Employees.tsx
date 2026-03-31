"use client";

import { useState } from "react";
import { UserValues } from "@/lib/validation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2Icon, MoreHorizontal } from "lucide-react";
import { UserAvatarHover } from "./UserAvatarHover";
import {
  deleteUser,
  revalidateUserPath,
  updateEmployeeStatus,
  updateContributorStatus,
  updateBookingApprovalPermission,
  updateUserRole,
  updateUserDepartment,
} from "@/lib/actions/users.action";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { EditEmployeeDatesDialog } from "./EditEmployeeDatesDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminToolbar } from "@/components/admin/layout/AdminToolbar";
import { AdminSearchField } from "@/components/admin/layout/AdminSearchField";
import { AdminTableCard } from "@/components/admin/layout/AdminTableCard";
import { AdminPaginationBar } from "@/components/admin/layout/AdminPaginationBar";
import {
  adminTableClassName,
  adminTbodyRowClass,
  adminTdClass,
  adminThClass,
  adminTheadRowClass,
} from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

interface EmployeesProps {
  employees: UserValues[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  isAdmin: boolean;
  isManager: boolean;
  isFoodCommittee: boolean;
}

const Employees = ({
  employees,
  pagination,
  isAdmin,
  isManager,
  isFoodCommittee,
}: EmployeesProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingDepartment, setEditingDepartment] = useState<string | null>(
    null
  );
  const [departmentValue, setDepartmentValue] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const filteredRecords = employees.filter((record) =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    const deleted = await deleteUser(id);
    if (deleted.success) {
      revalidateUserPath("/admin/employees");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: deleted.error,
      });
    }
  };

  const handleStatusToggle = async (
    id: string | undefined,
    currentStatus: boolean | undefined
  ) => {
    if (!id) return;
    const newStatus = !currentStatus;
    const result = await updateEmployeeStatus(id, newStatus);
    if (result.success) {
      toast({
        title: "Success",
        description: `Employee marked as ${newStatus ? "active" : "inactive"}`,
      });
      revalidateUserPath("/admin/employees");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  const handleContributorToggle = async (
    id: string | undefined,
    currentStatus: boolean | undefined
  ) => {
    if (!id) return;
    const newStatus = !currentStatus;
    const result = await updateContributorStatus(id, newStatus);
    if (result.success) {
      toast({
        title: "Success",
        description: `Employee marked as ${newStatus ? "contributor" : "non-contributor"}`,
      });
      revalidateUserPath("/admin/employees");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  const handleApprovalPermissionToggle = async (
    id: string | undefined,
    currentStatus: boolean | undefined
  ) => {
    if (!id) return;
    const newStatus = !currentStatus;
    const result = await updateBookingApprovalPermission(id, newStatus);
    if (result.success) {
      toast({
        title: "Success",
        description: `Booking approval permission ${newStatus ? "granted" : "revoked"}`,
      });
      revalidateUserPath("/admin/employees");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  const handleRoleChange = async (id: string | undefined, newRole: string) => {
    if (!id) return;
    const result = await updateUserRole(id, newRole);
    if (result.success) {
      toast({
        title: "Success",
        description: `Employee role updated to ${newRole}`,
      });
      revalidateUserPath("/admin/employees");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  const handleDepartmentEdit = (id: string, currentDepartment: string | null) => {
    setEditingDepartment(id);
    setDepartmentValue(currentDepartment || "");
  };

  const handleDepartmentSave = async (id: string) => {
    const result = await updateUserDepartment(id, departmentValue);
    if (result.success) {
      toast({
        title: "Success",
        description: "Department updated successfully",
      });
      setEditingDepartment(null);
      revalidateUserPath("/admin/employees");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  const handleDepartmentCancel = () => {
    setEditingDepartment(null);
    setDepartmentValue("");
  };

  return (
    <>
      <AdminToolbar>
        {/* Top half: Search */}
        <div className="p-5 px-6 border-b border-slate-100">
          <AdminSearchField
            placeholder="Search employees by name, ID or email..."
            value={searchTerm}
            onChange={setSearchTerm}
            inputClassName="border-0 bg-transparent pl-10 shadow-none text-slate-700 h-6"
          />
        </div>
        {/* Bottom half: Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 bg-white">
          <Button variant="outline" className="h-10 w-full sm:w-auto justify-between sm:justify-center rounded-lg border-slate-200 text-[13px] font-medium text-slate-600 bg-white shadow-sm px-4">
            All Departments
            <svg className="sm:ml-2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </Button>
          <Button variant="outline" className="h-10 w-full sm:w-auto justify-between sm:justify-center rounded-lg border-slate-200 text-[13px] font-medium text-slate-600 bg-white shadow-sm px-4">
            Status: Active
            <svg className="sm:ml-2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          </Button>
        </div>
      </AdminToolbar>

      <AdminTableCard
        footer={
          <AdminPaginationBar
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            entityLabel="employees"
            onPageChange={handlePageChange}
          />
        }
      >
        <table className={adminTableClassName()}>
          <thead>
            <tr className={adminTheadRowClass}>
              <th className={adminThClass}>Employee Name</th>
              <th className={adminThClass}>Department</th>
              <th className={adminThClass}>Contributions</th>
              <th className={adminThClass}>Role & Status</th>
              <th className={cn(adminThClass, "text-right")}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => {
              const initials = (record.name || record.email || "?")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((s) => s[0]?.toUpperCase())
                .join("");

              return (
                <tr key={record.id} className={adminTbodyRowClass}>
                  <td className={adminTdClass}>
                    <div className="flex items-center gap-4 relative">
                      <UserAvatarHover user={record as any} initials={initials} />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{record.name}</span>
                        <span className="text-[12px] text-slate-500">{record.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className={adminTdClass}>
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-[800] tracking-widest text-slate-600 uppercase">
                      {record.department || "N/A"}
                    </span>
                  </td>
                  <td className={adminTdClass}>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                        {String(record.totalContributionMonths || 0).padStart(2, '0')}
                      </span>
                      <span className="text-[12px] text-slate-400 font-medium">Total months</span>
                    </div>
                  </td>
                  <td className={adminTdClass}>
                    <div className="flex items-center gap-2">
                       <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", 
                          record.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        )}>
                          {record.isActive ? "ACTIVE" : "INACTIVE"}
                       </span>
                       <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                         {record.role}
                       </span>
                    </div>
                  </td>
                  <td className={cn(adminTdClass, "text-right")}>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-primary">
                          <MoreHorizontal className="h-5 w-5" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[200px] p-2 rounded-2xl shadow-lg border-slate-100 bg-white">
                        <div className="flex flex-col gap-1">
                          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Actions
                          </div>
                          {(isAdmin || isManager) && (
                             <div className="flex w-full">
                                <EditEmployeeDatesDialog
                                  userId={record.id!}
                                  employeeName={record.name}
                                  currentStartDate={record.startDate}
                                  currentDateOfBirth={record.dateOfBirth}
                                  currentExitDate={record.exitDate}
                                  isAdmin={isAdmin}
                                />
                             </div>
                          )}
                          {isAdmin && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 h-9 rounded-lg px-2"
                              onClick={() => handleDelete(record.id)}
                            >
                              <Trash2Icon className="mr-2 h-4 w-4" />
                              Delete Employee
                            </Button>
                          )}
                          {!isAdmin && !isManager && (
                            <div className="px-2 py-2 text-sm text-slate-400">No actions available</div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </AdminTableCard>
    </>
  );
};

export default Employees;
