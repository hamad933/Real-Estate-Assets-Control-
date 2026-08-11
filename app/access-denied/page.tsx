import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { getSession } from "@/lib/auth/session";

export default async function AccessDeniedPage({
  searchParams
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const session = await getSession();
  const { reason } = await searchParams;
  const scopeDenied = reason === "scope";

  return (
    <>
      <AppHeader session={session} />
      <main className="state-page">
        <section className="state-card" aria-labelledby="denied-title">
          <span className="state-icon" aria-hidden="true">!</span>
          <p className="eyebrow">صلاحيات الوصول</p>
          <h1 id="denied-title">لا يمكنك الوصول إلى هذه الصفحة</h1>
          <p>
            {scopeDenied
              ? "هذا السجل خارج صلاحيات حسابك الحالية."
              : "هذه المساحة غير متاحة لصلاحيات حسابك الحالية."}
          </p>
          <div className="state-actions">
            <Link className="button button--primary" href="/">العودة إلى الرئيسية</Link>
            <Link className="button button--quiet" href="/sign-in">تسجيل الدخول</Link>
          </div>
        </section>
      </main>
    </>
  );
}
