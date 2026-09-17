import { fetchAuditLogs } from "@/lib/actions/auditLog.actions"
import { AuditLogs } from "@/components/admin/AuditLogs"
import { AdminPageContent } from "@/components/admin/layout/AdminPageContent"
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader"

export const dynamic = "force-dynamic"

const AuditLogsPage = async () => {
  const pageSize = 25
  const result = await fetchAuditLogs({ page: 1, pageSize })

  if (!result.success) {
    return (
      <main className="admin-main">
        <AdminPageContent>
          <AdminPageHeader
            title="Audit Logs"
            description="A record of admin actions taken across the platform."
          />
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            {result.error}
          </div>
        </AdminPageContent>
      </main>
    )
  }

  return (
    <main className="admin-main">
      <AdminPageContent>
        <AdminPageHeader
          title="Audit Logs"
          description="A record of admin actions taken across the platform — who did what, and when."
        />

        <AuditLogs
          initialLogs={result.logs}
          initialTotal={result.total}
          initialPage={result.page}
          pageSize={result.pageSize}
          actions={result.actions}
          entityTypes={result.entityTypes}
        />
      </AdminPageContent>
    </main>
  )
}

export default AuditLogsPage
