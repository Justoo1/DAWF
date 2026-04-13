import AuthLayout from "@/components/auth/AuthLayout";
import { ChangeInitialPasswordForm } from "@/components/auth/ChangeInitialPasswordForm";

export default function ChangeInitialPasswordPage() {
  return (
    <AuthLayout
      description="Set a new password to finish securing your account."
      secondaryDescription="This step is required once after your administrator created your login or generated a temporary password."
      teamImage="/assets/images/team.png"
    >
      <ChangeInitialPasswordForm />
    </AuthLayout>
  );
}
