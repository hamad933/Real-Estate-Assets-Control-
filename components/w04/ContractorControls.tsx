"use client";

import { useState } from "react";
import styles from "@/components/w04/RoleWorkspaces.module.css";

export function ContractorControls() {
  const [status, setStatus] = useState("بانتظار الوصول");
  const [saved, setSaved] = useState(false);
  const [evidence, setEvidence] = useState(false);

  return (
    <div className={styles.actionStack}>
      <label>
        <span className={styles.miniLabel}>حالة المهمة</span>
        <select
          className={styles.select}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setSaved(false);
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
        onClick={() => setSaved(true)}
        data-testid="contractor-update-status"
      >
        تحديث حالة المهمة
      </button>
      {saved ? <p className={styles.successNotice} role="status">تم تحديث الحالة داخل الجلسة إلى: {status}</p> : null}

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
          تمثيل رفع الدليل جاهز. لا يتم إرسال ملفات أو تخزينها خارج الجلسة الحالية.
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
