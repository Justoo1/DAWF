'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RequiredMark } from '@/components/ui/required-mark'
import { createPolicy, updatePolicy, type PolicySummary } from '@/lib/actions/policy.actions'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import RichTextEditor from '@/components/ui/rich-text-editor'

interface PolicyFormProps {
  userEmail: string
  mode: 'create' | 'edit'
  initialData?: PolicySummary
  onSuccess?: () => void
  onCancel?: () => void
}

const PolicyForm = ({ userEmail, mode, initialData, onSuccess, onCancel }: PolicyFormProps) => {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [uploadedAttachmentName, setUploadedAttachmentName] = useState('')
  const [attachmentDataBase64, setAttachmentDataBase64] = useState<string | null>(null)
  const [attachmentMime, setAttachmentMime] = useState<string | null>(null)
  const [removeAttachment, setRemoveAttachment] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
  })

  const MAX_ATTACHMENT_MB = 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result

      if (mode === 'create') {
        result = await createPolicy({
          title: formData.title,
          content: formData.content,
          updatedBy: userEmail,
          attachmentName: attachmentDataBase64 ? uploadedAttachmentName : undefined,
          attachmentMime: attachmentDataBase64 ? (attachmentMime || 'application/pdf') : undefined,
          attachmentDataBase64: attachmentDataBase64 || undefined,
        })
      } else if (initialData) {
        result = await updatePolicy({
          id: initialData.id,
          title: formData.title,
          content: formData.content,
          updatedBy: userEmail,
          attachmentName: attachmentDataBase64 ? uploadedAttachmentName : undefined,
          attachmentMime: attachmentDataBase64 ? (attachmentMime || 'application/pdf') : undefined,
          attachmentDataBase64: attachmentDataBase64 || undefined,
          removeAttachment,
        })
      }

      if (result?.success) {
        toast({
          title: mode === 'create' ? 'Policy Created' : 'Policy Updated',
          description: `The policy has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
        })
        
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/admin/policies')
          router.refresh()
        }
      } else {
        toast({
          title: 'Error',
          description: result?.error || 'Something went wrong',
          variant: 'destructive',
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save policy'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const escapeHtml = (value: string) => {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }

  const textToHtmlParagraphs = (text: string) => {
    const normalized = text.replaceAll('\r\n', '\n')
    const paragraphs = normalized
      .split('\n\n')
      .map((chunk) => chunk.trim())
      .filter(Boolean)

    if (paragraphs.length === 0) return '<p></p>'

    return paragraphs
      .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll('\n', '<br />')}</p>`)
      .join('')
  }

  const toBase64 = (bytes: Uint8Array) => {
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize)
      binary += String.fromCharCode(...chunk)
    }
    return btoa(binary)
  }

  /** One optional upload: PDF → attachment; .txt / .md / .html → import into Policy Content. */
  const handlePolicyDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileName = file.name.toLowerCase()
    const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf')
    const isHtml = fileName.endsWith('.html') || fileName.endsWith('.htm')
    const isText =
      fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.markdown')

    if (isPdf) {
      if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `Please upload a PDF up to ${MAX_ATTACHMENT_MB}MB.`,
          variant: 'destructive',
        })
        e.target.value = ''
        return
      }

      try {
        const arrayBuffer = await file.arrayBuffer()
        const base64 = toBase64(new Uint8Array(arrayBuffer))
        setAttachmentDataBase64(base64)
        setAttachmentMime('application/pdf')
        setUploadedAttachmentName(file.name)
        setRemoveAttachment(false)
        toast({
          title: 'PDF attached',
          description: `${file.name} will be available with this policy.`,
        })
      } catch {
        toast({
          title: 'Upload failed',
          description: 'Unable to read the selected PDF.',
          variant: 'destructive',
        })
      } finally {
        e.target.value = ''
      }
      return
    }

    if (isHtml || isText) {
      try {
        const text = await file.text()
        setFormData((prev) => ({
          ...prev,
          content: isHtml ? text : textToHtmlParagraphs(text),
        }))
        setUploadedFileName(file.name)
        toast({
          title: 'Content imported',
          description: `${file.name} was loaded into Policy Content.`,
        })
      } catch {
        toast({
          title: 'Import failed',
          description: 'Unable to read the selected file.',
          variant: 'destructive',
        })
      } finally {
        e.target.value = ''
      }
      return
    }

    toast({
      title: 'Unsupported file type',
      description: 'Use a PDF to attach, or .txt / .md / .html / .htm to fill the editor.',
      variant: 'destructive',
    })
    e.target.value = ''
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!onCancel && (
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/policies">
            <Button type="button" variant="outline" size="sm" className="rounded-lg shadow-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Policy Title
            <RequiredMark />
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Welfare Fund Constitution"
            required
            disabled={loading}
            className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="policy-document"
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            Document (optional)
          </Label>
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Upload className="h-4 w-4" />
              <span>Upload a PDF to attach, or a text/HTML file to import into the editor</span>
            </div>
            <Input
              id="policy-document"
              type="file"
              accept=".pdf,application/pdf,.txt,.md,.markdown,.html,.htm,text/plain,text/html"
              onChange={handlePolicyDocumentUpload}
              disabled={loading}
              className="mt-3 h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-zinc-900 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 dark:file:bg-zinc-800 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 dark:file:text-zinc-200"
            />
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              PDF up to {MAX_ATTACHMENT_MB}MB for viewing/download, or .txt / .md / .html / .htm to fill
              policy content.
            </p>
            {uploadedAttachmentName ? (
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                PDF attached: {uploadedAttachmentName}
              </p>
            ) : null}
            {uploadedFileName ? (
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Content imported from: {uploadedFileName}
              </p>
            ) : null}
            {mode === 'edit' &&
            (initialData?.attachmentName || initialData?.attachmentPath) &&
            !attachmentDataBase64 &&
            !removeAttachment ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Existing PDF: {initialData.attachmentName ?? "Attached document"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRemoveAttachment(true)
                    setUploadedAttachmentName('')
                    setAttachmentDataBase64(null)
                    setAttachmentMime(null)
                  }}
                  className="h-7 rounded-md px-2 text-[10px]"
                >
                  Remove PDF
                </Button>
              </div>
            ) : null}
            {mode === 'edit' && removeAttachment && (initialData?.attachmentName || initialData?.attachmentPath) ? (
              <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Attachment will be removed when you save.
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Policy Content
            <RequiredMark />
          </Label>
          <div className="mt-2 border rounded-xl overflow-hidden border-slate-200 dark:border-slate-800">
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              disabled={loading}
              minHeightClassName="min-h-[280px]"
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium px-1 mt-2">
            Use the toolbar above to format your policy document. No HTML knowledge required!
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button
          type="submit"
          disabled={loading}
          className="h-11 px-6 rounded-xl bg-[#10A074] hover:bg-[#0d8460] text-white font-bold uppercase tracking-widest text-[12px] transition-all shadow-md shadow-emerald-500/10"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : mode === 'create' ? 'Create Policy' : 'Update Policy'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          disabled={loading}
          onClick={() => onCancel ? onCancel() : router.push('/admin/policies')}
          className="h-11 px-6 rounded-xl border-slate-200 dark:border-slate-800 font-bold uppercase tracking-widest text-[12px] transition-all"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default PolicyForm
