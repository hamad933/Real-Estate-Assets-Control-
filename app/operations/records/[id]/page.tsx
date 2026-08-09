import { WorkspaceShell } from "@/components/WorkspaceShell";
import { requireResource } from "@/lib/auth/guards";

export default async function OperationsRecordPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireResource("OPERATIONS", "operations-record", id);

  return (
    <WorkspaceShell
      session={session}
      workspace="OPERATIONS"
      eyebrow="سجل تشغيلي"
      title="سجل جاهزية مصرّح به"
      description="تم السماح بالوصول لأن معرّف السجل يقع داخل النطاق التشغيلي للجلسة."
    >
      <section className="panel detail-panel">
        <span className="status status--good">ضمن النطاق</span>
        <h2>معرّف السجل</h2>
        <bdi className="ltr-id ltr-id--large">{id}</bdi>
        <p>هذه الصفحة دليل مباشر على فحص المورد قبل العرض، وليست ميزة تشغيلية كاملة.</p>
      </section>
    </WorkspaceShell>
  );
}
