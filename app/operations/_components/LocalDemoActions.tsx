"use client";

import { useState } from "react";
import styles from "@/app/operations/operations.module.css";

const enabledActionStyle = { cursor: "pointer" } as const;
const disabledActionStyle = { cursor: "not-allowed", opacity: 0.5 } as const;

export function ReadinessDemoActions() {
  const [reviewed, setReviewed] = useState(false);
  const [followUpScheduled, setFollowUpScheduled] = useState(false);
  const [feedback, setFeedback] = useState(
    "لم يُنفّذ إجراء محلي في هذه الجلسة بعد."
  );

  function reviewOpenItem() {
    setReviewed(true);
    setFeedback(
      "تمت مراجعة العنصر المفتوح محليًا داخل هذه الجلسة التجريبية فقط."
    );
  }

  function scheduleFollowUp() {
    setFollowUpScheduled(true);
    setFeedback(
      "تمت جدولة متابعة تركيبية محلية: 12 أغسطس 2026، 10:00 ص. لا توجد رسالة أو مزامنة خارجية."
    );
  }

  return (
    <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
      <div
        className={styles.actionStack}
        aria-label="إجراءات محلية للسجل التجريبي"
      >
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
          غير متاح في النموذج التركيبي الحالي: تحديث الوثائق يتطلب حفظًا أو مخزن مستندات، وهما خارج نطاق W03.
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

      <div className={styles.keyValueList} aria-label="الحالة المحلية للإجراءات">
        <div className={styles.keyValueRow}>
          <span>مراجعة العنصر</span>
          <strong data-testid="readiness-review-state">
            {reviewed ? "تمت محليًا" : "لم تتم بعد"}
          </strong>
        </div>
        <div className={styles.keyValueRow}>
          <span>المتابعة</span>
          <strong data-testid="readiness-followup-state">
            {followUpScheduled ? "12 أغسطس 2026، 10:00 ص" : "غير مجدولة محليًا"}
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
  const [feedback, setFeedback] = useState(
    "لم يُنفّذ إجراء محلي في هذه الجلسة بعد."
  );

  function updateFollowUp() {
    setFollowUpUpdated(true);
    setFeedback(
      "تم تحديث حالة المتابعة محليًا إلى: متابعة داخلية مطلوبة. لم يُرسل أي اتصال خارجي."
    );
  }

  function addCollectionNote() {
    setNoteAdded(true);
    setFeedback(
      "تمت إضافة ملاحظة تحصيل تركيبية محليًا داخل هذه الجلسة فقط."
    );
  }

  return (
    <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
      <div className={styles.actionStack} aria-label="إجراءات التحصيل المحلية">
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

      <div className={styles.keyValueList} aria-label="الحالة المحلية للتحصيل">
        <div className={styles.keyValueRow}>
          <span>حالة المتابعة المحلية</span>
          <strong data-testid="collection-followup-state">
            {followUpUpdated ? "متابعة داخلية مطلوبة" : "لم تتغير"}
          </strong>
        </div>
        <div className={styles.keyValueRow}>
          <span>الملاحظة المحلية</span>
          <strong data-testid="collection-note-state">
            {noteAdded
              ? "تمت مراجعة الاستحقاق؛ لا يوجد اتصال خارجي."
              : "لا توجد ملاحظة مضافة في هذه الجلسة"}
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
