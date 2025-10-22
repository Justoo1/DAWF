import AuthLayout from "@/components/auth/AuthLayout"
import Signup from "@/components/auth/Signup"

const SignupPage = () => {
  return (
    <AuthLayout
      description="The Welfare team is dedicated to enhancing the overall well-being of members of the organization, thus, providing support and resources when and where necessary."
      secondaryDescription="This application provides each member access to various contributions made to the Welfare team and also the total amount accumulated by the Welfare team of DevOps Africa ltd."
      teamImage="/assets/images/team.png"
      className="h-[32.5rem]"
      flexStart
    >
      <Signup />
    </AuthLayout>
  )
}

export default SignupPage;