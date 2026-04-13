import AuthLayout from "@/components/auth/AuthLayout";
import { SetPasswordForm } from "@/components/auth/SetPasswordForm";

export default function SetPasswordPage() {
  return (
    <AuthLayout
      description="Your email is verified. Set a password to secure your DAWF account."
      secondaryDescription="You will use this password with your work email when signing in."
      teamImage="/assets/images/team.png"
    >
      <SetPasswordForm />
    </AuthLayout>
  );
}
