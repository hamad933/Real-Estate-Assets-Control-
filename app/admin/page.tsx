import { PropertyVisual } from "@/components/PropertyVisual";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { requireWorkspace } from "@/lib/auth/guards";
import { adminFixture } from "@/lib/fixtures";

export default async function AdminPage() {
  const session = await requireWorkspace("ADMIN");

  return (
    <WorkspaceShell
      session={session}
      workspace="ADMIN"
      eyebrow="S13 — إدارة المحافظ"
      title="عمليات المحفظة"
      description="مرجع إداري مقيّد بحالة ADMIN، مع كثافة معلومات منضبطة ومؤشرات بلا جدار بطاقات."
      aside={
        <div className="rail-stack">
          <p className="rail-label">سياق المحفظة</p>
          <strong>{adminFixture.portfolioName}</strong>
          <span className="status status--neutral">عرض تركيبي</span>
          <hr />
          <PropertyVisual compact label="تصوير تمثيلي لأصل داخل المحفظة" />
        </div>
      }
    >
      <section className="summary-strip" aria-label="ملخص المحفظة">
        <div><span>أصول نشطة</span><strong>{adminFixture.activeAssets}</strong></div>
        <div><span>بحاجة إلى انتباه</span><strong>{adminFixture.attentionItems}</strong></div>
        <div><span>حرجة</span><strong>{adminFixture.criticalItems}</strong></div>
      </section>

      <section className="panel" aria-labelledby="portfolio-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">قائمة المراجعة</p>
            <h2 id="portfolio-title">الأصول ضمن المحفظة التجريبية</h2>
          </div>
          <span className="status status--good">ADMIN فقط</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الأصل</th>
                <th>المعرّف</th>
                <th>الحالة</th>
                <th>الانتباه</th>
              </tr>
            </thead>
            <tbody>
              {adminFixture.properties.map((property) => (
                <tr key={property.id}>
                  <td>{property.name}</td>
                  <td><bdi className="ltr-id">{property.id}</bdi></td>
                  <td>{property.state}</td>
                  <td>{property.attention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </WorkspaceShell>
  );
}
