import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canAccessResource, canAccessWorkspace, type ResourceKind } from "@/lib/auth/policy";
import type { AuthenticatedSession, Workspace } from "@/lib/auth/types";

function denied(reason: "workspace" | "scope"): never {
  redirect(`/access-denied?reason=${reason}`);
}

export async function requireWorkspace(workspace: Workspace): Promise<AuthenticatedSession> {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in?reason=authentication-required");
  }

  if (!canAccessWorkspace(session, workspace)) {
    denied("workspace");
  }

  return session;
}

export async function requireResource(
  workspace: Workspace,
  kind: ResourceKind,
  resourceId: string
): Promise<AuthenticatedSession> {
  const session = await requireWorkspace(workspace);

  if (!canAccessResource(session, kind, resourceId)) {
    denied("scope");
  }

  return session;
}
