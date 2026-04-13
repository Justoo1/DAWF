import type { EmployeeSaveSummary } from "@/components/admin/EmployeeSaveSuccessDialog"

export function buildEmployeeSaveSummary(
  values: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    role: string
    department: string
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
    isActive: values.isActive,
    isContributor: values.isContributor,
    dateOfBirth: values.dateOfBirth?.trim() || "—",
    startDate: values.startDate?.trim() || "—",
  }
}
