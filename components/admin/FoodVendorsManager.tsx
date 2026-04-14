"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminPageContent } from "@/components/admin/layout/AdminPageContent"
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader"
import { AdminTableCard } from "@/components/admin/layout/AdminTableCard"
import {
  adminTableClassName,
  adminTdClass,
  adminThClass,
  adminTheadRowClass,
  adminTbodyRowClass,
} from "@/lib/admin-ui"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import FoodVendorForm from "@/components/admin/FoodVendorForm"
import {
  setFoodVendorActive,
  permanentlyDeleteFoodVendor,
} from "@/lib/actions/foodVendor.actions"
import { Building2, Mail, Phone, User, MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react"

export type FoodVendorRow = {
  id: string
  name: string
  contactName: string | null
  phone: string | null
  email: string | null
  description: string | null
  isActive: boolean
}

function rowToFormVendor(v: FoodVendorRow) {
  return {
    id: v.id,
    name: v.name,
    contactName: v.contactName ?? undefined,
    phone: v.phone ?? undefined,
    email: v.email ?? undefined,
    description: v.description ?? undefined,
    isActive: v.isActive,
  }
}

type VendorModalState =
  | null
  | { mode: "add" }
  | { mode: "edit"; vendor: FoodVendorRow }

interface FoodVendorsPageContentProps {
  vendors: FoodVendorRow[]
  totalVendors: number
  initialEditId?: string
  initialAdd?: boolean
}

/** Full vendors admin UI: header (add opens modal), stats, clickable table, edit/disable/delete. */
export function FoodVendorsPageContent({
  vendors,
  totalVendors,
  initialEditId,
  initialAdd,
}: FoodVendorsPageContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [vendorModal, setVendorModal] = useState<VendorModalState>(null)
  const [deleteTarget, setDeleteTarget] = useState<FoodVendorRow | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  useEffect(() => {
    if (initialAdd) {
      setVendorModal({ mode: "add" })
      router.replace(pathname, { scroll: false })
    }
  }, [initialAdd, pathname, router])

  useEffect(() => {
    if (initialEditId && vendors.length > 0) {
      const v = vendors.find((x) => x.id === initialEditId)
      if (v) {
        setVendorModal({ mode: "edit", vendor: v })
      }
      router.replace(pathname, { scroll: false })
    }
  }, [initialEditId, vendors, pathname, router])

  const closeModal = () => setVendorModal(null)

  const onFormSuccess = () => {
    closeModal()
    router.refresh()
  }

  const toggleActive = async (row: FoodVendorRow, next: boolean) => {
    const res = await setFoodVendorActive(row.id, next)
    if (res.success) {
      toast({
        title: next ? "Vendor enabled" : "Vendor disabled",
        description: next
          ? `${row.name} is active and can be used for menus.`
          : `${row.name} is inactive and hidden from active vendor lists.`,
      })
      router.refresh()
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "error" in res ? res.error : "Could not update vendor",
      })
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteBusy(true)
    const res = await permanentlyDeleteFoodVendor(deleteTarget.id)
    setDeleteBusy(false)
    if (res.success) {
      toast({
        title: "Vendor deleted",
        description: `${deleteTarget.name} has been permanently removed.`,
      })
      setDeleteTarget(null)
      router.refresh()
    } else {
      toast({
        variant: "destructive",
        title: "Could not delete",
        description: "error" in res ? res.error : "Delete failed",
      })
    }
  }

  const openRow = (v: FoodVendorRow) => {
    setVendorModal({ mode: "edit", vendor: v })
  }

  const activeVendors = vendors.filter((v) => v.isActive)
  const inactiveVendors = vendors.filter((v) => !v.isActive)

  const isAdd = vendorModal?.mode === "add"
  const editVendor = vendorModal?.mode === "edit" ? vendorModal.vendor : null

  return (
    <AdminPageContent>
      <VendorDialogs
        open={!!vendorModal}
        isAdd={!!isAdd}
        editVendor={editVendor}
        onOpenChange={(open) => {
          if (!open) closeModal()
        }}
        onFormSuccess={onFormSuccess}
        onCancel={closeModal}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete vendor permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes <strong>{deleteTarget?.name}</strong>, its weekly menus, and food catalog
              entries for this vendor. Employee selections tied to those menus will be removed. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteBusy}
              onClick={() => void confirmDelete()}
            >
              {deleteBusy ? "Deleting…" : "Delete permanently"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdminPageHeader
        title="Food Vendors"
        description="Manage vendor profiles and availability."
        action={
          <Button type="button" className="shadow-sm" onClick={() => setVendorModal({ mode: "add" })}>
            Add vendor
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">{totalVendors}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Active Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">{activeVendors.length}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm ring-1 ring-border/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Inactive Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">{inactiveVendors.length}</div>
          </CardContent>
        </Card>
      </div>

      <AdminTableCard title="Vendors">
        {vendors.length > 0 ? (
          <table className={adminTableClassName()}>
            <thead>
              <tr className={adminTheadRowClass}>
                <th className={adminThClass}>Vendor</th>
                <th className={cn(adminThClass, "hidden lg:table-cell")}>Contact</th>
                <th className={cn(adminThClass, "hidden xl:table-cell")}>Phone</th>
                <th className={cn(adminThClass, "hidden xl:table-cell")}>Email</th>
                <th className={cn(adminThClass, "w-28")}>Status</th>
                <th className={cn(adminThClass, "w-28 text-right")}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className={cn(
                    adminTbodyRowClass,
                    "cursor-pointer hover:bg-muted/40 transition-colors"
                  )}
                  onClick={() => openRow(vendor)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      openRow(vendor)
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Edit vendor ${vendor.name}`}
                >
                  <td className={adminTdClass}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{vendor.name}</p>
                        {vendor.description ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {vendor.description}
                          </p>
                        ) : null}
                        <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground lg:hidden">
                          {vendor.contactName ? (
                            <span className="inline-flex items-center gap-2">
                              <User className="h-3.5 w-3.5" />
                              {vendor.contactName}
                            </span>
                          ) : null}
                          {vendor.phone ? (
                            <span className="inline-flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5" />
                              {vendor.phone}
                            </span>
                          ) : null}
                          {vendor.email ? (
                            <span className="inline-flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5" />
                              {vendor.email}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={cn(adminTdClass, "hidden lg:table-cell")}>
                    <span className="text-sm text-muted-foreground">{vendor.contactName || "—"}</span>
                  </td>
                  <td className={cn(adminTdClass, "hidden xl:table-cell")}>
                    <span className="text-sm text-muted-foreground">{vendor.phone || "—"}</span>
                  </td>
                  <td className={cn(adminTdClass, "hidden xl:table-cell")}>
                    <span className="text-sm text-muted-foreground">{vendor.email || "—"}</span>
                  </td>
                  <td className={adminTdClass}>
                    <Badge
                      variant={vendor.isActive ? "default" : "secondary"}
                      className={cn(
                        "font-normal",
                        vendor.isActive && "bg-primary/15 text-primary hover:bg-primary/15"
                      )}
                    >
                      {vendor.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className={cn(adminTdClass, "text-right")} onClick={(e) => e.stopPropagation()}>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-primary"
                          aria-label="Vendor actions"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="w-[240px] rounded-2xl border border-border bg-popover p-2 shadow-lg"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Actions
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 w-full justify-start rounded-lg px-2"
                            onClick={() => setVendorModal({ mode: "edit", vendor })}
                          >
                            <Pencil className="mr-2 h-4 w-4 shrink-0" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 w-full justify-start rounded-lg px-2"
                            onClick={() => void toggleActive(vendor, !vendor.isActive)}
                          >
                            <Power className="mr-2 h-4 w-4 shrink-0" />
                            {vendor.isActive ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 w-full justify-start rounded-lg px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleteTarget(vendor)}
                          >
                            <Trash2 className="mr-2 h-4 w-4 shrink-0" />
                            Delete permanently
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-sm text-muted-foreground">
            No vendors found.{" "}
            <button
              type="button"
              className="text-primary underline"
              onClick={() => setVendorModal({ mode: "add" })}
            >
              Add your first vendor
            </button>
            .
          </div>
        )}
      </AdminTableCard>
    </AdminPageContent>
  )
}

function VendorDialogs({
  open,
  isAdd,
  editVendor,
  onOpenChange,
  onFormSuccess,
  onCancel,
}: {
  open: boolean
  isAdd: boolean
  editVendor: FoodVendorRow | null
  onOpenChange: (open: boolean) => void
  onFormSuccess: () => void
  onCancel: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isAdd ? "Add food vendor" : "Edit food vendor"}</DialogTitle>
          <DialogDescription>
            {isAdd
              ? "Create a vendor profile. You can assign menus and foods after saving."
              : "Update vendor details. Changes apply immediately."}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <FoodVendorForm
            key={isAdd ? "new-vendor" : editVendor!.id}
            vendor={editVendor ? rowToFormVendor(editVendor) : undefined}
            isEdit={!isAdd}
            onSuccess={onFormSuccess}
            onCancel={onCancel}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
