"use client";

import { useState } from "react";
import styles from "@/components/w04/RoleWorkspaces.module.css";

export function TenantServicePanel() {
  const [created, setCreated] = useState(false);

  return (
    <div className={styles.actionStack}>
      <button
        className={styles.primaryAction}
        type="button"
        onClick={() => setCreated(true)}
        data-testid="tenant-create-service-request"
      >
        رفع طلب خدمة
      </button>
      {created ? (
        <p className={styles.successNotice} role="status">
          تم إنشاء طلب الخدمة وربطه بعلاقتك السكنية الحالية.
        </p>
      ) : (
        <p className={styles.muted}>يمكنك إنشاء طلب خدمة مرتبط بعلاقتك السكنية الحالية فقط.</p>
      )}
    </div>
  );
}
