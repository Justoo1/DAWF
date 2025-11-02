'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createPolicy, updatePolicy, Policy } from '@/lib/actions/policy.actions'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import RichTextEditor from '@/components/ui/rich-text-editor'

interface PolicyFormProps {
  userEmail: string
  mode: 'create' | 'edit'
  initialData?: Policy
}

const PolicyForm = ({ userEmail, mode, initialData }: PolicyFormProps) => {
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
        router.push('/admin/policies')
        router.refresh()
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
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/policies">
          <Button type="button" variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Policy Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="e.g., Welfare Fund Constitution"
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="slug">
            URL Slug {mode === 'edit' && <span className="text-xs text-gray-500">(cannot be changed)</span>}
          </Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g., welfare-fund-constitution"
            required
            disabled={loading || mode === 'edit'}
          />
          <p className="text-xs text-gray-500 mt-1">
            URL: /policy (Note: Currently only one active policy is supported)
          </p>
        </div>

        <div>
          <Label htmlFor="content">Policy Content</Label>
          <div className="mt-2">
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              disabled={loading}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Use the toolbar above to format your policy document. No HTML knowledge required!
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : mode === 'create' ? 'Create Policy' : 'Update Policy'}
        </Button>
        <Link href="/admin/policies">
          <Button type="button" variant="outline" disabled={loading}>
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}

export default PolicyForm
