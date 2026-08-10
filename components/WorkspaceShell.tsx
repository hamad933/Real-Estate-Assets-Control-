import Link from "next/link";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader";
import type { AuthenticatedSession, Workspace } from "@/lib/auth/types";

const workspaceNames: Record<Workspace, string> = {
  TENANT: "خدمات المستأجر",
  CONTRACTOR: "الأعمال المسندة",
  OPERATIONS: "الجاهزية التشغيلية",
  ADMIN: "عمليات المحافظ"
};

const workspaceHome: Record<Workspace, string> = {
  TENANT: "/tenant",
  CONTRACTOR: "/contractor",
  OPERATIONS: "/operations",
  ADMIN: "/admin"
};

type WorkspaceShellProps = {
  session: AuthenticatedSession;
  workspace: Workspace;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
};

export function WorkspaceShell({
  session,
  workspace,
  eyebrow,
  title,
  description,
  children,
  aside
}: WorkspaceShellProps) {
  return (
    <>
      <AppHeader session={session} />
      <div className="breadcrumb-wrap">
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link>
          <span aria-hidden="true">/</span>
          <Link href={workspaceHome[workspace]}>{workspaceNames[workspace]}</Link>
        </nav>
      </div>

      <main className="workspace-page">
        <section className="workspace-heading" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 id="page-title">{title}</h1>
            <p className="lede">{description}</p>
          </div>
          <span className="scope-note">
            نطاق جلسة تجريبي
            <bdi className="ltr-id">{session.fixtureId}</bdi>
          </span>
        </section>

        <div className={aside ? "workspace-grid" : "workspace-grid workspace-grid--single"}>
          <div className="workspace-main">{children}</div>
          {aside ? <aside className="workspace-rail">{aside}</aside> : null}
        </div>
      </main>
    </>
  );
}
