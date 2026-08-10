import Link from "next/link";
import { redirect } from "next/navigation";
import { PropertyVisual } from "@/components/PropertyVisual";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { TenantServicePanel } from "@/components/w04/TenantServicePanel";
import styles from "@/components/w04/RoleWorkspaces.module.css";
import { requireWorkspace } from "@/lib/auth/guards";
import { getTenantWorkspace } from "@/lib/data/repository";

export default async function TenantPage() {
  const session = await requireWorkspace("TENANT");
  const data = getTenantWorkspace(session);
  if (!data) redirect("/access-denied?reason=scope");

  return (
    <WorkspaceShell
      session={session}
      workspace="TENANT"
      eyebrow="S11 — الخدمة الذاتية للمستأجر"
      title="خدمات المستأجر"
      description="إدارة معلومات السكن، والمدفوعات، وطلبات الخدمة، والمستندات الخاصة بعلاقتك الحالية فقط."
      aside={
        <div className={styles.darkRail}>
          <div>
            <p>مرحبًا بك</p>
            <h2>ملخص علاقتك السكنية</h2>
            <small>لا تظهر هنا أي بيانات خارج نطاق المستأجر الحالي.</small>
          </div>
          <nav className={styles.darkMenu} aria-label="تنقل خدمات المستأجر">
            <a href="#unit">وحدتي</a>
            <a href="#payments">الدفع</a>
            <a href="#service">طلبات الخدمة</a>
            <a href="#documents">مستنداتي</a>
            <a href="#notifications">الإشعارات</a>
          </nav>
          <TenantServicePanel />
        </div>
      }
    >
      <div className={styles.stack}>
        <section className={styles.heroGrid} id="unit">
          <div className={styles.heroCard}>
            <PropertyVisual compact label={`تصوير تمثيلي لـ ${data.unit.name}`} />
            <div className={styles.heroMeta}>
              <span className={styles.statusGood}>سجل السكن نشط</span>
              <h2>{data.unit.name}</h2>
              <p className={styles.muted}>{data.unit.location}</p>
              <p>{data.unit.contractType}</p>
              <Link className="button button--quiet" href={`/tenant/resources/${data.resourceId}`}>
                عرض تفاصيل العلاقة المصرّح بها
              </Link>
            </div>
          </div>
          <div className={styles.softCard}>
            <span className={styles.kicker}>الحالة الحالية</span>
            <h2>أنت مسجل حاليًا بوحدتك</h2>
            <p className={styles.muted}>النطاق الحالي: <bdi className="ltr-id">{data.unit.tenancyId}</bdi></p>
            <div className={styles.definitionGrid}>
              <div><span>بداية العقد</span><strong>{data.unit.startDate}</strong></div>
              <div><span>نهاية العقد</span><strong>{data.unit.endDate}</strong></div>
              <div><span>قيمة الإيجار السنوي</span><strong>{data.unit.annualRent}</strong></div>
              <div><span>طريقة الدفع</span><strong>{data.unit.paymentPlan}</strong></div>
            </div>
          </div>
        </section>

        <section className={styles.grid2} id="payments">
          <div className={styles.softCard}>
            <div className={styles.cardHead}>
              <div>
                <span className={styles.kicker}>الدفع القادم</span>
                <p className={styles.amount}>{data.nextPayment.amount}</p>
                <p className={styles.muted}>يستحق في {data.nextPayment.dueDate}</p>
              </div>
              <span className={styles.statusNeutral}>{data.nextPayment.status}</span>
            </div>
            <div className={styles.list}>
              {data.paymentHistory.map((payment) => (
                <div className={styles.listRow} key={payment.id}>
                  <div>
                    <strong>{payment.amount}</strong>
                    <span className={styles.miniLabel}>{payment.date}</span>
                  </div>
                  <span className={payment.status === "مستلمة" ? styles.statusGood : styles.statusNeutral}>{payment.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.softCard} id="service">
            <div className={styles.cardHead}>
              <div>
                <span className={styles.kicker}>طلبات الخدمة</span>
                <h2>آخر الطلبات</h2>
              </div>
              <span className={styles.statusGood}>ضمن نطاق وحدتك</span>
            </div>
            <div className={styles.list}>
              {data.serviceRequests.map((request) => (
                <div className={styles.listRow} key={request.id}>
                  <div>
                    <strong>{request.title}</strong>
                    <span className={styles.miniLabel}><bdi className="ltr-id">{request.id}</bdi> · {request.date}</span>
                  </div>
                  <span className={styles.statusGood}>{request.status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.grid2}>
          <div className={styles.softCard} id="documents">
            <span className={styles.kicker}>مستنداتي</span>
            <h2>مستندات شخصية مرتبطة بالعلاقة</h2>
            <div className={styles.list}>
              {data.documents.map((document) => (
                <div className={styles.listRow} key={document.id}>
                  <div>
                    <strong>{document.title}</strong>
                    <span className={styles.miniLabel}>{document.meta}</span>
                  </div>
                  <button className="text-button" type="button" disabled aria-label={`تنزيل ${document.title}`}>تنزيل</button>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.softCard} id="notifications">
            <span className={styles.kicker}>الإشعارات</span>
            <h2>تحديثات تهمك</h2>
            <div className={styles.list}>
              {data.notifications.map((notification) => (
                <div className={styles.listRow} key={notification}>
                  <strong>{notification}</strong>
                  <span className={styles.statusNeutral}>جديد</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.activityStrip} aria-label="آخر الأنشطة">
          <strong>آخر الأنشطة</strong>
          <div><strong>إصدار فاتورة جديدة</strong><span>15 مايو 2026</span></div>
          <div><strong>تنفيذ طلب خدمة</strong><span>01 مايو 2026</span></div>
          <div><strong>استلام دفعة</strong><span>15 سبتمبر 2025</span></div>
          <div><strong>إنشاء طلب خدمة</strong><span>28 أبريل 2026</span></div>
        </section>

        <section className={styles.helpBar}>
          <div>
            <strong>هل تحتاج إلى مساعدة؟</strong>
            <p className={styles.muted}>أنشئ طلب خدمة مرتبطًا بعلاقتك الحالية فقط.</p>
          </div>
          <TenantServicePanel />
        </section>
      </div>
    </WorkspaceShell>
  );
}
