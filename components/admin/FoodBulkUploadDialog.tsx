"use client"

import { useRef, useState } from "react"
import * as XLSX from "xlsx"
import { CheckCircle2, AlertCircle, Upload, FileSpreadsheet, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { bulkCreateFoods, BulkFoodRow } from "@/lib/actions/food.actions"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"

interface ParsedRow extends BulkFoodRow {
  _key: string // row index as string for stable key
}

interface PreviewData {
  newRows: ParsedRow[]
  existingNames: string[]
}

interface FoodBulkUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function normaliseHeader(h: string): string {
  return h.toLowerCase().replace(/[\s_-]+/g, "")
}

function parseSheet(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "array" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: "" })

        if (!raw.length) return resolve([])

        // Build a header mapping: normalised → original key
        const firstRow = raw[0]
        const headerMap: Record<string, string> = {}
        for (const key of Object.keys(firstRow)) {
          headerMap[normaliseHeader(key)] = key
        }

        const nameKey =
          headerMap["name"] ??
          headerMap["foodname"] ??
          headerMap["food"] ??
          headerMap["itemname"] ??
          Object.values(headerMap)[0] // fallback to first column

        if (!nameKey) return reject(new Error("Could not find a food name column"))

        const parsed: ParsedRow[] = raw
          .map((row, i) => {
            const name = String(row[nameKey] ?? "").trim()
            const description = String(row[headerMap["description"] ?? ""] ?? "").trim() || undefined
            const category = String(row[headerMap["category"] ?? ""] ?? "").trim() || undefined
            const special = row[headerMap["isspecialorder"] ?? headerMap["specialorder"] ?? ""]
            const isSpecialOrder =
              special === true ||
              String(special).toLowerCase() === "true" ||
              String(special) === "1"

            return { _key: String(i), name, description, category, isSpecialOrder }
          })
          .filter((r) => r.name.length >= 2)

        resolve(parsed)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}

