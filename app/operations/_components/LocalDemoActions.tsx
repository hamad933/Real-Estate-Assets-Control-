"use client";

import { useState } from "react";
import styles from "@/app/operations/operations.module.css";

const enabledActionStyle = { cursor: "pointer" } as const;
const disabledActionStyle = { cursor: "not-allowed", opacity: 0.5 } as const;

export function ReadinessDemoActions() {
  const [reviewed, setReviewed] = useState(false);
  const [followUpScheduled, setFollowUpScheduled] = useState(false);
  const [feedback, setFeedback] = useState("لم يتم تنفيذ إجراء بعد.");

  function reviewOpenItem() {
    setReviewed(true);
    setFeedback("تمت مراجعة العنصر المفتوح وتحديث حالته في هذه الجلسة.");
  }

  function scheduleFollowUp() {
    setFollowUpScheduled(true);
    setFeedback("تمت جدولة المتابعة ليوم 12 أغسطس 2026، الساعة 10:00 ص.");
  }

  return (
    <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
      <div className={styles.actionStack} aria-label="إجراءات الجاهزية">
        <button
          className={styles.actionButtonPrimary}
          style={enabledActionStyle}
          type="button"
          onClick={reviewOpenItem}
          data-testid="readiness-review-action"
        >
          {reviewed ? "تمت مراجعة العنصر" : "مراجعة العنصر المفتوح"}
        </button>

        <button
          className={styles.actionButton}
          style={disabledActionStyle}
          type="button"
          disabled
          aria-describedby="documents-action-unavailable"
          data-testid="readiness-documents-action"
        >
          تحديث الوثائق — غير متاح
        </button>
        <p id="documents-action-unavailable" className={styles.noticeNote}>
          تحديث الوثائق غير متاح في هذه النسخة لأن إدارة المستندات غير مفعّلة.
        </p>

        <button
          className={styles.actionButton}
          style={enabledActionStyle}
          type="button"
          onClick={scheduleFollowUp}
          data-testid="readiness-followup-action"
        >
          {followUpScheduled ? "تمت جدولة المتابعة" : "جدولة متابعة"}
        </button>
      </div>

      <div className={styles.keyValueList} aria-label="حالة الإجراءات">
        <div className={styles.keyValueRow}>
          <span>مراجعة العنصر</span>
          <strong data-testid="readiness-review-state">
            {reviewed ? "تمت المراجعة" : "لم تتم بعد"}
          </strong>
        </div>
        <div className={styles.keyValueRow}>
          <span>المتابعة</span>
          <strong data-testid="readiness-followup-state">
            {followUpScheduled ? "12 أغسطس 2026، 10:00 ص" : "غير مجدولة"}
          </strong>
        </div>
      </div>

      <p
        className={styles.privacyNote}
        role="status"
        aria-live="polite"
        data-testid="readiness-action-feedback"
      >
        {feedback}
      </p>
    </div>
  );
}

export function CollectionDemoActions() {
  const [followUpUpdated, setFollowUpUpdated] = useState(false);
  const [noteAdded, setNoteAdded] = useState(false);
  const [feedback, setFeedback] = useState("لم يتم تنفيذ إجراء بعد.");

  function updateFollowUp() {
    setFollowUpUpdated(true);
    setFeedback("تم تحديث حالة المتابعة إلى: متابعة داخلية مطلوبة.");
  }

  function addCollectionNote() {
    setNoteAdded(true);
    setFeedback("تمت إضافة ملاحظة التحصيل إلى السجل الحالي.");
  }

  return (
    <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
      <div className={styles.actionStack} aria-label="إجراءات التحصيل">
        <button
          className={styles.actionButtonPrimary}
          style={enabledActionStyle}
          type="button"
          onClick={updateFollowUp}
          data-testid="collection-followup-action"
        >
          {followUpUpdated ? "تم تحديث المتابعة" : "تحديث المتابعة"}
        </button>
        <button
          className={styles.actionButton}
          style={enabledActionStyle}
          type="button"
          onClick={addCollectionNote}
          data-testid="collection-note-action"
        >
          {noteAdded ? "تمت إضافة الملاحظة" : "إضافة ملاحظة تحصيل"}
        </button>
      </div>

      <div className={styles.keyValueList} aria-label="حالة التحصيل">
        <div className={styles.keyValueRow}>
          <span>حالة المتابعة</span>
          <strong data-testid="collection-followup-state">
            {followUpUpdated ? "متابعة داخلية مطلوبة" : "لم تتغير"}
          </strong>
        </div>
        <div className={styles.keyValueRow}>
          <span>ملاحظة التحصيل</span>
          <strong data-testid="collection-note-state">
            {noteAdded ? "تمت مراجعة الاستحقاق." : "لا توجد ملاحظة مضافة"}
          </strong>
        </div>
      </div>

      <p
        className={styles.privacyNote}
        role="status"
        aria-live="polite"
        data-testid="collection-action-feedback"
      >
        {feedback}
      </p>
    </div>
  );
}
