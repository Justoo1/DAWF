import AuthLayout from "@/components/auth/AuthLayout";
import Login from "@/components/auth/Login";
import { Suspense } from "react";

const LoginPage = () => {
  return (
    <AuthLayout
      description="The Welfare team is dedicated to enhancing the overall well-being of members of the organization, thus, providing support and resources when and where necessary."
      secondaryDescription="This application provides each member access to various contributions made to the Welfare team and also the total amount accumulated by the Welfare team of DEVOPS AFRICA ltd."
      teamImage="/assets/images/team.png"
    >
      <Suspense fallback={<div className="w-full max-w-md min-h-[24rem] rounded-3xl bg-[#146C43]/80 animate-pulse" aria-hidden />}>
        <Login />
      </Suspense>
    </AuthLayout>
  );
};

export default LoginPage;