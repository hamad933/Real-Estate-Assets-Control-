import Link from "next/link";
import { redirect } from "next/navigation";
import { OperationsRecordFrame } from "@/app/operations/_components/OperationsRecordFrame";
import styles from "@/app/operations/operations.module.css";
import frozenStyles from "@/app/operations/frozen-fidelity.module.css";
import { requireResource } from "@/lib/auth/guards";
import { getOperationsRecord } from "@/lib/data/repository";

function priorityClass(tone: string) {
  return tone === "good" ? styles.badgeGood : styles.badgeWarn;
}

export default async function MaintenanceRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireResource("OPERATIONS", "operations-record", id);
  const operationsRecord = getOperationsRecord(session, id);
  if (!operationsRecord) redirect("/access-denied?reason=scope");
  const maintenance = operationsRecord.maintenance;

  return (
    <OperationsRecordFrame session={session} record={operationsRecord} current="maintenance" entity="unit" title="الصيانة والخدمة" description="تابع أعمال الصيانة المرتبطة بالوحدة، بما في ذلك الحالة والأولوية والإسناد والمرفقات والنشاط الأخير.">
      <div className={frozenStyles.maintenanceWorkspace} data-rp04-surface="s10-maintenance-workspace">
        <div className={frozenStyles.maintenanceMain}>
          <section className={styles.panel} aria-labelledby="open-work-title">
            <div className={styles.panelTitle}><h2 id="open-work-title">الطلبات والأعمال المفتوحة</h2><span>{maintenance.openWork.length} سجلات مفتوحة</span></div>
            <div className={styles.workList}>{maintenance.openWork.map((work) => <article className={styles.workItem} key={work.id}><div><span className={priorityClass(work.priorityTone)}>{work.priority}</span><h3>{work.title}</h3><p>{work.detail}</p></div><div className={styles.workMeta}><div><span>رقم الطلب</span><strong dir="ltr">{work.id}</strong></div><div><span>المسؤول</span><strong>{work.assignee}</strong></div><div><span>الحالة</span><strong>{work.state}</strong></div><div><span>تاريخ الإنشاء</span><strong>{work.created}</strong></div></div></article>)}</div>
          </section>
          <section className={styles.activityRail} aria-labelledby="maintenance-activity-title"><h2 id="maintenance-activity-title">آخر نشاط للصيانة والخدمة</h2><div className={styles.activityList}>{maintenance.activity.map((item) => <div className={styles.activityItem} key={item}>{item}</div>)}</div></section>
        </div>

        <aside className={frozenStyles.maintenanceSide} aria-label="ملخص الصيانة والأدلة">
          <section className={`${styles.heroState} ${frozenStyles.maintenanceSummaryCard}`} aria-labelledby="maintenance-state-title"><span className={styles.stateIcon} aria-hidden="true">⌁</span><div><p className={styles.kicker}>حالة الصيانة والخدمة</p><h2 id="maintenance-state-title">{maintenance.status}</h2><p>توجد أعمال مفتوحة قيد التنفيذ أو بانتظار متابعة ضمن الوحدة الحالية.</p></div><div className={styles.stateCounts} aria-label="ملخص حالات الصيانة"><div><span>تحت التنفيذ</span><strong className={styles.warnNumber}>{maintenance.inProgress}</strong></div><div><span>بانتظار المتابعة</span><strong className={styles.warnNumber}>{maintenance.awaitingFollowUp}</strong></div><div><span>أعمال مفتوحة</span><strong>{maintenance.openWork.length}</strong></div></div></section>
          <section className={styles.panel} aria-labelledby="completed-work-title"><div className={styles.panelTitle}><h2 id="completed-work-title">أعمال مكتملة حديثًا</h2><span>إغلاق تشغيلي موثق</span></div><div className={styles.completedList}>{maintenance.recentCompleted.map((work) => <article className={styles.completedItem} key={work.title}><div><span className={styles.badgeGood}>مكتمل</span><h3>{work.title}</h3><p>{work.detail}</p></div><div className={styles.completedMeta}>{work.date}<br />{work.by}</div></article>)}</div></section>
          <section className={styles.panel} aria-labelledby="maintenance-evidence-title"><div className={styles.panelTitle}><h2 id="maintenance-evidence-title">المستندات والمرفقات</h2><span>أدلة مرتبطة بالعمل</span></div><div>{maintenance.evidence.map((file) => <div className={styles.filePill} key={file}><span>{file}</span><span className={styles.fileKind}>دليل</span></div>)}</div><div className={styles.privacyNote}>المرفقات المعروضة مراجع استعراضية، ولا تتضمن ملفات عملاء حقيقية.</div></section>
        </aside>
      </div>
      <div className={styles.footerActionRow}><Link className={styles.footerLink} href={`/operations/records/${id}/payments`}>العودة إلى سجل الدفعات</Link><Link className={styles.footerLinkPrimary} href={`/operations/records/${id}`}>العودة إلى فهرس السجل</Link></div>
    </OperationsRecordFrame>
  );
}
