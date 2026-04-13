"use client";

import { useToast } from "@/hooks/use-toast";
import { ExpenseValue } from "@/lib/validation";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2Icon, MoreHorizontal } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AddExpensesPage from "./AddExpenses";
import { deleteExpense } from "@/lib/actions/expenses";
import { AdminToolbar } from "@/components/admin/layout/AdminToolbar";
import { AdminSearchField } from "@/components/admin/layout/AdminSearchField";
import { AdminTableCard } from "@/components/admin/layout/AdminTableCard";
import {
  adminFilterSelectTriggerClass,
  adminSelectContentSurfaceClass,
  adminTableClassName,
  adminTbodyRowClass,
  adminTdClass,
  adminThClass,
  adminTheadRowClass,
  adminThSortableClass,
  adminToolbarDividerClass,
  adminToolbarFilterRowClass,
} from "@/lib/admin-ui";
import { cn } from "@/lib/utils";
import { UserAvatarHover } from "./UserAvatarHover";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpensesProps {
  expenses: ExpenseValue[];
}

const Expenses = ({ expenses }: ExpensesProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ExpenseValue | "recipient_name";
    direction: "asc" | "desc";
  }>({ key: "date", direction: "desc" });

  const { toast } = useToast();

  // Get unique types for filter
  const types = Array.from(new Set(expenses.map((e) => e.type))).sort();

  const filteredRecords = expenses
    .filter((record) => {
      const monthName = record.date
        .toLocaleString("default", { month: "long" })
        .toLowerCase();
      const monthNumber = (record.date.getMonth() + 1).toString();
      const matchesSearch =
        record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.recipient || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        monthName.includes(searchTerm.toLowerCase()) ||
        monthNumber.includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" ? true : record.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" ? true : record.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === "recipient_name") {
        aValue = a.user?.name || a.recipient || "";
        bValue = b.user?.name || b.recipient || "";
      } else {
        aValue = a[sortConfig.key as keyof ExpenseValue] ?? "";
        bValue = b[sortConfig.key as keyof ExpenseValue] ?? "";
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const handleSort = (key: keyof ExpenseValue | "recipient_name") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    const deleted = await deleteExpense(id);
    if (deleted.success) {
      toast({
        title: "Deleted",
        description: "Successfully deleted expense",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: deleted.error,
      });
    }
  };

  return (
    <>
      <AdminToolbar className="shadow-premium dark:shadow-black/30">
        {/* Top half: Search */}
        <div className={cn("p-6 px-8 flex-1", adminToolbarDividerClass)}>
          <AdminSearchField
            placeholder="Search expenses by type, status, name, or month..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        {/* Bottom half: Filters */}
        <div className={adminToolbarFilterRowClass}>
          <div className="w-full sm:w-48">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className={adminFilterSelectTriggerClass}>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className={adminSelectContentSurfaceClass}>
                <SelectItem value="all">All Categories</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={adminFilterSelectTriggerClass}>
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent className={adminSelectContentSurfaceClass}>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="APPROVED">Approved Only</SelectItem>
                <SelectItem value="PENDING">Pending Only</SelectItem>
                <SelectItem value="REJECTED">Rejected Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(typeFilter !== "all" || statusFilter !== "all" || searchTerm) && (
            <Button
              variant="ghost"
              className="text-xs text-slate-400 dark:text-zinc-500 hover:text-primary dark:hover:text-emerald-400 h-10 px-2"
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </AdminToolbar>

      <AdminTableCard>
        <table className={adminTableClassName()}>
          <thead>
            <tr className={adminTheadRowClass}>
              <th
                className={cn(adminThClass, adminThSortableClass)}
                onClick={() => handleSort("recipient_name")}
              >
                <div className="flex items-center gap-2">
                  Recipient
                  <SortIcon field="recipient_name" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th
                className={cn(adminThClass, adminThSortableClass)}
                onClick={() => handleSort("type")}
              >
                <div className="flex items-center gap-2">
                  Type
                  <SortIcon field="type" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th
                className={cn(adminThClass, adminThSortableClass)}
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center gap-2">
                  Amount
                  <SortIcon field="amount" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th
                className={cn(adminThClass, adminThSortableClass)}
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-2">
                  Date
                  <SortIcon field="date" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th
                className={cn(adminThClass, adminThSortableClass)}
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon field="status" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th className={cn(adminThClass, "text-right")}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => {
              // Not all expenses have rigorous internal users (could be external recipient)
              const hasUser = !!record.user;
              const initials = hasUser 
                ? (record.user?.name || "?").split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("")
                : (record.recipient || "?").split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");

              return (
                <tr key={record.id} className={adminTbodyRowClass}>
                  <td className={adminTdClass}>
                    <div className="flex items-center gap-4 relative">
                      {hasUser ? (
                        <UserAvatarHover user={record.user as any} initials={initials} />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600">
                          {initials}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{hasUser ? record.user!.name : record.recipient}</span>
                        {hasUser && record.user?.email && (
                          <span className="text-[12px] text-slate-500">{record.user.email}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={adminTdClass}>
                    <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                      {record.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={adminTdClass}>
                    <span className="font-bold text-slate-700">GHS {record.amount}</span>
                  </td>
                  <td className={adminTdClass}>
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-medium">{formatDateTime(record.date).dateOnly}</span>
                      {record.description && (
                        <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{record.description}</span>
                      )}
                    </div>
                  </td>
                  <td className={adminTdClass}>
                    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", 
                        record.status === 'APPROVED' ? "bg-emerald-100 text-emerald-800" : 
                        record.status === 'PENDING' ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                      )}>
                        {record.status}
                    </span>
                  </td>
                  <td className={cn(adminTdClass, "text-right")}>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-primary">
                          <MoreHorizontal className="h-5 w-5" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="w-[300px] rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-lg sm:w-[26rem]"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="mb-2 border-b border-border px-2 py-1.5 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Edit Expense
                          </div>
                          <div className="flex w-full px-2 pb-4">
                            <AddExpensesPage
                              employees={record.user ? [{ id: record.user.id!, name: record.user.name }] : []}
                              expense={record}
                              hideRemoveButton
                              hideAddButton
                              update
                              expenseId={record.id}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 w-full justify-start rounded-lg px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2Icon className="mr-2 h-4 w-4" />
                            Delete Expense
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              )
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

export default Expenses;
