import { WorkspaceShell } from "@/components/WorkspaceShell";
import { requireResource } from "@/lib/auth/guards";

export default async function TenantResourcePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireResource("TENANT", "tenant-resource", id);

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
        <h2>معرّف المورد</h2>
        <bdi className="ltr-id ltr-id--large">{id}</bdi>
        <p>بيانات تجريبية فقط لإثبات عزل الكائنات المباشر.</p>
      </section>
    </WorkspaceShell>
  );
}
