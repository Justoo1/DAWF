"use client";

import { useState } from "react";
import { UserValues } from "@/lib/validation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { KeyRound, Mail, Pencil, Trash2Icon, MoreHorizontal } from "lucide-react";
import { UserAvatarHover } from "./UserAvatarHover";
import {
  adminResendEmployeeVerificationEmail,
  adminSendEmployeePasswordReset,
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
import { EditEmployeeDialog } from "./EditEmployeeDialog";
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState<"all" | "unverified">("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserValues;
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });
  const [editingEmployee, setEditingEmployee] = useState<UserValues | null>(
    null
  );

  // Get unique departments for filter
  const departments = Array.from(
    new Set(employees.map((e) => e.department).filter(Boolean))
  ).sort() as string[];

  const clientFilterOptions = (() => {
    const map = new Map<string, string>();
    for (const e of employees) {
      const id = e.clientId;
      if (!id) continue;
      const label = e.clientName?.trim() || id;
      if (!map.has(id)) map.set(id, label);
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  })();

  const filteredRecords = employees
    .filter((record) => {
      const q = searchTerm.toLowerCase()
      const matchesSearch =
        record.name.toLowerCase().includes(q) ||
        record.email.toLowerCase().includes(q) ||
        (record.clientName?.toLowerCase().includes(q) ?? false) ||
        (record.phoneNumber?.toLowerCase().includes(q) ?? false);
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? record.isActive
          : !record.isActive;
      const matchesDept =
        deptFilter === "all" ? true : record.department === deptFilter;
      const matchesClient =
        clientFilter === "all" ? true : record.clientId === clientFilter;
      const needsEmailVerification =
        !record.emailVerified || !!record.pendingInvite;
      const matchesVerification =
        verificationFilter === "all" || needsEmailVerification;
      return (
        matchesSearch &&
        matchesStatus &&
        matchesDept &&
        matchesClient &&
        matchesVerification
      );
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const handleSort = (key: keyof UserValues) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

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

  const handleResendVerification = async (userId: string | undefined) => {
    if (!userId) return;
    const result = await adminResendEmployeeVerificationEmail(userId);
    if (result.success) {
      toast({
        title: "Verification email sent",
        description: "They can use the link to verify and set a password.",
      });
      revalidateUserPath("/admin/employees");
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Could not send",
        description: result.error,
      });
    }
  };

  const handleSendPasswordReset = async (userId: string | undefined) => {
    if (!userId) return;
    const result = await adminSendEmployeePasswordReset(userId);
    if (result.success) {
      toast({
        title: "Password reset sent",
        description: "If the email exists, they will receive a reset link.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Could not send",
        description: result.error,
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
      <EditEmployeeDialog
        employee={editingEmployee}
        open={editingEmployee != null}
        onOpenChange={(open) => {
          if (!open) setEditingEmployee(null);
        }}
      />
      <AdminToolbar>
        {/* Top half: Search */}
        <div className="p-6 px-8 border-b border-slate-100">
          <AdminSearchField
            placeholder="Search employees by name, ID or email..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        {/* Bottom half: Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-3 sm:gap-4 px-6 sm:px-8 py-5 bg-white">
          <div className="w-full sm:w-48">
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="h-10 rounded-lg border-slate-200 text-[13px] font-medium text-slate-600 bg-white shadow-sm">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-48">
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="h-10 rounded-lg border-slate-200 text-[13px] font-medium text-slate-600 bg-white shadow-sm">
                <SelectValue placeholder="All clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All clients</SelectItem>
                {clientFilterOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 rounded-lg border-slate-200 text-[13px] font-medium text-slate-600 bg-white shadow-sm">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isAdmin && (
            <div className="w-full sm:w-48">
              <Select
                value={verificationFilter}
                onValueChange={(v) =>
                  setVerificationFilter(v as "all" | "unverified")
                }
              >
                <SelectTrigger className="h-10 rounded-lg border-slate-200 text-[13px] font-medium text-slate-600 bg-white shadow-sm">
                  <SelectValue placeholder="Email verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Email: All</SelectItem>
                  <SelectItem value="unverified">Email: Not verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(deptFilter !== "all" ||
            clientFilter !== "all" ||
            statusFilter !== "all" ||
            verificationFilter !== "all" ||
            searchTerm) && (
            <Button 
              variant="ghost" 
              className="text-xs text-slate-400 hover:text-primary h-10 px-2"
              onClick={() => {
                setSearchTerm("");
                setDeptFilter("all");
                setClientFilter("all");
                setStatusFilter("all");
                setVerificationFilter("all");
              }}
            >
              Reset Filters
            </Button>
          )}
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
              <th className={cn(adminThClass, "cursor-pointer hover:bg-slate-50 transition-colors group")} onClick={() => handleSort("name")}>
                <div className="flex items-center gap-2">
                  Employee Name
                  <SortIcon field="name" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th className={cn(adminThClass, "cursor-pointer hover:bg-slate-50 transition-colors group")} onClick={() => handleSort("department")}>
                <div className="flex items-center gap-2">
                  Department
                  <SortIcon field="department" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th className={cn(adminThClass, "cursor-pointer hover:bg-slate-50 transition-colors group")} onClick={() => handleSort("clientName" as keyof UserValues)}>
                <div className="flex items-center gap-2">
                  Client
                  <SortIcon field="clientName" activeField={String(sortConfig.key)} direction={sortConfig.direction} />
                </div>
              </th>
              <th className={adminThClass}>Contributions</th>
              <th className={cn(adminThClass, "cursor-pointer hover:bg-slate-50 transition-colors group")} onClick={() => handleSort("isActive")}>
                <div className="flex items-center gap-2">
                  Role & Status
                  <SortIcon field="isActive" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
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
              const needsEmailVerification =
                !record.emailVerified || !!record.pendingInvite;

              return (
                <tr
                  key={record.id}
                  className={cn(
                    adminTbodyRowClass,
                    isAdmin &&
                      "cursor-pointer hover:bg-slate-50/90 transition-colors"
                  )}
                  onClick={
                    isAdmin
                      ? () => setEditingEmployee(record)
                      : undefined
                  }
                  onKeyDown={
                    isAdmin
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setEditingEmployee(record);
                          }
                        }
                      : undefined
                  }
                  tabIndex={isAdmin ? 0 : undefined}
                  aria-label={
                    isAdmin
                      ? `Edit employee ${record.name}`
                      : undefined
                  }
                >
                  <td className={adminTdClass}>
                    <div className="flex items-center gap-4 relative">
                      <UserAvatarHover initials={initials} />
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-900">{record.name}</span>
                        <span className="text-[12px] text-slate-500">{record.email}</span>
                        {needsEmailVerification ? (
                          <Badge variant="outline" className="w-fit text-[10px] border-amber-300 text-amber-800 bg-amber-50">
                            {record.pendingInvite
                              ? "Awaiting email verification"
                              : "Email not verified"}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className={adminTdClass}>
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-[800] tracking-widest text-slate-600 uppercase">
                      {record.department || "N/A"}
                    </span>
                  </td>
                  <td className={adminTdClass}>
                    <span className="text-[13px] font-medium text-slate-700">
                      {record.clientName || "—"}
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
                    <div className="flex flex-wrap items-center gap-2">
                       <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", 
                          record.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        )}>
                          {record.isActive ? "ACTIVE" : "INACTIVE"}
                       </span>
                       <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                         {record.role}
                       </span>
                       {needsEmailVerification ? (
                         <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                           UNVERIFIED
                         </span>
                       ) : (
                         <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                           VERIFIED
                         </span>
                       )}
                    </div>
                  </td>
                  <td
                    className={cn(adminTdClass, "text-right")}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-primary">
                          <MoreHorizontal className="h-5 w-5" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[240px] p-2 rounded-2xl shadow-lg border-slate-100 bg-white">
                        <div className="flex flex-col gap-1">
                          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Actions
                          </div>
                          {isAdmin && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start h-9 rounded-lg px-2 text-slate-700"
                              onClick={() => setEditingEmployee(record)}
                            >
                              <Pencil className="mr-2 h-4 w-4 shrink-0" />
                              Edit employee
                            </Button>
                          )}
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
                          {isAdmin && needsEmailVerification && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start h-9 rounded-lg px-2 text-slate-700"
                              onClick={() => handleResendVerification(record.id)}
                            >
                              <Mail className="mr-2 h-4 w-4 shrink-0" />
                              Resend verification email
                            </Button>
                          )}
                          {isAdmin && !needsEmailVerification && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start h-9 rounded-lg px-2 text-slate-700"
                              onClick={() => handleSendPasswordReset(record.id)}
                            >
                              <KeyRound className="mr-2 h-4 w-4 shrink-0" />
                              Send password reset
                            </Button>
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

function SortIcon({ field, activeField, direction }: { field: string, activeField: string, direction: "asc" | "desc" }) {
  if (field !== activeField) return <div className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5-5" /></svg></div>;
  return (
    <div className="w-4 h-4 text-primary">
      {direction === "asc" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11l5-5 5 5M12 19V6"/></svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13l5 5 5-5M12 5v13"/></svg>
      )}
    </div>
  );
}

export default Employees;
