"use server";

import { canPerformAction } from "@/lib/auth/policy";
import { getSession } from "@/lib/auth/session";
import { updateContractorAssignmentStatus } from "@/lib/data/repository";

const allowedStatuses = new Set([
  "بانتظار الوصول",
  "في الموقع",
  "قيد التنفيذ",
  "تم رفع تقرير التنفيذ"
]);

export async function updateContractorAssignmentStatusAction(
  assignmentId: string,
  status: string
): Promise<{ ok: true; status: string } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || !canPerformAction(session, "UPDATE_STATUS", assignmentId)) {
    return { ok: false, error: "غير مصرح بتحديث هذه المهمة." };
  }

  if (!allowedStatuses.has(status)) {
    return { ok: false, error: "حالة المهمة غير صالحة." };
  }

  const updated = updateContractorAssignmentStatus(session, assignmentId, status);
  return updated
    ? { ok: true, status }
    : { ok: false, error: "تعذر تحديث المهمة ضمن نطاق الجلسة الحالية." };
}
