import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { requireResource } from "@/lib/auth/guards";
import { getContractorAssignment } from "@/lib/data/repository";

export default async function ContractorAssignmentPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireResource("CONTRACTOR", "assignment", id);
  const data = getContractorAssignment(session, id);
  if (!data) redirect("/access-denied?reason=scope");

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
        <h2>{data.assignment.title}</h2>
        <bdi className="ltr-id ltr-id--large">{id}</bdi>
        <p>طلب الخدمة: <bdi className="ltr-id">{data.assignment.requestId}</bdi></p>
        <p>الحالة المحفوظة محليًا: {data.assignment.status}</p>
        <p>لا توجد هنا صلاحية لاعتماد الإكمال أو التكلفة النهائية.</p>
      </section>
    </WorkspaceShell>
  );
}
