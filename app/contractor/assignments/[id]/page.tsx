import { WorkspaceShell } from "@/components/WorkspaceShell";
import { requireResource } from "@/lib/auth/guards";

export default async function ContractorAssignmentPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireResource("CONTRACTOR", "assignment", id);

  return (
    <WorkspaceShell
      session={session}
      workspace="CONTRACTOR"
      eyebrow="أمر عمل"
      title="مهمة ضمن نطاق المقاول"
      description="الوصول مقيد بقائمة المهام المسندة إلى الجلسة التجريبية الحالية."
    >
      <section className="panel detail-panel">
        <span className="status status--good">مهمة مسندة</span>
        <h2>معرّف المهمة</h2>
        <bdi className="ltr-id ltr-id--large">{id}</bdi>
        <p>لا توجد هنا صلاحية لاعتماد الإكمال أو التكلفة النهائية.</p>
      </section>
    </WorkspaceShell>
  );
}
