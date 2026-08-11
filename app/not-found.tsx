import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default function NotFound() {
  return (
    <>
      <AppHeader />
      <main className="state-page">
        <section className="state-card" aria-labelledby="not-found-title">
          <span className="state-icon" aria-hidden="true">?</span>
          <p className="eyebrow">الصفحة غير موجودة</p>
          <h1 id="not-found-title">لم نجد الصفحة التي تبحث عنها</h1>
          <p>قد يكون الرابط قديمًا أو غير صحيح. يمكنك العودة إلى الرئيسية ومتابعة الاستكشاف.</p>
          <div className="state-actions">
            <Link className="button button--primary" href="/">العودة إلى الرئيسية</Link>
            <Link className="button button--quiet" href="/search">استكشاف العقارات</Link>
          </div>
        </section>
      </main>
    </>
  );
}
