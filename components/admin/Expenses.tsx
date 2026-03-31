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
  adminTableClassName,
  adminTbodyRowClass,
  adminTdClass,
  adminThClass,
  adminTheadRowClass,
} from "@/lib/admin-ui";
import { cn } from "@/lib/utils";
import { UserAvatarHover } from "./UserAvatarHover";

interface ExpensesProps {
  expenses: ExpenseValue[];
}

const Expenses = ({ expenses }: ExpensesProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredRecords = expenses.filter((record) => {
    const monthName = record.date
      .toLocaleString("default", { month: "long" })
      .toLowerCase();
    const monthNumber = (record.date.getMonth() + 1).toString();
    return (
      record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      monthName.includes(searchTerm.toLowerCase()) ||
      monthNumber.includes(searchTerm.toLowerCase())
    );
  });

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
      <AdminToolbar>
        <div className="p-4 px-6 border-b border-slate-100 flex-1">
          <AdminSearchField
            placeholder="Search expenses by type, status, or month..."
            value={searchTerm}
            onChange={setSearchTerm}
            inputClassName="border-0 bg-transparent pl-10 shadow-none text-slate-700 h-6"
          />
        </div>
      </AdminToolbar>

      <AdminTableCard>
        <table className={adminTableClassName()}>
          <thead>
            <tr className={adminTheadRowClass}>
              <th className={adminThClass}>Recipient</th>
              <th className={adminThClass}>Type</th>
              <th className={adminThClass}>Amount</th>
              <th className={adminThClass}>Date</th>
              <th className={adminThClass}>Status</th>
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
                      <PopoverContent align="end" className="w-[300px] sm:w-[26rem] p-4 rounded-2xl shadow-lg border-slate-100 bg-white">
                        <div className="flex flex-col gap-2">
                          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2">
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
                            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 h-9 rounded-lg px-2"
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

export default Expenses;
