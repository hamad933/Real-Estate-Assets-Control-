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
      eyebrow="أمر العمل"
      title="تفاصيل المهمة المسندة"
      description="راجع تفاصيل المهمة وحالتها الحالية ضمن الأعمال المسندة إليك."
    >
      <section className="panel detail-panel">
        <span className="status status--good">مهمة مسندة</span>
        <h2>{data.assignment.title}</h2>
        <p>رقم طلب الخدمة: <bdi className="ltr-id">{data.assignment.requestId}</bdi></p>
        <p>الحالة الحالية: {data.assignment.status}</p>
        <p>اعتماد الإكمال والتكلفة النهائية متاح للجهة المخولة فقط.</p>
      </section>
    </WorkspaceShell>
  );
}
