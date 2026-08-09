import Link from "next/link";
import { PropertyVisual } from "@/components/PropertyVisual";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { canPerformAction } from "@/lib/auth/policy";
import { requireWorkspace } from "@/lib/auth/guards";
import { contractorFixture } from "@/lib/fixtures";

export default async function ContractorPage() {
  const session = await requireWorkspace("CONTRACTOR");
  const canApproveCompletion = canPerformAction(
    session,
    "APPROVE_FINAL_COMPLETION",
    contractorFixture.assignmentId
  );
  const canApproveCost = canPerformAction(
    session,
    "APPROVE_FINAL_COST",
    contractorFixture.assignmentId
  );

  return (
    <WorkspaceShell
      session={session}
      workspace="CONTRACTOR"
      eyebrow="S12 — العمل المسند"
      title="مهمة مكلّف بها"
      description="المقاول يرى العمل المسند وسياقه المسموح فقط، دون صلاحيات اعتماد نهائي."
      aside={
        <div className="rail-stack">
          <p className="rail-label">المهمة الحالية</p>
          <span className="status status--warn">{contractorFixture.status}</span>
          <bdi className="ltr-id">{contractorFixture.assignmentId}</bdi>
          <hr />
          <span>صلاحيات التنفيذ</span>
          <small>تحديث الحالة · رفع الدليل</small>
        </div>
      }
    >
      <section className="property-summary panel">
        <PropertyVisual compact label={`تصوير تمثيلي لـ ${contractorFixture.propertyName}`} />
        <div>
          <span className="status status--warn">{contractorFixture.status}</span>
          <h2>{contractorFixture.task}</h2>
          <p>{contractorFixture.propertyName}</p>
          <Link className="button button--quiet" href={`/contractor/assignments/${contractorFixture.assignmentId}`}>
            فتح المهمة المصرّح بها
          </Link>
        </div>
      </section>

      <section className="panel" aria-labelledby="allowed-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">حدود الإجراء</p>
            <h2 id="allowed-title">ما يمكن فعله في هذه الجلسة</h2>
          </div>
        </div>
        <div className="action-grid">
          <button className="button button--primary" type="button">تحديث حالة التنفيذ</button>
          <button className="button button--quiet" type="button">إرفاق دليل تنفيذي</button>
          <button
            className="button button--quiet"
            type="button"
            disabled={!canApproveCompletion}
            data-testid="approve-completion"
          >
            اعتماد الإكمال النهائي
          </button>
          <button
            className="button button--quiet"
            type="button"
            disabled={!canApproveCost}
            data-testid="approve-cost"
          >
            اعتماد التكلفة النهائية
          </button>
        </div>
        <p className="policy-note">الاعتماد النهائي للإكمال والتكلفة خارج صلاحية المقاول.</p>
      </section>
    </WorkspaceShell>
  );
}
