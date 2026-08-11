"use client";

import { useMemo, useState } from "react";
import { PropertyPhoto } from "@/components/public/PropertyPhoto";
import s13Styles from "@/components/w04/PortfolioOperations.module.css";
import styles from "@/components/w04/RoleWorkspaces.module.css";
import type { PortfolioOperationsData } from "@/lib/data/types";

type PortfolioRecord = PortfolioOperationsData["records"][number];

const photoIdByRecordName: Record<string, string> = {
  "شقة النرجس 101": "narjis-101",
  "فيلا الياسمين": "yasmin-villa",
  "دوبلكس العقيق": "aqiq-duplex",
  "استوديو الملقا": "malqa-studio",
  "شقة الياسمين 12": "yasmin-12",
  "فيلا العارض": "arid-villa"
};

function stateClass(value: string) {
  if (value === "مستقر" || value === "سليم" || value === "جاهزة" || value === "مشغول") return styles.statusGood;
  if (value.includes("تدخل") || value === "متأخر") return styles.statusDanger;
  return styles.statusWarn;
}

function severityClass(value: string) {
  if (value === "عالٍ") return styles.statusDanger;
  if (value === "متوسط") return styles.statusWarn;
  return styles.statusNeutral;
}

export function PortfolioOperationsClient({ data }: { data: PortfolioOperationsData }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(data.records[0].id);
  const [reviewMode, setReviewMode] = useState(false);

  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ar");
    if (!normalized) return data.records;

    return data.records.filter((record) =>
      [record.name, record.location]
        .join(" ")
        .toLocaleLowerCase("ar")
        .includes(normalized)
    );
  }, [data.records, query]);

  const selectedRecord: PortfolioRecord =
    data.records.find((record) => record.id === selectedId) ?? data.records[0];

  function selectRecord(id: string) {
    setSelectedId(id);
    setReviewMode(false);
  }

  return (
    <div className={styles.stack}>
      <section className={styles.operationsSummary} aria-label="ملخص العمليات">
        <div><span>تحتاج متابعة</span><strong>{data.totals.followUp}</strong><small>عنصرًا</small></div>
        <div><span>سجلات نشطة</span><strong>{data.totals.activeRecords}</strong><small>سجلًا</small></div>
        <div><span>عناصر مفتوحة</span><strong>{data.totals.openConditions}</strong><small>عنصرًا</small></div>
      </section>

      <section className={styles.operationsGrid} style={{ minWidth: 0, direction: "ltr" }}>
        <div className={styles.tablePanel} style={{ minWidth: 0 }} dir="rtl">
          <div className={styles.toolbar}>
            <button
              className={styles.secondaryAction}
              type="button"
              disabled
              aria-describedby="s13-unavailable-actions"
              data-testid="s13-columns-disabled"
            >
              تخصيص الأعمدة
            </button>

            <label className={s13Styles.searchGroup}>
              <span>ابحث باسم العقار أو الوحدة</span>
              <input
                className={styles.searchBox}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="مثال: النرجس أو العقيق"
                autoComplete="off"
                data-testid="s13-search"
              />
            </label>

            <button
              className={styles.secondaryAction}
              type="button"
              disabled
              aria-describedby="s13-unavailable-actions"
              data-testid="s13-actions-disabled"
            >
              إجراءات
            </button>
          </div>

          <p className={s13Styles.toolbarNote} id="s13-unavailable-actions">
            تخصيص الأعمدة والإجراءات المجمعة غير متاحة في هذا التنفيذ المحلي؛ لا توجد إعدادات محفوظة أو عمليات خلفية ضمن W04.
          </p>

          <div className="table-wrap" style={{ maxWidth: "100%", overflowX: "auto" }}>
            <table className={styles.opsTable} aria-label="سجلات المحفظة">
              <thead>
                <tr>
                  <th>الأولوية</th>
                  <th>العقار / الوحدة</th>
                  <th>الحالة التشغيلية</th>
                  <th>الإشغال</th>
                  <th>الدفعات</th>
                  <th>الصيانة</th>
                  <th>الجاهزية</th>
                  <th>العناصر المفتوحة</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => {
                    const isSelected = record.id === selectedRecord.id;
                    return (
                      <tr
                        key={record.id}
                        data-selected={isSelected ? "true" : "false"}
                        style={{
                          background: isSelected ? "#f2f7fc" : "transparent",
                          boxShadow: isSelected ? "inset -3px 0 #0c4179" : "none"
                        }}
                      >
                        <td><span className={styles.priority}>{record.priority}</span></td>
                        <td>
                          <button
                            className={s13Styles.rowSelectButton}
                            type="button"
                            onClick={() => selectRecord(record.id)}
                            aria-pressed={isSelected}
                            aria-label={`اختيار ${record.name}`}
                          >
                            <strong>{record.name}</strong>
                            <span className={styles.miniLabel}>{record.location}</span>
                          </button>
                        </td>
                        <td><span className={stateClass(record.operationalState)}>{record.operationalState}</span></td>
                        <td><span className={stateClass(record.occupancy)}>{record.occupancy}</span></td>
                        <td><span className={stateClass(record.payments)}>{record.payments}</span></td>
                        <td><span className={stateClass(record.maintenance)}>{record.maintenance}</span></td>
                        <td><span className={stateClass(record.readiness)}>{record.readiness}</span></td>
                        <td>{record.open}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <div className={s13Styles.emptyState} data-testid="s13-no-match">
                        <strong>لا توجد سجلات مطابقة.</strong>
                        <span>لم نجد عقارًا أو وحدة تطابق “{query.trim()}”.</span>
                        <button className={styles.secondaryAction} type="button" onClick={() => setQuery("")}>
                          مسح البحث
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.footerMeta}>
            <span>النتائج المعروضة: {filteredRecords.length} من {data.records.length}</span>
            <span>ADMIN فقط</span>
          </div>
        </div>

        <aside
          className={styles.contextPanel}
          style={{ minWidth: 0 }}
          dir="rtl"
          data-testid="s13-selected-context"
        >
          <div className={styles.heroMeta}>
            <PropertyPhoto
              propertyId={photoIdByRecordName[selectedRecord.name]}
              compact
              alt={`صورة عقارية لـ ${selectedRecord.name}`}
            />
            <span className={stateClass(selectedRecord.operationalState)}>{selectedRecord.operationalState}</span>
            <h2>{selectedRecord.name}</h2>
            <p className={styles.muted}>{selectedRecord.location}</p>
          </div>

          <div className={styles.warningBox}>
            <strong>سبب الأولوية الحالية</strong>
            <p>{selectedRecord.reason}</p>
          </div>

          {reviewMode ? (
            <section className={s13Styles.reviewPanel} aria-label="مراجعة الحالات المفتوحة" data-testid="s13-review-mode">
              <div className={styles.rowBetween}>
                <div>
                  <span className={styles.kicker}>وضع المراجعة المحلي</span>
                  <h2>الحالات المفتوحة — {selectedRecord.open}</h2>
                </div>
                <button className={styles.secondaryAction} type="button" onClick={() => setReviewMode(false)}>
                  العودة إلى سياق السجل
                </button>
              </div>

              <div className={styles.conditionList}>
                {selectedRecord.conditions.map((condition) => (
                  <div className={styles.condition} key={`${selectedRecord.id}-${condition.title}`}>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ display: "block" }}>{condition.title}</strong>
                      <small style={{ display: "block", marginTop: "0.2rem" }}>تاريخ الإنشاء: {condition.date}</small>
                    </div>
                    <span className={severityClass(condition.severity)}>{condition.severity}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <div className={styles.softCard}>
              <span className={styles.kicker}>الإجراء التالي الموصى به</span>
              <p>{selectedRecord.nextAction}</p>
              <p className={styles.muted}>لدى هذا السجل {selectedRecord.open} حالات مفتوحة قابلة للمراجعة محليًا.</p>
              <button
                className={styles.primaryAction}
                type="button"
                onClick={() => setReviewMode(true)}
                data-testid="s13-review-open-conditions"
              >
                مراجعة الحالات المفتوحة
              </button>
            </div>
          )}
        </aside>
      </section>

      <section className={styles.footerMeta}>
        <span>البيانات المعروضة تركيبية ومقيدة بجلسة الإدارة الحالية.</span>
        <span>آخر تحديث تمثيلي: 09 مايو 2026 · 10:45 ص</span>
      </section>
    </div>
  );
}
