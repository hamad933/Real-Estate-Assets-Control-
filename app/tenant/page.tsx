import Link from "next/link";
import { PropertyVisual } from "@/components/PropertyVisual";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { requireWorkspace } from "@/lib/auth/guards";
import { tenantFixture } from "@/lib/fixtures";

export default async function TenantPage() {
  const session = await requireWorkspace("TENANT");

  return (
    <WorkspaceShell
      session={session}
      workspace="TENANT"
      eyebrow="S11 — الخدمة الذاتية"
      title="خدمات المستأجر"
      description="معلومات العلاقة الإيجارية الخاصة بهذه الجلسة فقط، ضمن نطاق واضح ومحدود."
      aside={
        <nav className="role-nav" aria-label="خدمات المستأجر">
          <span className="role-nav-title">مساحة المستأجر</span>
          <a href="#overview" className="is-active">نظرة عامة</a>
          <a href="#payments">المدفوعات</a>
          <a href="#service">طلبات الخدمة</a>
          <a href="#documents">المستندات</a>
        </nav>
      }
    >
      <section className="property-summary panel" id="overview">
        <PropertyVisual compact label={`تصوير تمثيلي لـ ${tenantFixture.propertyName}`} />
        <div>
          <span className="status status--good">علاقة نشطة</span>
          <h2>{tenantFixture.propertyName}</h2>
          <p>رقم الإشغال: <bdi className="ltr-id">{tenantFixture.tenancyId}</bdi></p>
          <Link className="button button--quiet" href={`/tenant/resources/${tenantFixture.resourceId}`}>
            فتح المورد المصرّح
          </Link>
        </div>
      </section>

      <div className="two-column">
        <section className="panel" id="payments">
          <p className="eyebrow">الدفعة القادمة</p>
          <h2>{tenantFixture.nextPayment}</h2>
          <p>{tenantFixture.nextDate}</p>
          <span className="status status--neutral">لا يوجد إجراء مطلوب الآن</span>
        </section>
        <section className="panel" id="service">
          <p className="eyebrow">طلبات الخدمة</p>
          <h2>{tenantFixture.serviceState}</h2>
          <p>يمكن لوحدات W01 اللاحقة توسيع التدفقات دون تغيير أساس الصلاحيات.</p>
        </section>
      </div>

      <section className="panel" id="documents">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">مستندات العلاقة</p>
            <h2>مراجع تركيبية</h2>
          </div>
        </div>
        <div className="document-row">
          <span>ملخص العلاقة الإيجارية</span>
          <bdi className="ltr-id">DOC-DEMO-101</bdi>
          <button className="text-button" type="button" disabled>التنزيل غير منفذ في W01</button>
        </div>
      </section>
    </WorkspaceShell>
  );
}