export function FoodBulkUploadDialog({ open, onOpenChange }: FoodBulkUploadDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<"idle" | "checking" | "preview" | "creating">("idle")
  const [fileName, setFileName] = useState("")
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setStep("idle")
    setFileName("")
    setPreview(null)
    setSelectedKeys(new Set())
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  function handleClose(value: boolean) {
    if (!value) reset()
    onOpenChange(value)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setFileName(file.name)
    setStep("checking")

    try {
      const rows = await parseSheet(file)

      if (!rows.length) {
        setError("No valid food names found in the file. Make sure the first column contains food names.")
        setStep("idle")
        return
      }

      // Deduplicate within the file
      const seen = new Set<string>()
      const unique = rows.filter((r) => {
        const key = r.name.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      const res = await fetch("/api/food/check-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: unique.map((r) => r.name) }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const existingSet = new Set<string>((data.existing as string[]).map((n: string) => n.toLowerCase()))
      const newRows = unique.filter((r) => !existingSet.has(r.name.toLowerCase()))

      setPreview({ newRows, existingNames: data.existing as string[] })
      setSelectedKeys(new Set(newRows.map((r) => r._key)))
      setStep("preview")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file")
      setStep("idle")
    }
  }

  function toggleRow(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function toggleAll() {
    if (!preview) return
    if (selectedKeys.size === preview.newRows.length) {
      setSelectedKeys(new Set())
    } else {
      setSelectedKeys(new Set(preview.newRows.map((r) => r._key)))
    }
  }

  async function handleConfirm() {
    if (!preview) return
    const toCreate = preview.newRows
      .filter((r) => selectedKeys.has(r._key))
      .map(({ _key: _k, ...rest }) => rest)

    if (!toCreate.length) {
      toast({ title: "Nothing to create", description: "No food items selected" })
      return
    }

    setStep("creating")
    const result = await bulkCreateFoods(toCreate)
    setStep("preview")

    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error })
    } else {
      toast({
        title: "Foods created",
        description: `${result.created} food item${result.created === 1 ? "" : "s"} added successfully`,
      })
      handleClose(false)
      router.refresh()
    }
  }

  const selectedCount = selectedKeys.size
  const totalNew = preview?.newRows.length ?? 0
  const totalExisting = preview?.existingNames.length ?? 0
  const allSelected = totalNew > 0 && selectedCount === totalNew

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Upload Foods from Excel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file with food names to bulk-import to the catalog.
            Columns: <span className="font-medium">name</span> (required), description, category, isSpecialOrder.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* File picker */}
          <div
            className="rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 transition-colors cursor-pointer p-6 text-center"
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFile}
            />
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            {fileName ? (
              <p className="text-sm font-medium">{fileName}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click to choose an Excel file (.xlsx, .xls, .csv)
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Checking spinner */}
          {step === "checking" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking for duplicates…
            </div>
          )}

          {/* Preview */}
          {step === "preview" && preview && (
            <div className="space-y-4">
              {/* Summary bar */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  {totalNew} new
                </span>
                {totalExisting > 0 && (
                  <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    {totalExisting} already exist
                  </span>
                )}
                <span className="text-muted-foreground ml-auto">
                  {selectedCount} of {totalNew} selected
                </span>
              </div>

              <Tabs defaultValue="new">
                <TabsList>
                  <TabsTrigger value="new" className="gap-1.5">
                    New
                    <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-xs">{totalNew}</Badge>
                  </TabsTrigger>
                  {totalExisting > 0 && (
                    <TabsTrigger value="existing" className="gap-1.5">
                      Already Exist
                      <Badge variant="outline" className="rounded-full px-1.5 py-0 text-xs">{totalExisting}</Badge>
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* New foods tab */}
                <TabsContent value="new" className="mt-3">
                  {totalNew === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      All items in this file already exist in the catalog.
                    </p>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b">
                            <th className="py-2 px-3 text-left w-8">
                              <Checkbox
                                checked={allSelected}
                                onCheckedChange={toggleAll}
                                aria-label="Select all"
                              />
                            </th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">Name</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">Category</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">Special</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.newRows.map((row) => (
                            <tr
                              key={row._key}
                              className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                              onClick={() => toggleRow(row._key)}
                            >
                              <td className="py-2 px-3">
                                <Checkbox
                                  checked={selectedKeys.has(row._key)}
                                  onCheckedChange={() => toggleRow(row._key)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </td>
                              <td className="py-2 px-3 font-medium">{row.name}</td>
                              <td className="py-2 px-3 text-muted-foreground">{row.category || "—"}</td>
                              <td className="py-2 px-3">
                                {row.isSpecialOrder && (
                                  <Badge variant="secondary" className="text-xs rounded-full">Special</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>

                {/* Existing tab */}
                {totalExisting > 0 && (
                  <TabsContent value="existing" className="mt-3">
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b">
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">Name</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.existingNames.map((name) => (
                            <tr key={name} className="border-b last:border-0">
                              <td className="py-2 px-3 text-muted-foreground">{name}</td>
                              <td className="py-2 px-3">
                                <Badge variant="outline" className="text-xs rounded-full text-amber-600 border-amber-300">
                                  Already exists
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t px-6 py-4 flex items-center justify-between gap-3 bg-muted/20">
          <Button variant="ghost" size="sm" onClick={() => handleClose(false)}>
            <X className="h-4 w-4 mr-1.5" />
            Cancel
          </Button>

          {(step === "preview" || step === "creating") && preview && (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={reset} disabled={step === "creating"}>
                Upload different file
              </Button>
              <Button
                size="sm"
                disabled={selectedCount === 0 || step === "creating"}
                onClick={handleConfirm}
                className="min-w-[120px]"
              >
                {step === "creating" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Creating…
                  </>
                ) : (
                  `Add ${selectedCount} Food${selectedCount === 1 ? "" : "s"}`
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
