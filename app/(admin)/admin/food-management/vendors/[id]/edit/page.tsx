import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

/** Editing a vendor is handled in a modal on the vendors list. */
export default async function EditVendorRedirectPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/admin/food-management/vendors?edit=${encodeURIComponent(id)}`)
}
