import Link from "next/link";
import { PropertyVisual } from "@/components/PropertyVisual";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { requireWorkspace } from "@/lib/auth/guards";
import { operationsFixture } from "@/lib/fixtures";

export default async function OperationsPage() {
  const session = await requireWorkspace("OPERATIONS");

  return (
    <WorkspaceShell
      session={session}
      workspace="OPERATIONS"
      eyebrow="S05 — مرجع العمليات"
      title="الجاهزية التشغيلية"
      description="مساحة تشغيلية مركّزة لمراجعة حالة أصل واحد ضمن النطاق المصرّح به."
      aside={
        <div className="rail-stack">
          <p className="rail-label">نطاق التشغيل</p>
          <strong>{operationsFixture.propertyName}</strong>
          <bdi className="ltr-id">{operationsFixture.propertyId}</bdi>
          <hr />
          <span>الفريق</span>
          <bdi className="ltr-id">{session.accessState === "USER" && session.profile === "OPERATIONS" ? session.scope.teamId : ""}</bdi>
        </div>
      }
    >
      <section className="property-summary panel">
        <PropertyVisual compact label={`تصوير تمثيلي لـ ${operationsFixture.propertyName}`} />
        <div>
          <span className="status status--good">{operationsFixture.readiness}</span>
          <h2>{operationsFixture.propertyName}</h2>
          <p>مراجعة تركيبية للجاهزية دون ربط ببيانات أو مزودات إنتاجية.</p>
          <div className="metric-row">
            <div><span>نسبة الاكتمال</span><strong dir="ltr">{operationsFixture.completion}%</strong></div>
            <div><span>فحوص مفتوحة</span><strong>{operationsFixture.openChecks}</strong></div>
          </div>
        </div>
      </section>

      <section className="panel" aria-labelledby="checks-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">مراجعة قابلة للتتبع</p>
            <h2 id="checks-title">الفحوص الحالية</h2>
          </div>
          <Link
            className="button button--quiet"
            href={`/operations/records/${operationsFixture.recordId}`}
          >
            فتح السجل المصرّح
          </Link>
        </div>
        <div className="check-list">
          <div><span className="check-dot check-dot--ok" />السلامة الأساسية <small>مكتمل</small></div>
          <div><span className="check-dot check-dot--warn" />مراجعة المستندات <small>تتطلب متابعة</small></div>
          <div><span className="check-dot check-dot--ok" />جاهزية التسليم <small>مكتمل</small></div>
        </div>
      </section>
    </WorkspaceShell>
  );
}
