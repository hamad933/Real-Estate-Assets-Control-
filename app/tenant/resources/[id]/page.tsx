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
      eyebrow="مورد علاقة إيجارية"
      title="مورد مستأجر مصرّح به"
      description="لا يعرض هذا المسار أي سجل ما لم يكن المعرّف ضمن نطاق المستأجر الحالي."
    >
      <section className="panel detail-panel">
        <span className="status status--good">ضمن نطاق المستأجر</span>
        <h2>{data.unit.name}</h2>
        <bdi className="ltr-id ltr-id--large">{id}</bdi>
        <p>علاقة سكنية تركيبية محفوظة محليًا: <bdi className="ltr-id">{data.unit.tenancyId}</bdi>.</p>
      </section>
    </WorkspaceShell>
  );
}
