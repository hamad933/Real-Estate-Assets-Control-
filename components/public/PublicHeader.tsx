import Link from "next/link";
import styles from "./PublicExperience.module.css";

type PublicHeaderProps = {
  active?: "discover" | "map";
  shortlistCount?: number;
  shortlistQuery?: string;
};

export function PublicHeader({ active = "discover", shortlistCount = 0, shortlistQuery = "" }: PublicHeaderProps) {
  const compareHref = shortlistQuery ? `/compare?shortlist=${encodeURIComponent(shortlistQuery)}` : "/compare";

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/" aria-label="العقارات والأصول — الصفحة الرئيسية">
          <span className={styles.brandMark} aria-hidden="true">⌂</span>
          <span className={styles.brandCode}>العقارات والأصول</span>
        </Link>
        <nav className={styles.nav} aria-label="التنقل العام">
          <Link className={active === "discover" ? styles.activeNav : undefined} href="/">اكتشف</Link>
          <Link className={active === "map" ? styles.activeNav : undefined} href="/map">الخريطة</Link>
          {shortlistCount > 0 ? <Link className={styles.shortlistNav} href={compareHref}>المختصرة ({shortlistCount})</Link> : null}
          <Link href="/sign-in">تسجيل الدخول</Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <span>العقارات والأصول</span>
      <span>بيانات استعراضية مخصّصة لعرض تجربة المنتج.</span>
    </footer>
  );
}
