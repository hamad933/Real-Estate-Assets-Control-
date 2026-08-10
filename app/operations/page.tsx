import Link from "next/link";
import { OperationsRecordFrame } from "@/app/operations/_components/OperationsRecordFrame";
import { operationsRecord } from "@/app/operations/_data/records";
import styles from "@/app/operations/operations.module.css";
import { requireResource } from "@/lib/auth/guards";

function toneClass(tone: string) {
  return tone === "good" ? styles.badgeGood : styles.badgeWarn;
}

export default async function OperationsPage() {
  const session = await requireResource(
    "OPERATIONS",
    "operations-record",
    operationsRecord.recordId
  );
  const readiness = operationsRecord.readiness;

  return (
    <OperationsRecordFrame
      session={session}
      current="readiness"
      surfaceCode="S05"
      entity="property"
      title="الجاهزية التشغيلية"
      description="مراجعة فئوية للجاهزية تربط العوائق والمتابعة والأدلة والإجراءات داخل سجل تشغيلي واحد، دون نسب أو درجات محسوبة."
    >
      <section className={styles.heroState} aria-labelledby="readiness-state-title">
        <span className={styles.stateIcon} aria-hidden="true">!</span>
        <div>
          <p className={styles.kicker}>حالة الجاهزية التشغيلية</p>
          <h2 id="readiness-state-title">{readiness.status}</h2>
          <p>{readiness.narrative}</p>
        </div>
        <div className={styles.stateCounts} aria-label="ملخص فئوي للجاهزية">
          <div>
            <span>عناصر مكتملة</span>
            <strong className={styles.goodNumber}>{readiness.counts.complete}</strong>
          </div>
          <div>
            <span>عناصر متابعة</span>
            <strong className={styles.warnNumber}>{readiness.counts.followUp}</strong>
          </div>
          <div>
            <span>عناصر معيقة</span>
            <strong className={styles.dangerNumber}>{readiness.counts.blockers}</strong>
          </div>
        </div>
      </section>

      <div className={styles.twoColumn}>
        <section className={styles.panel} aria-labelledby="readiness-dimensions-title">
          <div className={styles.panelTitle}>
            <h2 id="readiness-dimensions-title">أبعاد الجاهزية</h2>
            <span>آخر تحديث: {readiness.updatedAt}</span>
          </div>
          <div className={styles.dimensionList}>
            {readiness.dimensions.map((item) => (
              <div className={styles.dimensionRow} key={item.label}>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
                <span className={toneClass(item.tone)}>{item.state}</span>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.surfaceBody}>
          <section className={styles.panel} aria-labelledby="evidence-title">
            <div className={styles.panelTitle}>
              <h2 id="evidence-title">الأدلة الداعمة</h2>
              <span>أدلة تجريبية فقط</span>
            </div>
            <div className={styles.documentList}>
              {readiness.evidence.map((item) => (
                <div className={styles.documentRow} key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.meta}</small>
                  </div>
                  <span className={styles.evidenceState}>{item.state}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="blocker-title">
            <div className={styles.panelTitle}>
              <h2 id="blocker-title">عنصر يحتاج إجراء</h2>
              <span className={styles.badgeDanger}>عائق</span>
            </div>
            <article className={styles.blockerCard}>
              <div className={styles.blockerHead}>
                <strong>{readiness.blocker.title}</strong>
                <p>{readiness.blocker.detail}</p>
              </div>
              <div className={styles.blockerMeta}>
                <div><span>التاريخ المرجعي</span><strong>{readiness.blocker.due}</strong></div>
                <div><span>الإجراء المطلوب</span><strong>{readiness.blocker.requiredAction}</strong></div>
                <div><span>المسؤول المقترح</span><strong>{readiness.blocker.assignee}</strong></div>
              </div>
            </article>
            <div className={styles.actionStack} aria-label="إجراءات مقترحة غير متصلة بمزود خارجي">
              <button className={styles.actionButtonPrimary} type="button">مراجعة العنصر المفتوح</button>
              <button className={styles.actionButton} type="button">تحديث الوثائق</button>
              <button className={styles.actionButton} type="button">جدولة متابعة</button>
            </div>
          </section>
        </div>
      </div>

      <section className={styles.activityRail} aria-labelledby="readiness-activity-title">
        <h2 id="readiness-activity-title">آخر نشاط متعلق بالجاهزية</h2>
        <div className={styles.activityList}>
          {readiness.activity.map((item) => (
            <div className={styles.activityItem} key={item}>{item}</div>
          ))}
        </div>
      </section>

      <div className={styles.footerActionRow}>
        <Link className={styles.footerLink} href={`/operations/records/${operationsRecord.recordId}`}>
          فتح فهرس السجل
        </Link>
        <Link
          className={styles.footerLinkPrimary}
          href={`/operations/records/${operationsRecord.recordId}/occupancy`}
        >
          الانتقال إلى سجل الإشغال
        </Link>
      </div>
    </OperationsRecordFrame>
  );
}
