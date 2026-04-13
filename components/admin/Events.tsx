"use client"

import { EventValues } from '@/lib/validation'
import { useToast } from '@/hooks/use-toast'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { PenBoxIcon, Trash2Icon, Cake, Loader2, Award } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { deleteEvent, generateBirthdayEvents, generateAnniversaryEvents } from '@/lib/actions/events.actions'
import EventAdd from './AddEvent'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader"
import { AdminToolbar } from "@/components/admin/layout/AdminToolbar"
import { AdminSearchField } from "@/components/admin/layout/AdminSearchField"
import { AdminTableCard } from "@/components/admin/layout/AdminTableCard"
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
} from "@/lib/admin-ui"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Props {
    events: EventValues[]
}

const AllEvents = ({ events }: Props) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [generatingBirthdays, setGeneratingBirthdays] = useState(false)
    const [generatingAnniversaries, setGeneratingAnniversaries] = useState(false)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
    const [selectedAnniversaryYear, setSelectedAnniversaryYear] = useState(new Date().getFullYear().toString())
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isAnniversaryDialogOpen, setIsAnniversaryDialogOpen] = useState(false)
    const [typeFilter, setTypeFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortConfig, setSortConfig] = useState<{
      key: keyof EventValues;
      direction: "asc" | "desc";
    }>({ key: "start", direction: "desc" });
    const { toast } = useToast()

    // Generate year options (current year to 5 years in the future)
    const currentYear = new Date().getFullYear()
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear + i)

  // Get unique types
  const types = Array.from(new Set(events.map(e => e.type))).sort();

  const filteredRecords = events
    .filter((record) => {
      const monthName = record.start
        .toLocaleString("default", { month: "long" })
        .toLowerCase();
      const monthNumber = (record.start.getMonth() + 1).toString();
      const matchesSearch =
        record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        monthName.includes(searchTerm.toLowerCase()) ||
        monthNumber.includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" ? true : record.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" ? true : record.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const handleSort = (key: keyof EventValues) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return
    const deleted = await deleteEvent(id)
    if (deleted.success) {
        toast({
            title: 'Deleted',
            description: "Successfully deleted event",
        })
    }else{
        toast({
            variant: 'destructive',
            title: 'Error',
            description: deleted.error,
        })
    }
  }

  const handleGenerateBirthdayEvents = async () => {
    setGeneratingBirthdays(true)
    try {
      const year = parseInt(selectedYear)
      const result = await generateBirthdayEvents(year)

      if (result.success) {
        toast({
          title: 'Success!',
          description: `Generated ${result.created} birthday events for ${result.year}. ${result.skipped! > 0 ? `Skipped ${result.skipped} existing events.` : ''}`,
        })
        setIsDialogOpen(false)
        // Reload the page to show new events
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to generate birthday events',
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      })
    } finally {
      setGeneratingBirthdays(false)
    }
  }

  const handleGenerateAnniversaryEvents = async () => {
    setGeneratingAnniversaries(true)
    try {
      const year = parseInt(selectedAnniversaryYear)
      const result = await generateAnniversaryEvents(year)

      if (result.success) {
        toast({
          title: 'Success!',
          description: `Generated ${result.created} work anniversary events for ${result.year}. ${result.skipped! > 0 ? `Skipped ${result.skipped} existing events.` : ''}`,
        })
        setIsAnniversaryDialogOpen(false)
        // Reload the page to show new events
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to generate work anniversary events',
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      })
    } finally {
      setGeneratingAnniversaries(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Events"
        description="Manage welfare and company events."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/events/add">
              <Button className="shadow-sm">Add Event</Button>
            </Link>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="shadow-sm">
                  <Cake className="h-4 w-4" />
                  Generate Birthdays
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Generate Birthday Events</AlertDialogTitle>
                  <AlertDialogDescription>
                    Creates birthday events for employees with a date of birth set. Existing birthday events are skipped.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                  <Label htmlFor="year-select" className="text-sm font-medium">
                    Select Year
                  </Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger id="year-select" className="mt-2">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                          {year === currentYear && ' (Current Year)'}
                          {year === currentYear + 1 && ' (Next Year)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {parseInt(selectedYear) === currentYear
                      ? 'Generate events for the current year'
                      : `Generate events for ${selectedYear}`}
                  </p>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={generatingBirthdays}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleGenerateBirthdayEvents}
                    disabled={generatingBirthdays}
                  >
                    {generatingBirthdays ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating for {selectedYear}...
                      </>
                    ) : (
                      `Generate for ${selectedYear}`
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
              open={isAnniversaryDialogOpen}
              onOpenChange={setIsAnniversaryDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="shadow-sm">
                  <Award className="h-4 w-4" />
                  Generate Anniversaries
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Generate Work Anniversary Events</AlertDialogTitle>
                  <AlertDialogDescription>
                    Creates work anniversary events for active employees with a start date set. Existing events are skipped.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                  <Label htmlFor="anniversary-year-select" className="text-sm font-medium">
                    Select Year
                  </Label>
                  <Select
                    value={selectedAnniversaryYear}
                    onValueChange={setSelectedAnniversaryYear}
                  >
                    <SelectTrigger id="anniversary-year-select" className="mt-2">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                          {year === currentYear && ' (Current Year)'}
                          {year === currentYear + 1 && ' (Next Year)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {parseInt(selectedAnniversaryYear) === currentYear
                      ? 'Generate events for the current year'
                      : `Generate events for ${selectedAnniversaryYear}`}
                  </p>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={generatingAnniversaries}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleGenerateAnniversaryEvents}
                    disabled={generatingAnniversaries}
                  >
                    {generatingAnniversaries ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating for {selectedAnniversaryYear}...
                      </>
                    ) : (
                      `Generate for ${selectedAnniversaryYear}`
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <AdminToolbar className="shadow-premium dark:shadow-black/30">
        {/* Top half: Search */}
        <div className={cn("p-6 px-8 flex items-center justify-between gap-4", adminToolbarDividerClass)}>
          <div className="flex-1">
            <AdminSearchField
              placeholder="Search by title, status, type, month, or location"
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
            <span className="font-semibold text-foreground">{filteredRecords.length}</span>{" "}
            events
          </div>
        </div>

        {/* Bottom half: Filters */}
        <div className={adminToolbarFilterRowClass}>
          <div className="w-full sm:w-48">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className={adminFilterSelectTriggerClass}>
                <SelectValue placeholder="All Event Types" />
              </SelectTrigger>
              <SelectContent className={adminSelectContentSurfaceClass}>
                <SelectItem value="all">All Event Types</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={adminFilterSelectTriggerClass}>
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent className={adminSelectContentSurfaceClass}>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
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

      <AdminTableCard title="All Events">
        <table className={adminTableClassName()}>
          <thead>
            <tr className={adminTheadRowClass}>
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
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center gap-2">
                  Title
                  <SortIcon field="title" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th
                className={cn(adminThClass, adminThSortableClass, "hidden md:table-cell")}
                onClick={() => handleSort("location")}
              >
                <div className="flex items-center gap-2">
                  Location
                  <SortIcon field="location" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th
                className={cn(adminThClass, adminThSortableClass, "hidden lg:table-cell")}
                onClick={() => handleSort("start")}
              >
                <div className="flex items-center gap-2">
                  Start
                  <SortIcon field="start" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th className={cn(adminThClass, "hidden lg:table-cell")}>End</th>
              <th
                className={cn(adminThClass, adminThSortableClass, "w-28")}
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon field="status" activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th className={cn(adminThClass, "w-20 text-right")}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id} className={adminTbodyRowClass}>
                <td className={adminTdClass}>
                  <span className="inline-flex max-w-full rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-tight text-primary">
                    {record.type}
                  </span>
                </td>
                <td className={adminTdClass}>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{record.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground md:hidden">
                      {record.location || "—"}
                    </p>
                  </div>
                </td>
                <td className={cn(adminTdClass, "hidden md:table-cell")}>
                  <span className="text-sm text-muted-foreground">
                    {record.location || "—"}
                  </span>
                </td>
                <td className={cn(adminTdClass, "hidden lg:table-cell")}>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(record.start).dateOnly}
                  </span>
                </td>
                <td className={cn(adminTdClass, "hidden lg:table-cell")}>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(record.end).dateOnly}
                  </span>
                </td>
                <td className={adminTdClass}>
                  <Badge
                    variant={record.status === "ACTIVE" ? "default" : "secondary"}
                    className={cn(
                      "font-normal",
                      record.status === "ACTIVE" && "bg-primary/15 text-primary hover:bg-primary/15"
                    )}
                  >
                    {record.status}
                  </Badge>
                </td>
                <td className={cn(adminTdClass, "text-right")}>
                  <div className="flex items-center justify-end gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={`Edit ${record.title}`}
                        >
                          <PenBoxIcon className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Event</DialogTitle>
                        </DialogHeader>
                        <EventAdd event={record} update userId={record.userId} />
                      </DialogContent>
                    </Dialog>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(record.id)}
                      aria-label={`Delete ${record.title}`}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableCard>
    </div>
  )
}

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

export default AllEvents
