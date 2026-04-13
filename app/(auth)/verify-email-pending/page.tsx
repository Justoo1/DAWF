import AuthLayout from "@/components/auth/AuthLayout"
import { VerifyEmailPending } from "@/components/auth/VerifyEmailPending"

export default function VerifyEmailPendingPage() {
  return (
    <AuthLayout
      description="Verify your work email to finish activating your DAWF account."
      secondaryDescription="Your administrator has created your profile. Check your inbox for the verification link, then sign in with Google."
      teamImage="/assets/images/team.png"
    >
      <VerifyEmailPending />
    </AuthLayout>
  )
}
