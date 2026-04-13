import AuthLayout from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      description="Set a new password for your DAWF account."
      secondaryDescription="After updating your password, sign in with your work email."
      teamImage="/assets/images/team.png"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
