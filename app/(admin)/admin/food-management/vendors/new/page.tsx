import { redirect } from 'next/navigation'

/** Adding a vendor is handled in a modal on the vendors list. */
export default function NewVendorRedirectPage() {
  redirect('/admin/food-management/vendors?add=1')
}
