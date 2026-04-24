"use client"

import { useState } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RequiredMark } from "@/components/ui/required-mark"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/actions/clients.actions"
import {
  addClientFormDefaultValues,
  addClientFormSchema,
  type AddClientFormValues,
} from "@/lib/validation"
import { PlusCircle, Building2 } from "lucide-react"

export function AddClientDialog() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<AddClientFormValues>({
    resolver: zodResolver(addClientFormSchema),
    defaultValues: addClientFormDefaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  })

  const loading = form.formState.isSubmitting

  const onSubmit = async (values: AddClientFormValues) => {
    try {
      const res = await createClient({
        name: values.name,
        address: values.address,
      })
      if (res.success) {
        toast({
          title: "Client created",
          description: `${values.name.trim()} has been added.`,
        })
        form.reset(addClientFormDefaultValues)
        setOpen(false)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.error || "Could not create client",
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
        setOpen(v)
        if (!v) form.reset(addClientFormDefaultValues)
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <PlusCircle className="h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>New client</DialogTitle>
              <DialogDescription>
                Clients group employees. Each employee must be assigned a client
                when they are created.
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px] resize-y rounded-lg"
                        placeholder="Street, city, region (optional)"
                        autoComplete="street-address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Create client"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
