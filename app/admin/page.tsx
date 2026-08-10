import { WorkspaceShell } from "@/components/WorkspaceShell";
import { PortfolioOperationsClient } from "@/components/w04/PortfolioOperationsClient";
import { requireWorkspace } from "@/lib/auth/guards";

export default async function AdminPage() {
  const session = await requireWorkspace("ADMIN");

  return (
    <WorkspaceShell
      session={session}
      workspace="ADMIN"
      eyebrow="S13 — عمليات المحافظ"
      title="عمليات المحافظ"
      description="رؤية تشغيلية على مستوى المحفظة لتحديد الحالات المفتوحة ذات الأولوية، ثم الانتقال إلى سياق السجل والإجراء المبرر."
    >
      <PortfolioOperationsClient />
    </WorkspaceShell>
  );
}
