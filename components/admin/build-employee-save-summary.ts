import type { EmployeeSaveSummary } from "@/components/admin/EmployeeSaveSuccessDialog"

function formatEmploymentType(t: string) {
  if (t === "CONTRACT") return "Contract"
  if (t === "FULL_TIME") return "Full time"
  return t
}

export function buildEmployeeSaveSummary(
  values: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    role: string
    department: string
    employmentType: string
    isActive: boolean
    isContributor: boolean
    dateOfBirth: string
    startDate: string
  },
  clientName: string
): EmployeeSaveSummary {
  return {
    fullName: `${values.firstName} ${values.lastName}`.trim(),
    email: values.email.trim(),
    phoneNumber: values.phoneNumber.trim(),
    role: values.role,
    clientName: clientName || "—",
    department: values.department?.trim() || "none",
    employmentType: formatEmploymentType(values.employmentType),
    isActive: values.isActive,
    isContributor: values.isContributor,
    dateOfBirth: values.dateOfBirth?.trim() || "—",
    startDate: values.startDate?.trim() || "—",
  }
}
