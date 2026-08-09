import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { PropertyVisual } from "@/components/PropertyVisual";
import { publicListings } from "@/lib/fixtures";

export default function PublicHome() {
  return (
    <>
      <AppHeader publicMode />
      <main>
        <section className="public-hero" id="discovery">
          <div className="hero-copy">
            <p className="eyebrow">العقارات والأصول</p>
            <h1>اعثر على المكان المناسب لك</h1>
            <p className="hero-lede">
              تجربة عربية هادئة تضع العقار والمعلومات الأساسية في المقدمة،
              دون ضوضاء سوق العقارات التقليدية.
            </p>

            <form className="search-panel" aria-label="بحث تمثيلي عن عقار">
              <label>
                الموقع / الحي
                <select defaultValue="north">
                  <option value="north">حي تجريبي — شمال المدينة</option>
                  <option value="center">المنطقة الوسطى</option>
                </select>
              </label>
              <label>
                نوع العقار
                <select defaultValue="apartment">
                  <option value="apartment">شقة</option>
                  <option value="villa">فيلا</option>
                </select>
              </label>
              <label>
                الميزانية (ريال سنويًا)
                <select defaultValue="range">
                  <option value="range">50,000–120,000</option>
                </select>
              </label>
              <button className="button button--primary" type="button">
                بحث
              </button>
            </form>
          </div>
          <div className="hero-visual">
            <PropertyVisual label="مشهد تمثيلي لعقار سكني حديث" />
          </div>
        </section>

        <section className="public-section" id="experience" aria-labelledby="featured-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">اختيار هادئ وواضح</p>
              <h2 id="featured-title">عقارات مختارة للتجربة</h2>
            </div>
            <p>بيانات تركيبية فقط لإثبات لغة الواجهة والأساس التنفيذي.</p>
          </div>

          <div className="listing-grid">
            {publicListings.map((listing) => (
              <article className="listing-card" key={listing.id}>
                <PropertyVisual compact label={`تصوير تمثيلي لـ ${listing.title}`} />
                <div className="listing-body">
                  <div>
                    <h3>{listing.title}</h3>
                    <p>{listing.district}</p>
                  </div>
                  <p className="listing-meta">{listing.meta}</p>
                  <div className="listing-price">
                    <strong dir="ltr">{listing.price}</strong>
                    <span>ريال / سنة</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="public-cta">
            <div>
              <h2>لديك وصول تشغيلي أو إداري؟</h2>
              <p>استخدم شاشة الدخول الموحّدة للانتقال إلى المساحة المصرّح بها.</p>
            </div>
            <Link className="button button--primary" href="/sign-in">الانتقال إلى تسجيل الدخول</Link>
          </div>
        </section>
      </main>
      <footer className="public-footer">
        <span dir="ltr">RP04</span>
        <span>أساس تطبيقي تجريبي — بيانات تركيبية فقط</span>
      </footer>
    </>
  );
}
