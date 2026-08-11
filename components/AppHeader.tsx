import Link from "next/link";
import { logoutAction } from "@/app/actions";
import type { AuthenticatedSession } from "@/lib/auth/types";

type AppHeaderProps = {
  session?: AuthenticatedSession | null;
  publicMode?: boolean;
};

const roleLabel = (session: AuthenticatedSession) => {
  if (session.accessState === "ADMIN") return "إدارة المحافظ";
  if (session.profile === "TENANT") return "المستأجر";
  if (session.profile === "CONTRACTOR") return "المقاول";
  return "العمليات";
};

export function AppHeader({ session = null, publicMode = false }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="العقارات والأصول — الصفحة الرئيسية">
          <span className="brand-mark" aria-hidden="true">⌂</span>
          <span className="brand-code">العقارات والأصول</span>
        </Link>

        {publicMode ? (
          <nav className="public-nav" aria-label="التنقل العام">
            <Link href="/#discovery">العقارات</Link>
            <Link href="/#experience">الخدمات</Link>
            <Link href="/sign-in">تسجيل الدخول</Link>
          </nav>
        ) : session ? (
          <div className="session-cluster">
            <span className="role-chip">{roleLabel(session)}</span>
            <form action={logoutAction}>
              <button className="text-button" type="submit">تسجيل الخروج</button>
            </form>
          </div>
        ) : (
          <Link className="button button--quiet" href="/sign-in">تسجيل الدخول</Link>
        )}
      </div>
    </header>
  );
}
