import CompleteProfileForm from "@/components/auth/CompleteProfileForm"
import AuthLayout from "@/components/auth/AuthLayout"

const CompleteProfilePage = () => {
  return (
    <AuthLayout
      description="Welcome to the DevOps Africa Welfare Fund! To complete your registration, please provide your date of birth."
      secondaryDescription="Your birthday information helps us celebrate with you and provide birthday benefits as part of our welfare program."
      teamImage="/assets/images/team.png"
      className="h-[32.5rem]"
    >
      <CompleteProfileForm />
    </AuthLayout>
  )
}

export default CompleteProfilePage
