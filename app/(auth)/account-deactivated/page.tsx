import AuthLayout from "@/components/auth/AuthLayout"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AccountDeactivatedPage() {
  return (
    <AuthLayout
      description="This account is no longer active in the HR portal."
      secondaryDescription="If you believe this is a mistake, please contact your administrator."
      teamImage="/assets/images/team.png"
    >
      <div className="w-full max-w-md rounded-3xl bg-[#146C43] text-white p-8 shadow-2xl space-y-6">
        <h1 className="text-2xl font-bold">Account deactivated</h1>
        <p className="text-white/80 text-sm">
          Your account has been deactivated. You have been signed out.
        </p>
        <Button asChild className="w-full bg-white text-[#121212] hover:bg-white/90">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </div>
    </AuthLayout>
  )
}
