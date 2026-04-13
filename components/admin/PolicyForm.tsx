'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RequiredMark } from '@/components/ui/required-mark'
import { createPolicy, updatePolicy, Policy } from '@/lib/actions/policy.actions'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import RichTextEditor from '@/components/ui/rich-text-editor'

interface PolicyFormProps {
  userEmail: string
  mode: 'create' | 'edit'
  initialData?: Policy
  onSuccess?: () => void
  onCancel?: () => void
}

const PolicyForm = ({ userEmail, mode, initialData, onSuccess, onCancel }: PolicyFormProps) => {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result

      if (mode === 'create') {
        result = await createPolicy({
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          updatedBy: userEmail,
        })
      } else if (initialData) {
        result = await updatePolicy({
          id: initialData.id,
          title: formData.title,
          content: formData.content,
          updatedBy: userEmail,
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setFormData({
      ...formData,
      title: newTitle,
      slug: mode === 'create' ? generateSlug(newTitle) : formData.slug,
    })
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
            onChange={handleTitleChange}
            placeholder="e.g., Welfare Fund Constitution"
            required
            disabled={loading}
            className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug" className="inline-flex flex-wrap items-center gap-x-1 gap-y-0 text-sm font-semibold text-slate-700 dark:text-slate-300">
            URL Slug
            {mode === 'create' ? <RequiredMark /> : null}
            {mode === 'edit' && <span className="text-xs font-normal text-gray-400">(cannot be changed)</span>}
          </Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g., welfare-fund-constitution"
            required
            disabled={loading || mode === 'edit'}
            className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
          />
          <p className="text-[11px] text-slate-400 font-medium px-1">
            Note: Currently only one active policy is supported at /policy
          </p>
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
