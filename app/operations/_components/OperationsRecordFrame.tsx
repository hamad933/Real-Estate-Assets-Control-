import Link from "next/link";
import type { ReactNode } from "react";
import { PropertyPhoto } from "@/components/public/PropertyPhoto";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import type { AuthenticatedSession } from "@/lib/auth/types";
import type { OperationsRecordData, OperationsSection } from "@/app/operations/_data/records";
import styles from "@/app/operations/operations.module.css";

type OperationsRecordFrameProps = {
  session: AuthenticatedSession;
  record: OperationsRecordData;
  current: OperationsSection;
  title: string;
  description: string;
  surfaceCode: "S05" | "S08" | "S09" | "S10";
  entity: "property" | "unit";
  children: ReactNode;
};

const tabs: Array<{ key: OperationsSection; label: string; code: string }> = [
  { key: "readiness", label: "الجاهزية التشغيلية", code: "S05" },
  { key: "occupancy", label: "الإشغال والسكن", code: "S08" },
  { key: "payments", label: "الدفعات والتحصيل", code: "S09" },
  { key: "maintenance", label: "الصيانة والخدمة", code: "S10" }
];

function tabHref(section: OperationsSection, recordId: string) {
  if (section === "readiness") return "/operations";
  return `/operations/records/${recordId}/${section}`;
}

export function OperationsRecordFrame({
  session,
  record,
  current,
  title,
  description,
  surfaceCode,
  entity,
  children
}: OperationsRecordFrameProps) {
  const isProperty = entity === "property";
  const visualLabel = isProperty ? record.propertyName : record.unitName;

  return (
    <WorkspaceShell
      session={session}
      workspace="OPERATIONS"
      eyebrow={`${surfaceCode} — سجل تشغيلي ضمن النطاق`}
      title={title}
      description={description}
    >
      <section className={styles.entityCard} aria-label="سياق السجل التشغيلي">
        <div className={styles.entityVisual}>
          <PropertyPhoto
            propertyId="narjis-101"
            alt={`صورة عقارية لـ ${visualLabel}`}
          />
        </div>
        <div className={styles.entityIdentity}>
          <p className={styles.kicker}>{isProperty ? "أصل تشغيلي" : "وحدة مرتبطة بالسجل"}</p>
          <h2>{visualLabel}</h2>
          <p>{isProperty ? record.propertyLocation : record.unitLocation}</p>
          <div className={styles.idRow}>
            <span>السجل</span>
            <bdi className="ltr-id">{record.recordId}</bdi>
            <span>•</span>
            <bdi className="ltr-id">{isProperty ? record.propertyId : record.unitId}</bdi>
          </div>
        </div>
        <dl className={styles.entityFacts}>
          <div><dt>{isProperty ? "نوع الأصل" : "نوع الوحدة"}</dt><dd>{record.unitMeta.type}</dd></div>
          <div><dt>المساحة</dt><dd>{record.unitMeta.area}</dd></div>
          <div><dt>غرف النوم</dt><dd>{record.unitMeta.bedrooms}</dd></div>
          <div><dt>الحمامات</dt><dd>{record.unitMeta.bathrooms}</dd></div>
        </dl>
      </section>

      <nav className={styles.recordTabs} aria-label="التنقل بين السجلات التشغيلية المرتبطة">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tabHref(tab.key, record.recordId)}
            className={tab.key === current ? styles.recordTabActive : styles.recordTab}
            aria-current={tab.key === current ? "page" : undefined}
          >
            <span className={styles.tabCode} dir="ltr">{tab.code}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.surfaceBody}>{children}</div>
    </WorkspaceShell>
  );
}
