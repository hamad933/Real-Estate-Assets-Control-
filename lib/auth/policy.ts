import type { AuthenticatedSession, Workspace } from "@/lib/auth/types";

export type ResourceKind = "tenant-resource" | "assignment" | "operations-record";
export type ProtectedAction =
  | "VIEW"
  | "UPDATE_STATUS"
  | "UPLOAD_EVIDENCE"
  | "APPROVE_FINAL_COMPLETION"
  | "APPROVE_FINAL_COST";

export function canAccessWorkspace(
  session: AuthenticatedSession | null,
  workspace: Workspace
): boolean {
  if (!session) return false;
  if (workspace === "ADMIN") return session.accessState === "ADMIN";
  return session.accessState === "USER" && session.profile === workspace;
}

export function canAccessResource(
  session: AuthenticatedSession | null,
  kind: ResourceKind,
  resourceId: string
): boolean {
  if (!session || session.accessState !== "USER") return false;

  if (kind === "tenant-resource") {
    return session.profile === "TENANT" && session.scope.resourceIds.includes(resourceId);
  }

  if (kind === "assignment") {
    return session.profile === "CONTRACTOR" && session.scope.assignmentIds.includes(resourceId);
  }

  return (
    session.profile === "OPERATIONS" &&
    session.scope.operationalRecordIds.includes(resourceId)
  );
}

export function canPerformAction(
  session: AuthenticatedSession | null,
  action: ProtectedAction,
  resourceId: string
): boolean {
  if (!session) return false;

  if (session.accessState === "ADMIN") {
    return action === "VIEW";
  }

  if (session.profile === "TENANT") {
    return action === "VIEW" && session.scope.resourceIds.includes(resourceId);
  }

  if (session.profile === "OPERATIONS") {
    return action === "VIEW" && session.scope.operationalRecordIds.includes(resourceId);
  }

  if (!session.scope.assignmentIds.includes(resourceId)) return false;

  if (action === "APPROVE_FINAL_COMPLETION" || action === "APPROVE_FINAL_COST") {
    return false;
  }

  return action === "VIEW" || action === "UPDATE_STATUS" || action === "UPLOAD_EVIDENCE";
}
