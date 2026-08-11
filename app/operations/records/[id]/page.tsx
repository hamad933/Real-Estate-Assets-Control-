import Link from "next/link";
import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { requireResource } from "@/lib/auth/guards";
import { getOperationsRecord } from "@/lib/data/repository";
import styles from "@/app/operations/operations.module.css";

export default async function OperationsRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireResource("OPERATIONS", "operations-record", id);
  const operationsRecord = getOperationsRecord(session, id);
  if (!operationsRecord) redirect("/access-denied?reason=scope");

  return (
    <WorkspaceShell session={session} workspace="OPERATIONS" eyebrow="السجل التشغيلي" title="فهرس السجل التشغيلي" description="انتقل بين الجاهزية والإشغال والدفعات والصيانة المرتبطة بهذا الأصل والوحدة.">
      <section className={styles.heroStateGood} aria-labelledby="record-scope-title">
        <span className={styles.stateIconGood} aria-hidden="true">✓</span>
        <div><p className={styles.kicker}>حالة الوصول</p><h2 id="record-scope-title">متاح لك</h2><p>يمكنك مراجعة السجلات المرتبطة بهذا الأصل ضمن صلاحياتك الحالية.</p></div>
        <bdi className="ltr-id ltr-id--large">{id}</bdi>
      </section>
      <section className={styles.panel} aria-labelledby="record-index-title">
        <div className={styles.panelTitle}><h2 id="record-index-title">السجلات المتاحة</h2><span>سياق موحّد للأصل</span></div>
        <div className={styles.actionStack}>
          <Link className={styles.footerLinkPrimary} href="/operations">الجاهزية التشغيلية</Link>
          <Link className={styles.footerLink} href={`/operations/records/${id}/occupancy`}>الإشغال والسكن</Link>
          <Link className={styles.footerLink} href={`/operations/records/${id}/payments`}>الدفعات والتحصيل</Link>
          <Link className={styles.footerLink} href={`/operations/records/${id}/maintenance`}>الصيانة والخدمة</Link>
        </div>
        <p className="policy-note">تظل صلاحيات الوصول مطبّقة عند الانتقال إلى كل سجل.</p>
      </section>
      <section className={styles.panel}>
        <div className={styles.panelTitle}><h2>سياق السجل</h2><span>العقار والوحدة</span></div>
        <div className={styles.keyValueList}>
          <div className={styles.keyValueRow}><span>الأصل</span><strong>{operationsRecord.propertyName}</strong></div>
          <div className={styles.keyValueRow}><span>الوحدة</span><strong>{operationsRecord.unitName}</strong></div>
          <div className={styles.keyValueRow}><span>المعرّف</span><strong><bdi className="ltr-id">{operationsRecord.recordId}</bdi></strong></div>
        </div>
      </section>
    </WorkspaceShell>
  );
}
