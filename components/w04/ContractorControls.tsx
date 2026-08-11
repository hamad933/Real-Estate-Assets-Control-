"use client";

import { useState, useTransition } from "react";
import { updateContractorAssignmentStatusAction } from "@/app/contractor/actions";
import styles from "@/components/w04/RoleWorkspaces.module.css";

export function ContractorControls({
  assignmentId,
  initialStatus
}: {
  assignmentId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [evidence, setEvidence] = useState(false);
  const [isPending, startTransition] = useTransition();

  function persistStatus() {
    setSaved(false);
    setError("");
    startTransition(async () => {
      const result = await updateContractorAssignmentStatusAction(assignmentId, status);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <div className={styles.actionStack}>
      <label>
        <span className={styles.miniLabel}>حالة المهمة</span>
        <select
          className={styles.select}
          value={status}
          disabled={isPending}
          onChange={(event) => {
            setStatus(event.target.value);
            setSaved(false);
            setError("");
          }}
          aria-label="حالة المهمة"
        >
          <option>بانتظار الوصول</option>
          <option>في الموقع</option>
          <option>قيد التنفيذ</option>
          <option>تم رفع تقرير التنفيذ</option>
        </select>
      </label>

      <button
        className={styles.primaryAction}
        type="button"
        onClick={persistStatus}
        disabled={isPending}
        data-testid="contractor-update-status"
      >
        {isPending ? "جارٍ الحفظ..." : "تحديث حالة المهمة"}
      </button>
      {saved ? (
        <p className={styles.successNotice} role="status">
          تم تحديث حالة المهمة إلى: {status}.
        </p>
      ) : null}
      {error ? <p className={styles.notice} role="alert">{error}</p> : null}

      <button
        className={styles.secondaryAction}
        type="button"
        onClick={() => setEvidence(true)}
        data-testid="contractor-upload-evidence"
      >
        رفع تقرير التنفيذ / دليل
      </button>
      {evidence ? (
        <div className={styles.fileBox} role="status">
          تم تجهيز خطوة إرفاق الدليل لهذه المهمة. رفع الملفات غير متاح في هذه النسخة.
        </div>
      ) : null}

      <button className={styles.secondaryAction} type="button" disabled data-testid="approve-completion">
        اعتماد الإكمال النهائي
      </button>
      <button className={styles.secondaryAction} type="button" disabled data-testid="approve-cost">
        اعتماد التكلفة النهائية
      </button>
      <p className={styles.notice}>الاعتماد النهائي للإكمال والتكلفة ليس ضمن صلاحية المقاول.</p>
    </div>
  );
}
