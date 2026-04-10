"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Trash2, User, PlusCircle, Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { fetchUsersIdAndName } from "@/lib/actions/users.action";
import { createDepartment } from "@/lib/actions/department.actions";

type Employee = {
  id: string;
  name: string;
  email: string;
  title?: string;
};

export default function CreateDepartmentModal() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [departmentName, setDepartmentName] = useState("");
  const [search, setSearch] = useState("");
  
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee[]>([]);
  const [managerId, setManagerId] = useState<string>("");

  useEffect(() => {
    if (open && allEmployees.length === 0) {
      setIsLoading(true);
      fetchUsersIdAndName().then((res) => {
        if (res.success && res.users) {
          const formatted = res.users
            .filter(u => u.isActive)
            .map((u) => ({
              id: u.id,
              name: u.name || "Unnamed",
              email: u.email,
              title: "Employee" // Placeholder as title isn't tracked in User
            }));
          setAllEmployees(formatted);
        }
        setIsLoading(false);
      });
    }
  }, [open, allEmployees.length]);

  const selectedCount = selected.length;

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    
    // Show unselected employees filtering by search
    if (query) {
      return allEmployees.filter((emp) => {
        return (
          emp.name.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query)
        );
      }).slice(0, 10); // Show max 10 results
    }
    return [];
  }, [search, allEmployees]);

  const toggleEmployee = (emp: Employee) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.id === emp.id);
      if (exists) {
        const next = prev.filter((p) => p.id !== emp.id);
        if (managerId === emp.id) setManagerId(next[0]?.id ?? "");
        return next;
      } else {
        const next = [...prev, emp];
        if (!managerId) setManagerId(emp.id);
        return next;
      }
    });
    setSearch(""); // clear search on selection
  };

  const removeEmployee = (id: string) => {
    setSelected((prev) => {
      const next = prev.filter((emp) => emp.id !== id);
      if (managerId === id) setManagerId(next[0]?.id ?? "");
      return next;
    });
  };

  const handleCreate = async () => {
    if (!departmentName.trim()) {
      toast({ title: "Error", description: "Department name is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const deptRes = await createDepartment({ 
        name: departmentName.trim(), 
        managerId: managerId || null,
        employeeIds: selected.map(e => e.id)
      });

      if (!deptRes.success) {
        throw new Error(deptRes.error || "Failed to create department");
      }

      toast({
        title: "Department created",
        description: `${departmentName.trim()} with ${selectedCount} employee(s)`,
      });
      
      setOpen(false);
      // Reset form
      setDepartmentName("");
      setSelected([]);
      setManagerId("");
      setSearch("");
    } catch (error: unknown) {
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            Name the unit, add employees, and appoint a manager from your team.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
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

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Assign employees</Label>
              <div className="relative">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 rounded-lg"
                  placeholder="Find employees to add…"
                  leftIcon={<Search className="h-4 w-4" />}
                  type="search"
                  disabled={isSubmitting || isLoading}
                />
                {isLoading && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
              
              {/* Dropdown for search results */}
              {search.trim() && filteredEmployees.length > 0 && (
                <div className="border border-border rounded-lg bg-background shadow-sm overflow-hidden mt-1">
                  {filteredEmployees.map(emp => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => toggleEmployee(emp)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 border-b last:border-b-0 flex flex-col transition-colors"
                    >
                      <span className="font-semibold">{emp.name}</span>
                      <span className="text-xs text-muted-foreground">{emp.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Selected ({selectedCount})
              </p>

              {selected.map((emp) => {
                const primary = managerId === emp.id;
                return (
                  <div
                    key={emp.id}
                    className={cn(
                      "flex flex-wrap items-center gap-3 rounded-lg border p-3",
                      primary
                        ? "border-primary/25 bg-primary/5"
                        : "border-border/60 bg-muted/30"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full",
                        primary
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <User className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{emp.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{emp.email}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex cursor-pointer items-center gap-2">
                        <Checkbox
                          checked={managerId === emp.id}
                          onCheckedChange={(checked) => {
                            if (checked) setManagerId(emp.id);
                            else if (managerId === emp.id)
                              setManagerId(selected[0]?.id ?? "");
                          }}
                          disabled={isSubmitting}
                          aria-label={`Set ${emp.name} as manager`}
                        />
                        <span className="text-xs font-medium">Manager</span>
                      </label>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeEmployee(emp.id)}
                        disabled={isSubmitting}
                        aria-label={`Remove ${emp.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 bg-muted/30 px-6 py-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreate} disabled={isSubmitting || !departmentName.trim()}>
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
            ) : "Create Department"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
