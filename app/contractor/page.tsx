import Link from "next/link";
import { PropertyVisual } from "@/components/PropertyVisual";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { ContractorControls } from "@/components/w04/ContractorControls";
import styles from "@/components/w04/RoleWorkspaces.module.css";
import { requireWorkspace } from "@/lib/auth/guards";
import { contractorWorkspaceFixture as data } from "@/lib/w04-fixtures";

export default async function ContractorPage() {
  const session = await requireWorkspace("CONTRACTOR");

  return (
    <WorkspaceShell
      session={session}
      workspace="CONTRACTOR"
      eyebrow="S12 — الأعمال المسندة للمقاول"
      title="تفاصيل المهمة الموكلة إليك"
      description="عرض وتنفيذ الأعمال المسندة لهذه الجلسة فقط، مع فصل التنفيذ عن اعتماد الإكمال والتكلفة النهائيين."
    >
      <div className={styles.stack}>
        <section className={styles.contractorHeader}>
          <div className={styles.heroCard}>
            <PropertyVisual compact label={`تصوير تمثيلي لـ ${data.assignment.propertyName}`} />
            <div className={styles.heroMeta}>
              <div className={styles.taskTitle}>
                <span className={styles.statusWarn}>{data.assignment.status}</span>
                <h2>{data.assignment.title}</h2>
              </div>
              <p className={styles.muted}>{data.assignment.propertyName} · {data.assignment.location}</p>
              <Link className="button button--quiet" href={`/contractor/assignments/${data.assignment.id}`}>
                فتح مسار المهمة المصرّح
              </Link>
            </div>
          </div>
          <div className={styles.softCard}>
            <span className={styles.kicker}>سياق التكليف</span>
            <h2>{data.contractorName}</h2>
            <div className={styles.definitionGrid}>
              <div><span>رقم الطلب</span><strong><bdi className="ltr-id">{data.assignment.requestId}</bdi></strong></div>
              <div><span>المهمة</span><strong><bdi className="ltr-id">{data.assignment.id}</bdi></strong></div>
              <div><span>الأولوية</span><strong>{data.assignment.priority}</strong></div>
              <div><span>نافذة التنفيذ</span><strong>{data.assignment.window}</strong></div>
            </div>
          </div>
        </section>

        <section className={styles.metaBand} aria-label="ملخص المهمة">
          <div><span className={styles.miniLabel}>الموقع</span><strong>{data.assignment.location}</strong></div>
          <div><span className={styles.miniLabel}>الحالة</span><strong>{data.assignment.status}</strong></div>
          <div><span className={styles.miniLabel}>الأولوية</span><strong>{data.assignment.priority}</strong></div>
          <div><span className={styles.miniLabel}>التواصل المسموح</span><strong>{data.permittedContact}</strong></div>
        </section>

        <section className={styles.workBody}>
          <aside className={styles.softCard}>
            <span className={styles.kicker}>الموقع والوصول</span>
            <h2>سياق الوصول</h2>
            <div className={styles.list}>
              <div className={styles.listRow}><div><strong>العنوان</strong><span className={styles.miniLabel}>{data.assignment.location}</span></div></div>
              <div className={styles.listRow}><div><strong>تعليمات الدخول</strong><span className={styles.miniLabel}>{data.assignment.access}</span></div></div>
              <div className={styles.listRow}><div><strong>ملاحظات</strong><span className={styles.miniLabel}>{data.assignment.parking}</span></div></div>
            </div>
          </aside>

          <div className={styles.stack}>
            <section className={styles.softCard}>
              <span className={styles.kicker}>تفاصيل المشكلة</span>
              <h2>{data.assignment.title}</h2>
              <p>{data.assignment.problem}</p>
              <div className={styles.attachmentGrid}>
                {data.attachments.map((attachment) => (
                  <div className={styles.attachment} key={attachment.meta}>
                    <strong>{attachment.title}</strong>
                    <span dir="ltr">{attachment.meta}</span>
                  </div>
                ))}
              </div>
              <p className={styles.notice}>تعليمات مهمة: نسّق عبر قناة المهمة، ونفّذ العمل، وارفع تقرير التنفيذ. اعتماد الإكمال النهائي والتكلفة يبقى خارج صلاحيتك.</p>
            </section>

            <section className={styles.softCard}>
              <span className={styles.kicker}>مهام أخرى موكلة إليك</span>
              <h2>الأعمال المسندة فقط</h2>
              <div className={styles.list}>
                {data.otherAssigned.map((assignment) => (
                  <div className={styles.listRow} key={assignment.id}>
                    <div>
                      <strong>{assignment.title}</strong>
                      <span className={styles.miniLabel}><bdi className="ltr-id">{assignment.id}</bdi> · {assignment.when}</span>
                    </div>
                    <span className={styles.statusNeutral}>موكلة إليك</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles.softCard}>
            <span className={styles.kicker}>حالتك الحالية</span>
            <h2>التنفيذ والتقرير</h2>
            <ContractorControls />
            <div className={styles.list}>
              <div className={styles.listRow}>
                <div>
                  <strong>التواصل</strong>
                  <span className={styles.miniLabel}>{data.permittedContact}</span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className={styles.activityStrip} aria-label="النشاط الأخير على الطلب">
          <strong>النشاط الأخير</strong>
          <div><strong>تم تكليف المهمة إليك</strong><span>09:30 ص</span></div>
          <div><strong>تم تأكيد الاستلام</strong><span>09:45 ص</span></div>
          <div><strong>تمت إضافة مرفقات</strong><span>08:50 ص</span></div>
          <div><strong>السياق مقيد بالمهمة</strong><span><bdi className="ltr-id">{data.assignment.id}</bdi></span></div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
