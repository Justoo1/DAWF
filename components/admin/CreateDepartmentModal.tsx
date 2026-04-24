"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, User, PlusCircle, Loader2, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fetchUsersIdAndName } from "@/lib/actions/users.action";
import { createDepartment } from "@/lib/actions/department.actions";
import { fetchClients } from "@/lib/actions/clients.actions";

type EmployeeRow = {
  id: string;
  name: string;
  email: string;
  clientId: string;
};

export default function CreateDepartmentModal() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [departmentName, setDepartmentName] = useState("");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  const [allEmployees, setAllEmployees] = useState<EmployeeRow[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [managerSearch, setManagerSearch] = useState("");
  const [managerId, setManagerId] = useState<string>("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<EmployeeRow[]>([]);

  useEffect(() => {
    if (!open) return;
    setClientsLoading(true);
    void fetchClients().then((res) => {
      if (res.success && res.clients) {
        setClients([...res.clients]);
      } else {
        setClients([]);
      }
      setClientsLoading(false);
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setEmployeesLoading(true);
    void fetchUsersIdAndName().then((res) => {
      if (res.success && res.users) {
        setAllEmployees(
          res.users
            .filter((u) => u.isActive && u.clientId)
            .map((u) => ({
              id: u.id,
              name: u.name || "Unnamed",
              email: u.email,
              clientId: u.clientId as string,
            }))
        );
      } else {
        setAllEmployees([]);
      }
      setEmployeesLoading(false);
    });
  }, [open]);

  const eligibleManagers = useMemo(
    () =>
      clientId
        ? allEmployees.filter((u) => u.clientId === clientId)
        : [],
    [allEmployees, clientId]
  );

  const pickedManager = useMemo(
    () => eligibleManagers.find((u) => u.id === managerId),
    [eligibleManagers, managerId]
  );

  useEffect(() => {
    if (!managerId || !clientId) return;
    const stillOk = eligibleManagers.some((u) => u.id === managerId);
    if (!stillOk) setManagerId("");
  }, [clientId, eligibleManagers, managerId]);

  const filteredManagerSearch = useMemo(() => {
    const q = managerSearch.trim().toLowerCase();
    if (!q || !clientId) return [];
    return eligibleManagers
      .filter(
        (u) =>
          u.id !== managerId &&
          (u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [managerSearch, eligibleManagers, clientId, managerId]);

  const selectedMemberIds = useMemo(
    () => new Set(selectedMembers.map((m) => m.id)),
    [selectedMembers]
  );

  const filteredMemberSearch = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q || !clientId) return [];
    return eligibleManagers
      .filter(
        (u) =>
          !selectedMemberIds.has(u.id) &&
          (u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [memberSearch, eligibleManagers, clientId, selectedMemberIds]);

  const toggleMember = (emp: EmployeeRow) => {
    setSelectedMembers((prev) => {
      if (prev.some((p) => p.id === emp.id)) {
        return prev.filter((p) => p.id !== emp.id);
      }
      return [...prev, emp];
    });
    setMemberSearch("");
  };

  const removeMember = (id: string) => {
    setSelectedMembers((prev) => prev.filter((p) => p.id !== id));
  };

  const resetForm = () => {
    setDepartmentName("");
    setClientId("");
    setManagerId("");
    setManagerSearch("");
    setMemberSearch("");
    setSelectedMembers([]);
  };

  const handleCreate = async () => {
    if (!departmentName.trim()) {
      toast({
        title: "Error",
        description: "Department name is required",
        variant: "destructive",
      });
      return;
    }
    if (!clientId) {
      toast({
        title: "Error",
        description: "Client is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const deptRes = await createDepartment({
        name: departmentName.trim(),
        clientId,
        managerId: managerId || null,
        employeeIds: selectedMembers.map((m) => m.id),
      });

      if (!deptRes.success) {
        throw new Error(deptRes.error || "Failed to create department");
      }

      const assigned =
        selectedMembers.length + (managerId && !selectedMemberIds.has(managerId) ? 1 : 0);
      const assignNote =
        assigned > 0
          ? ` ${assigned} employee(s) linked to this department.`
          : "";

      toast({
        title: "Department created",
        description: `${departmentName.trim()} has been added.${assignNote}`,
      });

      setOpen(false);
      resetForm();
    } catch (error: unknown) {
      toast({
        title: "Creation failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <PlusCircle className="h-4 w-4" />
          Create Department
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "flex max-h-[min(90vh,920px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[600px]"
        )}
      >
        <DialogHeader className="border-b border-border/60 px-6 py-4 text-left">
          <DialogTitle>Create new department</DialogTitle>
          <DialogDescription>
            Link the unit to a client, name it, optionally assign a manager, and add
            employees from that client to the department.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="dept-client">
              Client <span className="text-destructive">*</span>
            </Label>
            <Select
              value={clientId}
              onValueChange={(v) => {
                setClientId(v);
                setManagerSearch("");
                setMemberSearch("");
                setSelectedMembers([]);
              }}
              disabled={isSubmitting || clientsLoading}
            >
              <SelectTrigger id="dept-client" className="h-11 rounded-lg">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dept-name">Department name</Label>
            <Input
              id="dept-name"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="e.g. Creative Design"
              className="h-11 rounded-lg"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-3">
            <Label>Assign manager</Label>
            <p className="text-xs text-muted-foreground">
              Optional. Only active employees assigned to the selected client are
              listed.
            </p>

            {pickedManager ? (
              <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {pickedManager.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {pickedManager.email}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => {
                    setManagerId("");
                    setManagerSearch("");
                  }}
                  disabled={isSubmitting}
                  aria-label="Clear manager"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  value={managerSearch}
                  onChange={(e) => setManagerSearch(e.target.value)}
                  className="h-11 rounded-lg"
                  placeholder={
                    clientId
                      ? "Search employees to set as manager…"
                      : "Select a client first"
                  }
                  leftIcon={<Search className="h-4 w-4" />}
                  disabled={isSubmitting || !clientId || employeesLoading}
                />
                {employeesLoading && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            )}

            {managerSearch.trim() && filteredManagerSearch.length > 0 && (
              <div className="mt-1 overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                {filteredManagerSearch.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      setManagerId(emp.id);
                      setManagerSearch("");
                    }}
                    className="flex w-full flex-col border-b px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-muted/50"
                  >
                    <span className="font-semibold">{emp.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {emp.email}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 bg-muted/30 px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={
              isSubmitting ||
              !departmentName.trim() ||
              !clientId ||
              clientsLoading
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              "Create Department"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
