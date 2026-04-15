import AuthLayout from "@/components/auth/AuthLayout"
import { VerifyEmailPending } from "@/components/auth/VerifyEmailPending"

export default function VerifyEmailPendingPage() {
  return (
    <AuthLayout
      description="Verify your work email to finish activating your DEVOPS AFRICA account."
      secondaryDescription="Your administrator has added your work email. Sign in with Google using that email. If this screen persists, ask an admin to confirm your account is active and your email matches exactly."
      teamImage="/assets/images/team.png"
    >
      <VerifyEmailPending />
    </AuthLayout>
  )
}
