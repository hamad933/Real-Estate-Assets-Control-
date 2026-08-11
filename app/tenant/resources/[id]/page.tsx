import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { requireResource } from "@/lib/auth/guards";
import { getTenantResource } from "@/lib/data/repository";

export default async function TenantResourcePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireResource("TENANT", "tenant-resource", id);
  const data = getTenantResource(session, id);
  if (!data) redirect("/access-denied?reason=scope");

  return (
    <WorkspaceShell
      session={session}
      workspace="TENANT"
      eyebrow="تفاصيل السكن"
      title="علاقتك السكنية"
      description="راجع معلومات الوحدة والعلاقة السكنية المتاحة لحسابك."
    >
      <section className="panel detail-panel">
        <span className="status status--good">ضمن صلاحياتك</span>
        <h2>{data.unit.name}</h2>
        <bdi className="ltr-id ltr-id--large">{id}</bdi>
        <p>رقم العلاقة: <bdi className="ltr-id">{data.unit.tenancyId}</bdi>.</p>
      </section>
    </WorkspaceShell>
  );
}
