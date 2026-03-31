import CreateDepartmentModal from "@/components/admin/CreateDepartmentModal"
import { DepartmentsTable } from "@/components/admin/DepartmentsTable"
import { AdminPageContent } from "@/components/admin/layout/AdminPageContent"
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader"
import { fetchDepartments } from "@/lib/actions/department.actions"

export default async function LeaveDepartmentsPage() {
  const { departments = [] } = await fetchDepartments();

  return (
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Departments"
          description="Organize teams, assign managers, and keep headcount in one place."
          action={
            <div className="[&_button]:shadow-sm">
              <CreateDepartmentModal />
            </div>
          }
        />
        <DepartmentsTable initialDepartments={departments} />
      </AdminPageContent>
    </main>
  )
}
