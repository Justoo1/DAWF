"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { RequiredMark } from "@/components/ui/required-mark"
import { useToast } from "@/hooks/use-toast"
import { updateClient } from "@/lib/actions/clients.actions"
import {
  editClientFormSchema,
  type EditClientFormValues,
} from "@/lib/validation"
import { Building2 } from "lucide-react"
import type { AdminClientRow } from "./client-admin.types"

interface EditClientDialogProps {
  client: AdminClientRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditClientDialog({
  client,
  open,
  onOpenChange,
}: EditClientDialogProps) {
  const { toast } = useToast()

  const form = useForm<EditClientFormValues>({
    resolver: zodResolver(editClientFormSchema),
    defaultValues: { name: "", isActive: true },
    mode: "onChange",
    reValidateMode: "onChange",
  })

  useEffect(() => {
    if (client && open) {
      form.reset({
        name: client.name,
        isActive: client.isActive,
      })
    }
  }, [client, open, form])

  const loading = form.formState.isSubmitting

  const onSubmit = async (values: EditClientFormValues) => {
    if (!client) return
    try {
      const res = await updateClient({
        id: client.id,
        name: values.name,
        isActive: values.isActive,
      })
      if (res.success) {
        toast({
          title: "Client updated",
          description: `${values.name.trim()} has been saved.`,
        })
        onOpenChange(false)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.error || "Could not update client",
        })
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) form.reset({ name: "", isActive: true })
      }}
    >
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit client</DialogTitle>
              <DialogDescription>
                Update the organization name and whether it appears when
                assigning new employees.
                {client ? (
                  <span className="mt-2 block text-slate-600 dark:text-slate-400">
                    {client.employeeCount}{" "}
                    {client.employeeCount === 1 ? "employee" : "employees"}{" "}
                    assigned.
                  </span>
                ) : null}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="inline-flex items-center gap-1">
                      Client name
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-11 rounded-lg"
                        leftIcon={<Building2 className="h-4 w-4" />}
                        placeholder="Acme Corp"
                        autoComplete="organization"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <p className="text-xs text-slate-500">
                        Inactive clients are hidden from the client picker when
                        adding employees.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
