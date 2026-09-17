"use client"

import { useEffect, useState, useTransition } from "react"
import { fetchAuditLogs, type AuditLogRow } from "@/lib/actions/auditLog.actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AdminPaginationBar } from "@/components/admin/layout/AdminPaginationBar"
import { Search, RotateCcw } from "lucide-react"

interface AuditLogsProps {
  initialLogs: AuditLogRow[]
  initialTotal: number
  initialPage: number
  pageSize: number
  actions: string[]
  entityTypes: string[]
}

/** "employee.update_role" -> "Employee • Update role" */
function formatAction(action: string) {
  const [entity, verb] = action.split(".")
  const label = (verb ?? action).replace(/_/g, " ")
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1)
  if (!verb) return capitalized
  const entityLabel = entity.charAt(0).toUpperCase() + entity.slice(1).replace(/_/g, " ")
  return `${entityLabel} • ${capitalized}`
}

function actionVariant(action: string): "default" | "destructive" | "secondary" {
  if (/reject|delete|deactivate|revoke|disable/.test(action)) return "destructive"
  if (/approve|create|activate|grant|enable/.test(action)) return "default"
  return "secondary"
}

function formatTimestamp(d: Date | string) {
  const date = new Date(d)
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const ALL = "__all__"

export function AuditLogs({
  initialLogs,
  initialTotal,
  initialPage,
  pageSize,
  actions,
  entityTypes,
}: AuditLogsProps) {
  const [logs, setLogs] = useState(initialLogs)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState<string>(ALL)
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>(ALL)
  const [isPending, startTransition] = useTransition()

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const load = (nextPage: number) => {
    startTransition(async () => {
      const result = await fetchAuditLogs({
        page: nextPage,
        pageSize,
        search: search.trim() || undefined,
        action: actionFilter === ALL ? undefined : actionFilter,
        entityType: entityTypeFilter === ALL ? undefined : entityTypeFilter,
      })
      if (result.success) {
        setLogs(result.logs)
        setTotal(result.total)
        setPage(result.page)
      }
    })
  }

  // Refetch (from page 1) whenever a filter changes.
  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFilter, entityTypeFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    load(1)
  }

  const resetFilters = () => {
    setSearch("")
    setActionFilter(ALL)
    setEntityTypeFilter(ALL)
  }

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-card p-4 shadow-sm ring-1 ring-border/30 sm:p-6">
      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, action, or description…"
            className="h-10 pl-9"
          />
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="h-10 w-full sm:w-52">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All actions</SelectItem>
            {actions.map((a) => (
              <SelectItem key={a} value={a}>
                {formatAction(a)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
          <SelectTrigger className="h-10 w-full sm:w-44">
            <SelectValue placeholder="All entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All entities</SelectItem>
            {entityTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border/60 px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/60"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </form>

      <div className={isPending ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  No audit log entries match these filters.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap align-top text-xs text-muted-foreground">
                    {formatTimestamp(log.createdAt)}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="text-sm font-medium text-foreground">{log.actorName}</div>
                    <div className="text-xs text-muted-foreground">{log.actorEmail}</div>
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge variant={actionVariant(log.action)} className="whitespace-nowrap">
                      {formatAction(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top text-sm text-foreground/90">
                    {log.description}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPaginationBar
        page={page}
        totalPages={totalPages}
        totalCount={total}
        pageSize={pageSize}
        entityLabel="log entries"
        onPageChange={load}
      />
    </div>
  )
}
