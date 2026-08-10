import Link from "next/link";
import { OperationsRecordFrame } from "@/app/operations/_components/OperationsRecordFrame";
import { operationsRecord } from "@/app/operations/_data/records";
import styles from "@/app/operations/operations.module.css";
import { requireResource } from "@/lib/auth/guards";

export default async function OccupancyRecordPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireResource("OPERATIONS", "operations-record", id);
  const occupancy = operationsRecord.occupancy;

  return (
    <OperationsRecordFrame
      session={session}
      current="occupancy"
      surfaceCode="S08"
      entity="unit"
      title="سجل الإشغال والسكن"
      description="سياق إشغال على مستوى الوحدة يوضح العلاقة والمدة والمستندات والمتابعة، مع إبقاء القيم الحساسة للمستأجر مقنّعة."
    >
      <section className={styles.heroStateGood} aria-labelledby="occupancy-state-title">
        <span className={styles.stateIconGood} aria-hidden="true">✓</span>
        <div>
          <p className={styles.kicker}>حالة الإشغال</p>
          <h2 id="occupancy-state-title">{occupancy.status}</h2>
          <p>سجل إشغال نشط ومرتبط بهذه الوحدة ضمن السجل التشغيلي المصرّح به.</p>
        </div>
        <span className={styles.badgeGood}>{occupancy.recordState}</span>
      </section>

      <section className={styles.recordSummary} aria-label="ملخص سجل الإشغال">
        <div className={styles.factCell}><span>حالة الإشغال</span><strong>{occupancy.status}</strong></div>
        <div className={styles.factCell}><span>تاريخ البداية</span><strong>{occupancy.startDate}</strong></div>
        <div className={styles.factCell}><span>تاريخ النهاية</span><strong>{occupancy.endDate}</strong></div>
        <div className={styles.factCell}><span>نوع العلاقة</span><strong>{occupancy.relationType}</strong></div>
        <div className={styles.factCell}><span>عدد الشاغلين</span><strong>{occupancy.occupants}</strong></div>
        <div className={styles.factCell}><span>حالة السجل</span><strong>{occupancy.recordState}</strong></div>
      </section>

      <div className={styles.twoColumnReverse}>
        <section className={styles.panel} aria-labelledby="occupancy-term-title">
          <div className={styles.panelTitle}>
            <h2 id="occupancy-term-title">مدة الإشغال</h2>
            <span>سياق تشغيلي فقط</span>
          </div>
          <div className={styles.keyValueList}>
            <div className={styles.keyValueRow}><span>تاريخ البداية</span><strong>{occupancy.startDate}</strong></div>
            <div className={styles.keyValueRow}><span>تاريخ النهاية</span><strong>{occupancy.endDate}</strong></div>
            <div className={styles.keyValueRow}><span>مدة السجل</span><strong>{occupancy.term.duration}</strong></div>
            <div className={styles.keyValueRow}><span>مراجعة التجديد</span><strong>{occupancy.term.renewalReview}</strong></div>
            <div className={styles.keyValueRow}><span>إشعار الإخلاء المطلوب</span><strong>{occupancy.term.notice}</strong></div>
            <div className={styles.keyValueRow}><span>طريقة السداد المسجلة</span><strong>{occupancy.term.paymentMethod}</strong></div>
            <div className={styles.keyValueRow}><span>دورية السداد</span><strong>{occupancy.term.cadence}</strong></div>
          </div>
        </section>

        <div className={styles.surfaceBody}>
          <section className={styles.panel} aria-labelledby="tenant-context-title">
            <div className={styles.panelTitle}>
              <h2 id="tenant-context-title">معلومات المستأجر</h2>
              <span>عرض محدود للعمليات</span>
            </div>
            <div className={styles.tenantGrid}>
              <div className={styles.keyValueRow}><span>الاسم</span><strong>{occupancy.tenant.name}</strong></div>
              <div className={styles.keyValueRow}><span>نوع السجل</span><strong>{occupancy.tenant.recordType}</strong></div>
              <div className={styles.keyValueRow}><span>وسيلة التواصل</span><strong dir="ltr">{occupancy.tenant.phone}</strong></div>
              <div className={styles.keyValueRow}><span>البريد</span><strong dir="ltr">{occupancy.tenant.email}</strong></div>
            </div>
            <div className={styles.privacyNote}>
              ملاحظة: تظهر بيانات التواصل بقناع ثابت داخل تجربة العمليات. لا تعرض هذه الصفحة مساحة المستأجر أو ملفًا عامًا للمستأجرين.
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="occupancy-alert-title">
            <div className={styles.panelTitle}>
              <h2 id="occupancy-alert-title">تنبيهات وملاحظات مهمة</h2>
              <span className={styles.badgeWarn}>متابعة</span>
            </div>
            <div className={styles.noticeNote}>{occupancy.alert}</div>
          </section>
        </div>
      </div>

      <section className={styles.panel} aria-labelledby="occupancy-documents-title">
        <div className={styles.panelTitle}>
          <h2 id="occupancy-documents-title">المستندات والإثباتات</h2>
          <span>مراجع تركيبية غير قابلة للتنزيل</span>
        </div>
        <div className={styles.documentList}>
          {occupancy.documents.map((document) => (
            <div className={styles.documentRow} key={document.name}>
              <div>
                <strong>{document.name}</strong>
                <small>{document.meta}</small>
              </div>
              <span className={styles.badgeNeutral}>موثق</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.activityRail} aria-labelledby="occupancy-activity-title">
        <h2 id="occupancy-activity-title">آخر الأنشطة المتعلقة بالإشغال</h2>
        <div className={styles.activityList}>
          {occupancy.activity.map((item) => <div className={styles.activityItem} key={item}>{item}</div>)}
        </div>
      </section>

      <div className={styles.footerActionRow}>
        <Link className={styles.footerLink} href="/operations">العودة إلى الجاهزية التشغيلية</Link>
        <Link className={styles.footerLinkPrimary} href={`/operations/records/${id}/payments`}>
          الانتقال إلى سجل الدفعات
        </Link>
      </div>
    </OperationsRecordFrame>
  );
}
