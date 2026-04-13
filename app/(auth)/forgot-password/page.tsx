import AuthLayout from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      description="Reset your DEVOPS AFRICA password using your work email."
      secondaryDescription="If your account was created by an administrator, use the same email they registered for you."
      teamImage="/assets/images/team.png"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
