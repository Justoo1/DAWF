import { AdminPageContent } from "@/components/admin/layout/AdminPageContent"
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader"
import { CreateHolidayModal } from "@/components/admin/CreateHolidayModal"
import LeaveCalendar from "@/components/admin/LeaveCalendar"
import prisma from "@/lib/prisma"

export default async function LeaveCalendarPage() {
  const [leaves, holidays, deptRes, headcount] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: {
        status: "APPROVED",
      },
      include: {
        user: {
          select: {
            name: true,
            department: true,
          },
        },
        policy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    }),
    prisma.publicHoliday.findMany({
      orderBy: {
        date: "asc",
      },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      select: { department: true },
      distinct: ["department"],
    }),
    prisma.user.count({
      where: { isActive: true }
    }),
  ])

  const departments = Array.from(new Set(deptRes.map(u => u.department).filter(Boolean))) as string[]
  const totalEmployees = headcount;

  return (
    <main className="admin-main">
      <AdminPageContent className="space-y-8">
        <AdminPageHeader
          title="Leave & Holiday Calendar"
          description="View employee leave schedules and manage company holidays."
          action={<CreateHolidayModal />}
        />

        <LeaveCalendar 
          leaves={leaves} 
          holidays={holidays} 
          departments={departments} 
          totalHeadcount={totalEmployees}
        />
      </AdminPageContent>
    </main>
  )
}
