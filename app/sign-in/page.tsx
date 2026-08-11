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
            <p className="eyebrow">تسجيل الدخول</p>
            <h1 id="signin-title">الوصول إلى العقارات والأصول</h1>
            <p>
              سجّل الدخول للوصول إلى مساحة العمل المناسبة لصلاحياتك.
            </p>
            <div className="demo-note">
              <strong>بيانات دخول العرض</strong>
              <span dir="ltr">admin / admin</span>
              <small>مخصّصة لاستعراض مساحة إدارة المحافظ.</small>
            </div>
          </div>

          <form className="signin-form" action={signInAction}>
            {authRequired ? (
              <p className="form-notice" role="status">
                سجّل الدخول للوصول إلى هذه الصفحة.
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
            <Link className="text-link" href="/">العودة إلى العقارات</Link>
          </form>
        </section>
      </main>
    </>
  );
}
