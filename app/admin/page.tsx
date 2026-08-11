import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { PortfolioOperationsClient } from "@/components/w04/PortfolioOperationsClient";
import { requireWorkspace } from "@/lib/auth/guards";
import { getAdminPortfolio } from "@/lib/data/repository";

export default async function AdminPage() {
  const session = await requireWorkspace("ADMIN");
  const data = getAdminPortfolio(session);
  if (!data) redirect("/access-denied?reason=workspace");

  return (
    <WorkspaceShell
      session={session}
      workspace="ADMIN"
      eyebrow="S13 — عمليات المحافظ"
      title="عمليات المحافظ"
      description="رؤية تشغيلية على مستوى المحفظة لتحديد الحالات المفتوحة ذات الأولوية، ثم الانتقال إلى سياق السجل والإجراء المبرر."
    >
      <PortfolioOperationsClient data={data} />
    </WorkspaceShell>
  );
}
