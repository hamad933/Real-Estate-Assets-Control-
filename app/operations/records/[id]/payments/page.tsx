import Link from "next/link";
import { redirect } from "next/navigation";
import { CollectionDemoActions } from "@/app/operations/_components/LocalDemoActions";
import { OperationsRecordFrame } from "@/app/operations/_components/OperationsRecordFrame";
import styles from "@/app/operations/operations.module.css";
import { requireResource } from "@/lib/auth/guards";
import { getOperationsRecord } from "@/lib/data/repository";

export default async function PaymentsRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireResource("OPERATIONS", "operations-record", id);
  const operationsRecord = getOperationsRecord(session, id);
  if (!operationsRecord) redirect("/access-denied?reason=scope");
  const payments = operationsRecord.payments;

  return (
    <OperationsRecordFrame session={session} record={operationsRecord} current="payments" entity="unit" title="سجل الدفعات والتحصيل" description="تابع الدفعات المستحقة وحالة التحصيل والمستندات المرتبطة بهذه الوحدة من مكان واحد.">
      <section className={styles.paymentHero} aria-label="ملخص حالة السداد">
        <div className={styles.paymentStatus}><span className={styles.paymentStatusIcon} aria-hidden="true">!</span><div><span className={styles.kicker}>حالة السداد</span><strong>{payments.status}</strong></div></div>
        <div className={styles.paymentMetric}><span>المبلغ الحالي المستحق</span><strong>{payments.dueAmount}</strong><small>المبلغ المسجل</small></div>
        <div className={styles.paymentMetric}><span>تاريخ الاستحقاق</span><strong>{payments.dueDate}</strong><small>دورية {payments.cadence}</small></div>
        <div className={styles.paymentMetric}><span>آخر دفعة</span><strong>{payments.lastPayment}</strong><small>{payments.lastPaymentDate}</small></div>
        <div className={styles.paymentMetric}><span>الرصيد المرتبط بالسجل</span><strong>{payments.linkedBalance}</strong><small>وفق السجل الحالي</small></div>
      </section>
      <div className={styles.twoColumn}>
        <section className={styles.panel} aria-labelledby="payment-history-title">
          <div className={styles.panelTitle}><h2 id="payment-history-title">سجل الدفعات</h2><span>آخر الحركات المسجلة</span></div>
          <div className={styles.tableWrap}><table className={styles.recordTable}><thead><tr><th>الدورية</th><th>تاريخ الاستحقاق</th><th>المبلغ</th><th>الحالة</th><th>تاريخ السداد</th></tr></thead><tbody>{payments.rows.map((row) => <tr key={row.period}><td>{row.period}</td><td>{row.due}</td><td>{row.amount}</td><td><span className={row.status === "مدفوعة" ? styles.badgeGood : styles.badgeDanger}>{row.status}</span></td><td>{row.paid}</td></tr>)}</tbody></table></div>
        </section>
        <section className={styles.panel} aria-labelledby="collection-title">
          <div className={styles.panelTitle}><h2 id="collection-title">التحصيل والمتابعة</h2><span>متابعة السجل الحالي</span></div>
          <div className={styles.keyValueList}><div className={styles.keyValueRow}><span>طريقة المتابعة الحالية</span><strong>{payments.collectionMethod}</strong></div><div className={styles.keyValueRow}><span>حالة التذكير</span><strong>{payments.reminderState}</strong></div><div className={styles.keyValueRow}><span>تفصيل التذكير</span><strong>{payments.reminderDetail}</strong></div></div>
          <div className={styles.privacyNote}>{payments.collectionNote}</div><CollectionDemoActions />
        </section>
      </div>
      <div className={styles.twoColumnReverse}>
        <section className={styles.panel} aria-labelledby="payment-documents-title"><div className={styles.panelTitle}><h2 id="payment-documents-title">المستندات والأدلة</h2><span>مراجع مرتبطة بالسجل</span></div><div className={styles.documentList}>{payments.documents.map((document) => <div className={styles.documentRow} key={document}><strong>{document}</strong><span className={styles.badgeNeutral}>موثق</span></div>)}</div></section>
        <section className={styles.activityRail} aria-labelledby="payment-activity-title"><h2 id="payment-activity-title">آخر النشاط المالي داخل السجل</h2><div className={styles.activityList}>{payments.activity.map((item) => <div className={styles.activityItem} key={item}>{item}</div>)}</div></section>
      </div>
      <div className={styles.footerActionRow}><Link className={styles.footerLink} href={`/operations/records/${id}/occupancy`}>العودة إلى سجل الإشغال</Link><Link className={styles.footerLinkPrimary} href={`/operations/records/${id}/maintenance`}>الانتقال إلى سجل الصيانة</Link></div>
    </OperationsRecordFrame>
  );
}
