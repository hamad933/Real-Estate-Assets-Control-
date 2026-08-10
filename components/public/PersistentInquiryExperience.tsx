"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { submitInquiryAction } from "@/app/inquiry/actions";
import { PropertyPhoto } from "@/components/public/PropertyPhoto";
import { PublicFooter, PublicHeader } from "@/components/public/PublicHeader";
import styles from "@/components/public/PublicExperience.module.css";
import { formatAnnualPrice, type PublicProperty } from "@/lib/public-data";
import type { PersistedInquiry } from "@/lib/data/types";

type InquiryErrors = Partial<Record<"date" | "name" | "phone" | "email", string>>;

type Props = {
  property: PublicProperty;
  shortlist: string[];
  persistedInquiry: PersistedInquiry | null;
};

function shortlistValue(ids: string[]) {
  return Array.from(new Set(ids)).join(",");
}

function queryWithShortlist(path: string, ids: string[]) {
  const value = shortlistValue(ids);
  return value ? `${path}${path.includes("?") ? "&" : "?"}shortlist=${encodeURIComponent(value)}` : path;
}

export function PersistentInquiryExperience({ property, shortlist, persistedInquiry }: Props) {
  const router = useRouter();
  const shortlistQuery = shortlistValue(shortlist);
  const [purpose, setPurpose] = useState<"visit" | "question" | "availability">("visit");
  const [contact, setContact] = useState<"phone" | "message" | "email">("phone");
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const date = String(data.get("date") ?? "");
    const period = String(data.get("period") ?? "evening") as "morning" | "afternoon" | "evening";
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const next: InquiryErrors = {};

    if (!date) next.date = "اختر تاريخًا مناسبًا للزيارة.";
    if (name.length < 2) next.name = "أدخل اسمًا من حرفين على الأقل.";
    if (!/^05\d{8}$/.test(phone)) next.phone = "أدخل رقم جوال تجريبيًا بصيغة 05XXXXXXXX.";
    else if (phone !== "0500000000") next.phone = "استخدم الرقم التجريبي 0500000000 في هذا المختبر المحلي.";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "أدخل بريدًا إلكترونيًا صحيح الصيغة أو اترك الحقل فارغًا.";
    }

    setErrors(next);
    setServerError("");
    if (Object.keys(next).length > 0) return;

    startTransition(async () => {
      const result = await submitInquiryAction({
        listingId: property.id,
        purpose,
        proposedDate: date,
        period,
        contactMethod: contact
      });

      if (!result.ok) {
        setServerError(result.error);
        return;
      }

      const query = new URLSearchParams({ property: property.id, submitted: result.inquiry.displayId });
      if (shortlistQuery) query.set("shortlist", shortlistQuery);
      router.replace(`/inquiry?${query.toString()}`);
    });
  };

  if (persistedInquiry) {
    return (
      <div className={styles.publicPage}>
        <PublicHeader shortlistCount={shortlist.length} shortlistQuery={shortlistQuery} />
        <main className={styles.pageShell}>
          <section className={styles.confirmation} role="status">
            <span className={styles.confirmationIcon}>✓</span>
            <p className={styles.eyebrow}>تم تسجيل الطلب محليًا</p>
            <h1>شكرًا، تم إنشاء تأكيد تجريبي</h1>
            <p>
              تم حفظ سجل تنسيق تركيبي داخل قاعدة SQLite المحلية فقط. لم يُنشأ رقم CRM، ولم تُرسل البيانات إلى موظف أو نظام أو جهة خارجية.
            </p>
            <div className={styles.confirmationProperty}>
              <strong>{persistedInquiry.propertyTitle}</strong>
              <span>{persistedInquiry.district}</span>
              <bdi className="ltr-id" data-testid="persisted-inquiry-id">{persistedInquiry.displayId}</bdi>
            </div>
            <div className={styles.confirmationActions}>
              <Link className={styles.primaryButton} href={queryWithShortlist(`/assets/${persistedInquiry.listingId}`, shortlist)}>
                العودة إلى العقار
              </Link>
              <Link className={styles.secondaryButton} href="/search">استكشاف عقارات أخرى</Link>
            </div>
          </section>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className={styles.publicPage}>
      <PublicHeader shortlistCount={shortlist.length} shortlistQuery={shortlistQuery} />
      <main className={styles.pageShell}>
        <div className={styles.breadcrumb}>
          <Link href={queryWithShortlist(`/assets/${property.id}`, shortlist)}>{property.title}</Link>
          <span>/</span>
          <strong>الاستفسار والتنسيق</strong>
        </div>
        <section className={styles.inquiryHeading}>
          <p className={styles.eyebrow}>خطوة واضحة قبل التواصل</p>
          <h1>طلب زيارة أو استفسار</h1>
          <p>اختر ما تحتاجه وأدخل بيانات تواصل تجريبية. لن تُرسل أي بيانات إلى جهة خارجية.</p>
        </section>
        <div className={styles.inquiryLayout}>
          <form className={styles.inquiryForm} onSubmit={submit} noValidate>
            <fieldset>
              <legend><span>01</span>ما الذي تريده؟</legend>
              <div className={styles.choiceGrid}>
                {[["visit", "طلب زيارة"], ["question", "استفسار عن العقار"], ["availability", "تأكيد التوفر"]].map(([value, label]) => (
                  <label key={value} className={purpose === value ? styles.choiceActive : ""}>
                    <input
                      type="radio"
                      name="purpose"
                      value={value}
                      checked={purpose === value}
                      onChange={() => setPurpose(value as typeof purpose)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend><span>02</span>موعد مناسب</legend>
              <div className={styles.formGrid}>
                <label>
                  تاريخ مقترح
                  <input name="date" type="date" aria-invalid={Boolean(errors.date)} />
                  {errors.date ? <small className={styles.fieldError}>{errors.date}</small> : null}
                </label>
                <label>
                  الفترة
                  <select name="period" defaultValue="evening">
                    <option value="morning">صباحًا</option>
                    <option value="afternoon">بعد الظهر</option>
                    <option value="evening">مساءً</option>
                  </select>
                </label>
              </div>
            </fieldset>
            <fieldset>
              <legend><span>03</span>طريقة التواصل المفضلة</legend>
              <div className={styles.choiceGrid}>
                {[["phone", "اتصال هاتفي"], ["message", "رسالة نصية"], ["email", "بريد إلكتروني"]].map(([value, label]) => (
                  <label key={value} className={contact === value ? styles.choiceActive : ""}>
                    <input
                      type="radio"
                      name="contact"
                      value={value}
                      checked={contact === value}
                      onChange={() => setContact(value as typeof contact)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend><span>04</span>بيانات التواصل</legend>
              <div className={styles.formGrid}>
                <label>
                  الاسم
                  <input name="name" type="text" autoComplete="name" aria-invalid={Boolean(errors.name)} />
                  {errors.name ? <small className={styles.fieldError}>{errors.name}</small> : null}
                </label>
                <label>
                  رقم الجوال
                  <input name="phone" type="tel" inputMode="tel" placeholder="0500000000" dir="ltr" aria-invalid={Boolean(errors.phone)} />
                  {errors.phone ? <small className={styles.fieldError}>{errors.phone}</small> : null}
                </label>
                <label className={styles.fullField}>
                  البريد الإلكتروني (اختياري)
                  <input name="email" type="email" dir="ltr" placeholder="name@example.test" aria-invalid={Boolean(errors.email)} />
                  {errors.email ? <small className={styles.fieldError}>{errors.email}</small> : null}
                </label>
                <label className={styles.fullField}>
                  ملاحظات (اختياري)
                  <textarea name="notes" rows={4} placeholder="اكتب سؤالًا أو تفاصيل توقيت تساعد على التنسيق." />
                </label>
              </div>
            </fieldset>
            <button className={styles.primaryButton} type="submit" disabled={isPending}>
              {isPending ? "جارٍ الحفظ محليًا..." : "إرسال الطلب التجريبي"}
            </button>
            {serverError ? <p className={styles.fieldError} role="alert">{serverError}</p> : null}
            <p className={styles.formFootnote}>
              الإرسال يحفظ سجل تنسيق تركيبيًا فقط في قاعدة SQLite المحلية. لا تُحفظ بيانات الاسم أو الهاتف أو البريد أو الملاحظات المدخلة، ولا توجد مراسلة أو CRM أو ضمان حجز.
            </p>
          </form>

          <aside className={styles.inquirySummary}>
            <div className={styles.summaryVisual}>
              <PropertyPhoto propertyId={property.id} alt={`صورة عقارية لـ ${property.title}`} />
            </div>
            <span className={styles.statusPill}>{property.statusLabel}</span>
            <h2>{property.title}</h2>
            <p>{property.district}</p>
            <div className={styles.bigPrice}>
              <strong dir="ltr">{formatAnnualPrice(property.price)}</strong>
              <span>ريال / سنة</span>
            </div>
            <dl>
              <div><dt>النوع</dt><dd>{property.typeLabel}</dd></div>
              <div><dt>الغرف</dt><dd>{property.bedrooms}</dd></div>
              <div><dt>المساحة</dt><dd dir="ltr">{property.area} m²</dd></div>
            </dl>
            <Link className={styles.inlineLink} href={queryWithShortlist(`/assets/${property.id}`, shortlist)}>
              مراجعة تفاصيل العقار
            </Link>
          </aside>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
