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
      eyebrow="إدارة المحافظ"
      title="عمليات المحافظ"
      description="تابع الحالات المفتوحة ذات الأولوية عبر المحفظة وانتقل مباشرة إلى السجل المطلوب للمراجعة."
    >
      <PortfolioOperationsClient data={data} />
    </WorkspaceShell>
  );
}
