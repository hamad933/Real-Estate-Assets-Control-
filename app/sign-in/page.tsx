import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { signInAction } from "@/app/sign-in/actions";

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const invalid = params.error === "invalid-credentials";
  const authRequired = params.reason === "authentication-required";

  return (
    <>
      <AppHeader />
      <main className="signin-page">
        <section className="signin-card" aria-labelledby="signin-title">
          <div className="signin-intro">
            <p className="eyebrow">دخول موحّد</p>
            <h1 id="signin-title">الوصول إلى مساحة RP04</h1>
            <p>
              هذه طبقة جلسة تجريبية لـ W01 فقط. يتم التحقق من مساحة العمل والنطاق
              على الخادم قبل عرض المسارات المحمية.
            </p>
            <div className="demo-note">
              <strong>بيانات العرض الإداري المعتمدة</strong>
              <span dir="ltr">admin / admin</span>
              <small>مرجعية تجريبية فقط، وليست مصادقة إنتاجية.</small>
            </div>
          </div>

          <form className="signin-form" action={signInAction}>
            {authRequired ? (
              <p className="form-notice" role="status">
                سجّل الدخول للوصول إلى المسار المحمي.
              </p>
            ) : null}
            {invalid ? (
              <p className="form-error" role="alert">
                بيانات الدخول غير صحيحة.
              </p>
            ) : null}

            <label>
              اسم المستخدم
              <input name="username" autoComplete="username" required />
            </label>
            <label>
              كلمة المرور
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <button className="button button--primary button--wide" type="submit">
              تسجيل الدخول
            </button>
            <Link className="text-link" href="/">العودة إلى التجربة العامة</Link>
          </form>
        </section>

        <p className="signin-footnote">
          جلسات TENANT، CONTRACTOR، و OPERATIONS متاحة للاختبارات البرمجية فقط في W01،
          ولا توجد لها بيانات دخول عامة مخترعة.
        </p>
      </main>
    </>
  );
}
