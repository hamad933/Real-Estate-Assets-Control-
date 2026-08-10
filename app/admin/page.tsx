import { PropertyVisual } from "@/components/PropertyVisual";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import styles from "@/components/w04/RoleWorkspaces.module.css";
import { requireWorkspace } from "@/lib/auth/guards";
import { portfolioOperationsFixture as data } from "@/lib/w04-fixtures";

function stateClass(value: string) {
  if (value === "مستقر" || value === "سليم" || value === "جاهزة" || value === "مشغول") return styles.statusGood;
  if (value.includes("تدخل") || value === "متأخر") return styles.statusDanger;
  return styles.statusWarn;
}

export default async function AdminPage() {
  const session = await requireWorkspace("ADMIN");

  return (
    <WorkspaceShell
      session={session}
      workspace="ADMIN"
      eyebrow="S13 — عمليات المحافظ"
      title="عمليات المحافظ"
      description="رؤية تشغيلية على مستوى المحفظة لتحديد الحالات المفتوحة ذات الأولوية، ثم الانتقال إلى سياق السجل والإجراء المبرر."
    >
      <div className={styles.stack}>
        <section className={styles.operationsSummary} aria-label="ملخص العمليات">
          <div><span>تحتاج متابعة</span><strong>{data.totals.followUp}</strong><small>عنصرًا</small></div>
          <div><span>سجلات نشطة</span><strong>{data.totals.activeRecords}</strong><small>سجلًا</small></div>
          <div><span>عناصر مفتوحة</span><strong>{data.totals.openConditions}</strong><small>عنصرًا</small></div>
        </section>

        <section className={styles.operationsGrid} style={{ minWidth: 0, direction: "ltr" }}>
          <div className={styles.tablePanel} style={{ minWidth: 0 }} dir="rtl">
            <div className={styles.toolbar}>
              <button className={styles.secondaryAction} type="button">تخصيص الأعمدة</button>
              <span className={styles.searchBox}>ابحث باسم العقار أو الوحدة</span>
              <button className={styles.secondaryAction} type="button">إجراءات</button>
            </div>
            <div className="table-wrap" style={{ maxWidth: "100%", overflowX: "auto" }}>
              <table className={styles.opsTable}>
                <thead>
                  <tr>
                    <th>الأولوية</th>
                    <th>العقار / الوحدة</th>
                    <th>الحالة التشغيلية</th>
                    <th>الإشغال</th>
                    <th>الدفعات</th>
                    <th>الصيانة</th>
                    <th>الجاهزية</th>
                    <th>العناصر المفتوحة</th>
                  </tr>
                </thead>
                <tbody>
                  {data.records.map((record) => (
                    <tr key={record.id}>
                      <td><span className={styles.priority}>{record.priority}</span></td>
                      <td><strong>{record.name}</strong><br /><span className={styles.miniLabel}>{record.location}</span></td>
                      <td><span className={stateClass(record.operationalState)}>{record.operationalState}</span></td>
                      <td><span className={stateClass(record.occupancy)}>{record.occupancy}</span></td>
                      <td><span className={stateClass(record.payments)}>{record.payments}</span></td>
                      <td><span className={stateClass(record.maintenance)}>{record.maintenance}</span></td>
                      <td><span className={stateClass(record.readiness)}>{record.readiness}</span></td>
                      <td>{record.open}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.footerMeta}>
              <span>عرض سجلات المحفظة التجريبية بحسب الصلاحيات.</span>
              <span>ADMIN فقط</span>
            </div>
          </div>

          <aside className={styles.contextPanel} style={{ minWidth: 0 }} dir="rtl">
            <div className={styles.heroMeta}>
              <PropertyVisual compact label={`تصوير تمثيلي لـ ${data.selected.name}`} />
              <span className={styles.statusDanger}>يتطلب تدخل</span>
              <h2>{data.selected.name}</h2>
              <p className={styles.muted}>{data.selected.location}</p>
            </div>

            <div className={styles.warningBox}>
              <strong>سبب الأولوية الحالية</strong>
              <p>{data.selected.reason}</p>
            </div>

            <div className={styles.conditionList}>
              {data.selected.conditions.map((condition) => (
                <div className={styles.condition} key={condition.title}>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: "block" }}>{condition.title}</strong>
                    <small style={{ display: "block", marginTop: "0.2rem" }}>تاريخ الإنشاء: {condition.date}</small>
                  </div>
                  <span className={condition.severity === "عالٍ" ? styles.statusDanger : styles.statusWarn}>{condition.severity}</span>
                </div>
              ))}
            </div>

            <div className={styles.softCard}>
              <span className={styles.kicker}>الإجراء التالي الموصى به</span>
              <p>{data.selected.nextAction}</p>
              <button className={styles.primaryAction} type="button">مراجعة الحالات المفتوحة</button>
            </div>
          </aside>
        </section>

        <section className={styles.footerMeta}>
          <span>البيانات المعروضة تركيبية ومقيدة بجلسة الإدارة الحالية.</span>
          <span>آخر تحديث تمثيلي: 09 مايو 2026 · 10:45 ص</span>
        </section>
      </div>
    </WorkspaceShell>
  );
}
