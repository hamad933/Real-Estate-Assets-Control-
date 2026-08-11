"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PropertyPhoto } from "./PropertyPhoto";
import {
  filterPublicProperties,
  findPublicProperty,
  formatAnnualPrice,
  type PublicProperty,
  type SearchCriteria
} from "@/lib/public-data";
import { PublicFooter, PublicHeader } from "./PublicHeader";
import styles from "./PublicExperience.module.css";

type InitialQuery = Record<string, string | undefined>;
type PublicDataProps = { properties: PublicProperty[] };

type PropertyCardProps = {
  property: PublicProperty;
  shortlisted?: boolean;
  shortlistQuery?: string;
  onToggle?: (id: string) => void;
  onSelect?: (id: string) => void;
  selected?: boolean;
  compact?: boolean;
};

const districts = [
  ["all", "كل الأحياء"],
  ["narjis", "حي النرجس"],
  ["yasmin", "حي الياسمين"],
  ["aqiq", "حي العقيق"],
  ["malqa", "حي الملقا"],
  ["arid", "حي العارض"]
] as const;

const types = [
  ["all", "كل الأنواع"],
  ["apartment", "شقة"],
  ["villa", "فيلا"],
  ["duplex", "دوبلكس"],
  ["studio", "استوديو"]
] as const;

const budgets = [
  ["all", "كل الميزانيات"],
  ["under80", "أقل من 80,000"],
  ["80-130", "80,000–130,000"],
  ["130plus", "130,000 فأكثر"]
] as const;

const availabilities = [
  ["all", "كل المواعيد"],
  ["now", "متاح الآن"],
  ["soon", "متاح قريبًا"]
] as const;

function parseShortlist(properties: PublicProperty[], value?: string) {
  if (!value) return [] as string[];
  return value.split(",").filter((id) => Boolean(findPublicProperty(properties, id)));
}

function shortlistValue(ids: string[]) {
  return Array.from(new Set(ids)).join(",");
}

function updateUrlShortlist(ids: string[]) {
  const url = new URL(window.location.href);
  const value = shortlistValue(ids);
  if (value) url.searchParams.set("shortlist", value);
  else url.searchParams.delete("shortlist");
  window.history.replaceState({}, "", `${url.pathname}${url.search}`);
}

function queryWithShortlist(path: string, ids: string[]) {
  const value = shortlistValue(ids);
  return value ? `${path}${path.includes("?") ? "&" : "?"}shortlist=${encodeURIComponent(value)}` : path;
}

function initialCriteria(initial: InitialQuery): SearchCriteria {
  return {
    district: initial.district ?? "all",
    type: initial.type ?? "all",
    budget: initial.budget ?? "all",
    rooms: initial.rooms ?? "all",
    availability: initial.availability ?? "all"
  };
}

function PropertyCard({ property, shortlisted = false, shortlistQuery = "", onToggle, onSelect, selected = false, compact = false }: PropertyCardProps) {
  const detailHref = shortlistQuery
    ? `/assets/${property.id}?shortlist=${encodeURIComponent(shortlistQuery)}`
    : `/assets/${property.id}`;

  return (
    <article className={`${styles.propertyCard} ${compact ? styles.compactCard : ""} ${selected ? styles.selectedCard : ""}`} data-testid={`property-${property.id}`}>
      <div className={styles.cardVisual}>
        <PropertyPhoto propertyId={property.id} alt={`صورة عقارية لـ ${property.title}`} />
        <span className={styles.statusPill}>{property.statusLabel}</span>
        {onToggle ? (
          <button
            type="button"
            className={`${styles.heartButton} ${shortlisted ? styles.heartActive : ""}`}
            onClick={() => onToggle(property.id)}
            aria-label={shortlisted ? `إزالة ${property.title} من القائمة المختصرة` : `إضافة ${property.title} إلى القائمة المختصرة`}
            aria-pressed={shortlisted}
          >
            {shortlisted ? "♥" : "♡"}
          </button>
        ) : null}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <div>
            <h3>{property.title}</h3>
            <p>{property.district}</p>
          </div>
          <div className={styles.price}>
            <strong dir="ltr">{formatAnnualPrice(property.price)}</strong>
            <span>ريال / سنة</span>
          </div>
        </div>
        <div className={styles.factLine}>
          <span>{property.typeLabel}</span>
          <span>{property.bedrooms} غرف</span>
          <span>{property.bathrooms} دورات مياه</span>
          <span dir="ltr">{property.area} m²</span>
        </div>
        {!compact ? <p className={styles.cardSummary}>{property.summary}</p> : null}
        <div className={styles.cardLinks}>
          <Link className={styles.inlineLink} href={detailHref}>عرض التفاصيل</Link>
          {onSelect ? <button className={styles.inlineButton} type="button" onClick={() => onSelect(property.id)}>تحديد على الخريطة</button> : null}
        </div>
      </div>
    </article>
  );
}

function FilterControls({ criteria, setCriteria }: { criteria: SearchCriteria; setCriteria: (next: SearchCriteria) => void }) {
  const field = (key: keyof SearchCriteria, value: string) => setCriteria({ ...criteria, [key]: value });
  return (
    <div className={styles.filters} aria-label="فلاتر البحث">
      <label>المنطقة / الحي
        <select value={criteria.district} onChange={(event) => field("district", event.target.value)}>
          {districts.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label>نوع العقار
        <select value={criteria.type} onChange={(event) => field("type", event.target.value)}>
          {types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label>الميزانية (ريال سنويًا)
        <select value={criteria.budget} onChange={(event) => field("budget", event.target.value)}>
          {budgets.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label>عدد الغرف
        <select value={criteria.rooms} onChange={(event) => field("rooms", event.target.value)}>
          <option value="all">أي عدد</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="5">5+</option>
        </select>
      </label>
      <label>موعد التوفر
        <select value={criteria.availability} onChange={(event) => field("availability", event.target.value)}>
          {availabilities.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
    </div>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className={styles.emptyState} role="status">
      <span className={styles.emptyIcon} aria-hidden="true">⌂</span>
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </div>
  );
}

export function DiscoveryExperience({ properties }: PublicDataProps) {
  return (
    <div className={styles.publicPage}>
      <PublicHeader />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>العقارات والأصول</p>
            <h1>اعثر على المكان المناسب لك</h1>
            <p className={styles.heroLede}>اكتشف خيارات سكنية واضحة، قارن ما يهمك، وانتقل من البحث إلى الاستفسار دون تعقيد.</p>
            <form action="/search" method="get" className={styles.heroSearch} aria-label="البحث عن عقار">
              <label>موقع العقار
                <select name="district" defaultValue="all">
                  {districts.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>نوع العقار
                <select name="type" defaultValue="all">
                  {types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>الميزانية (ريال سنويًا)
                <select name="budget" defaultValue="80-130">
                  {budgets.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>موعد التوفر
                <select name="availability" defaultValue="now">
                  {availabilities.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <button className={styles.primaryButton} type="submit">عرض العقارات</button>
            </form>
            <div className={styles.quickGoals} aria-label="اختصارات البحث">
              <span>ابدأ بسرعة</span>
              <Link href="/search?type=apartment&availability=now">شقق متاحة الآن</Link>
              <Link href="/search?type=villa">فلل عائلية</Link>
              <Link href="/search?budget=under80">أقل من 80,000</Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <PropertyPhoto variant="hero" alt="واجهة سكنية معاصرة بإضاءة دافئة" />
            <div className={styles.heroCaption}><span>خيار مميز</span><strong>شقة النرجس 101</strong><small>الرياض — حي النرجس</small></div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="featured-properties">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>خيارات واضحة</p><h2 id="featured-properties">عقارات مختارة لتبدأ منها</h2></div>
            <Link className={styles.inlineLink} href="/search?district=all&type=all&budget=all&availability=all">عرض جميع العقارات</Link>
          </div>
          <div className={styles.threeGrid}>
            {properties.slice(0, 3).map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>
        </section>

        <section className={styles.discoveryMapSection}>
          <div>
            <p className={styles.eyebrow}>استكشف حسب الموقع</p>
            <h2>انتقل بين القائمة والخريطة دون فقدان سياقك</h2>
            <p>الخريطة هنا تمثيل محلي وتركيبي فقط. اختيار أي عقار يظل متزامنًا مع القائمة ويقود إلى نفس صفحة التفاصيل.</p>
            <Link className={styles.secondaryButton} href="/map">فتح عرض الخريطة</Link>
          </div>
          <div className={styles.miniMap} aria-label="خريطة تركيبية مصغرة">
            <span className={styles.mapRoadOne} /><span className={styles.mapRoadTwo} /><span className={styles.mapRoadThree} />
            {properties.slice(0, 4).map((property, index) => <span key={property.id} className={styles.miniPin} style={{ left: `${property.mapX}%`, top: `${property.mapY}%` }}>{index + 1}</span>)}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

export function SearchExperience({ initial, properties }: { initial: InitialQuery; properties: PublicProperty[] }) {
  const [criteria, setCriteria] = useState<SearchCriteria>(() => initialCriteria(initial));
  const [shortlist, setShortlist] = useState<string[]>(() => parseShortlist(properties, initial.shortlist));
  const results = useMemo(() => filterPublicProperties(properties, criteria), [properties, criteria]);
  const shortlistQuery = shortlistValue(shortlist);

  const toggle = (id: string) => {
    const next = shortlist.includes(id) ? shortlist.filter((item) => item !== id) : [...shortlist, id];
    setShortlist(next);
    updateUrlShortlist(next);
  };

  const clearFilters = () => setCriteria({ district: "all", type: "all", budget: "all", rooms: "all", availability: "all" });
  const mapHref = queryWithShortlist(`/map?district=${criteria.district}&type=${criteria.type}&budget=${criteria.budget}&rooms=${criteria.rooms}&availability=${criteria.availability}`, shortlist);

  return (
    <div className={styles.publicPage}>
      <PublicHeader shortlistCount={shortlist.length} shortlistQuery={shortlistQuery} />
      <main className={styles.pageShell}>
        <div className={styles.breadcrumb}><Link href="/">الرئيسية</Link><span>/</span><strong>نتائج البحث</strong></div>
        <section className={styles.searchTop}>
          <div><p className={styles.eyebrow}>بحثك الحالي</p><h1>عقارات مطابقة لبحثك</h1><p>عدّل أي خيار، وستتحدث النتائج فورًا باستخدام البيانات التركيبية المحلية.</p></div>
          <div className={styles.searchActions}>
            <Link className={styles.secondaryButton} href={mapHref}>عرض على الخريطة</Link>
            <button className={styles.quietButton} type="button" onClick={clearFilters}>إعادة ضبط</button>
          </div>
        </section>
        <FilterControls criteria={criteria} setCriteria={setCriteria} />
        <div className={styles.resultsMeta}><strong>{results.length} عقارات</strong><span>النتائج تتغير مباشرة مع الفلاتر</span></div>

        <div className={styles.searchLayout}>
          <section className={styles.resultList} aria-label="نتائج العقارات">
            {results.length ? results.map((property) => (
              <PropertyCard key={property.id} property={property} shortlisted={shortlist.includes(property.id)} shortlistQuery={shortlistQuery} onToggle={toggle} />
            )) : (
              <EmptyState title="لا توجد نتائج بهذه المعايير" body="غيّر الحي أو الميزانية أو نوع العقار، أو أعد ضبط الفلاتر لعرض جميع الخيارات." action={<button className={styles.primaryButton} type="button" onClick={clearFilters}>عرض جميع العقارات</button>} />
            )}
          </section>

          <aside className={styles.shortlistRail} aria-label="القائمة المختصرة">
            <div className={styles.railHeading}><div><span>قائمتك المختصرة</span><strong>{shortlist.length}</strong></div><small>اختر عقارين أو أكثر للمقارنة.</small></div>
            {shortlist.length ? (
              <div className={styles.shortlistItems}>
                {shortlist.map((id) => {
                  const property = findPublicProperty(properties, id);
                  if (!property) return null;
                  return <div className={styles.shortlistItem} key={id}><div><strong>{property.title}</strong><span>{formatAnnualPrice(property.price)} ريال</span></div><button type="button" onClick={() => toggle(id)} aria-label={`إزالة ${property.title}`}>×</button></div>;
                })}
              </div>
            ) : <p className={styles.railEmpty}>أضف العقارات التي تريد الرجوع إليها هنا.</p>}
            <Link aria-disabled={shortlist.length < 2} className={`${styles.primaryButton} ${shortlist.length < 2 ? styles.disabledLink : ""}`} href={shortlist.length >= 2 ? `/compare?shortlist=${encodeURIComponent(shortlistQuery)}` : "#"}>مقارنة المختارة</Link>
          </aside>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export function MapExperience({ initial, properties }: { initial: InitialQuery; properties: PublicProperty[] }) {
  const [criteria, setCriteria] = useState<SearchCriteria>(() => initialCriteria(initial));
  const shortlist = parseShortlist(properties, initial.shortlist);
  const shortlistQuery = shortlistValue(shortlist);
  const results = useMemo(() => filterPublicProperties(properties, criteria), [properties, criteria]);
  const [selected, setSelected] = useState<string>(() => results[0]?.id ?? "");
  const [areaOnly, setAreaOnly] = useState(false);
  const visible = areaOnly ? results.filter((_, index) => index % 2 === 0) : results;
  const selectedProperty = visible.find((property) => property.id === selected) ?? visible[0];

  return (
    <div className={styles.publicPage}>
      <PublicHeader active="map" shortlistCount={shortlist.length} shortlistQuery={shortlistQuery} />
      <main className={styles.mapPage}>
        <section className={styles.mapToolbar}>
          <div><p className={styles.eyebrow}>استكشاف مكاني</p><h1>الخريطة والقائمة</h1><p>تمثيل محلي ثابت؛ لا يوجد مزوّد خرائط أو اتصال خارجي.</p></div>
          <Link className={styles.secondaryButton} href={queryWithShortlist("/search", shortlist)}>العودة إلى القائمة</Link>
        </section>
        <FilterControls criteria={criteria} setCriteria={(next) => { setCriteria(next); setSelected(""); }} />
        <div className={styles.mapWorkspace}>
          <section className={styles.mapCanvas} aria-label="خريطة محلية تركيبية للعقارات">
            <span className={styles.mapLabelNorth}>طريق الملك سلمان</span>
            <span className={styles.mapLabelCenter}>طريق الملك فهد</span>
            <span className={styles.mapRoadOne} /><span className={styles.mapRoadTwo} /><span className={styles.mapRoadThree} /><span className={styles.mapRoadFour} />
            {visible.map((property, index) => (
              <button key={property.id} type="button" className={`${styles.mapPin} ${selectedProperty?.id === property.id ? styles.mapPinActive : ""}`} style={{ left: `${property.mapX}%`, top: `${property.mapY}%` }} onClick={() => setSelected(property.id)} aria-label={`تحديد ${property.title}`}>{index + 1}</button>
            ))}
            {selectedProperty ? (
              <div className={styles.mapPopup} data-testid="map-selected-card">
                <span>{selectedProperty.statusLabel}</span>
                <strong>{selectedProperty.title}</strong>
                <small>{selectedProperty.district}</small>
                <b><span dir="ltr">{formatAnnualPrice(selectedProperty.price)}</span> ريال / سنة</b>
                <Link href={queryWithShortlist(`/assets/${selectedProperty.id}`, shortlist)}>عرض التفاصيل</Link>
              </div>
            ) : null}
            <label className={styles.areaToggle}><input type="checkbox" checked={areaOnly} onChange={(event) => { setAreaOnly(event.target.checked); setSelected(""); }} />البحث داخل هذه المنطقة فقط</label>
          </section>

          <aside className={styles.mapList}>
            <div className={styles.mapListHeading}><div><strong>{visible.length} عقارات على الخريطة</strong><span>اختر بطاقة أو علامة لتوحيد التحديد.</span></div></div>
            {visible.length ? visible.map((property) => <PropertyCard key={property.id} property={property} compact selected={selectedProperty?.id === property.id} shortlistQuery={shortlistQuery} onSelect={setSelected} />) : <EmptyState title="لا توجد عقارات هنا" body="وسّع الفلاتر أو ألغِ خيار البحث داخل المنطقة فقط." />}
          </aside>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export function AssetDetailExperience({ property, initial, properties }: { property?: PublicProperty; initial: InitialQuery; properties: PublicProperty[] }) {
  const [shortlist, setShortlist] = useState<string[]>(() => parseShortlist(properties, initial.shortlist));
  const shortlistQuery = shortlistValue(shortlist);

  if (!property) {
    return <div className={styles.publicPage}><PublicHeader /><main className={styles.pageShell}><EmptyState title="العقار غير موجود" body="قد يكون الرابط غير صحيح. ارجع إلى نتائج البحث لاختيار عقار متاح." action={<Link className={styles.primaryButton} href="/search">العودة إلى البحث</Link>} /></main><PublicFooter /></div>;
  }

  const toggle = () => {
    const next = shortlist.includes(property.id) ? shortlist.filter((id) => id !== property.id) : [...shortlist, property.id];
    setShortlist(next);
    updateUrlShortlist(next);
  };
  const inquiryHref = queryWithShortlist(`/inquiry?property=${property.id}`, shortlist);

  return (
    <div className={styles.publicPage}>
      <PublicHeader shortlistCount={shortlist.length} shortlistQuery={shortlistQuery} />
      <main className={styles.pageShell}>
        <div className={styles.breadcrumb}><Link href="/">الرئيسية</Link><span>/</span><Link href={queryWithShortlist("/search", shortlist)}>العقارات</Link><span>/</span><strong>{property.title}</strong></div>
        <section className={styles.detailHero}>
          <div className={styles.detailGallery}>
            <div className={styles.galleryMain}><PropertyPhoto propertyId={property.id} alt={`الصورة الرئيسية لـ ${property.title}`} /></div>
            <div className={styles.gallerySmall}><PropertyPhoto propertyId={property.id} variant="secondary" alt={`صورة سكنية إضافية لـ ${property.title}`} /><PropertyPhoto propertyId={property.id} variant="tertiary" alt={`صورة سكنية إضافية ثانية لـ ${property.title}`} /></div>
          </div>
          <div className={styles.detailIdentity}>
            <span className={styles.statusPill}>{property.statusLabel}</span>
            <h1>{property.title}</h1>
            <p className={styles.detailDistrict}>{property.district}</p>
            <p>{property.summary}</p>
            <div className={styles.detailActions}><Link className={styles.primaryButton} href={inquiryHref}>طلب زيارة أو استفسار</Link><button className={styles.secondaryButton} type="button" onClick={toggle}>{shortlist.includes(property.id) ? "إزالة من المختصرة" : "حفظ للمقارنة"}</button></div>
          </div>
          <aside className={styles.factsPanel}>
            <div className={styles.bigPrice}><strong dir="ltr">{formatAnnualPrice(property.price)}</strong><span>ريال / سنة</span></div>
            <dl>
              <div><dt>نوع العقار</dt><dd>{property.typeLabel}</dd></div>
              <div><dt>غرف النوم</dt><dd>{property.bedrooms}</dd></div>
              <div><dt>دورات المياه</dt><dd>{property.bathrooms}</dd></div>
              <div><dt>المساحة</dt><dd dir="ltr">{property.area} m²</dd></div>
              <div><dt>التوفر</dt><dd>{property.statusLabel}</dd></div>
            </dl>
          </aside>
        </section>

        <section className={styles.detailContent}>
          <article><p className={styles.eyebrow}>ما يميز العقار</p><h2>مزايا واضحة قبل التواصل</h2><div className={styles.amenities}>{property.amenities.map((item) => <span key={item}>✓ {item}</span>)}</div></article>
          <article><p className={styles.eyebrow}>معلومات العرض</p><h2>ما الذي ستراه هنا؟</h2><p>هذه الصفحة تستخدم بيانات تركيبية فقط لإثبات تدفق التصفح. لا توجد عقود، هويات، مدفوعات، أو مستندات حقيقية متاحة للزائر.</p><div className={styles.documentRows}><span>تفاصيل المساحة والتوزيع</span><span>معلومات التوفر الحالية</span><span>وسيلة الانتقال إلى الاستفسار</span></div></article>
          <article><p className={styles.eyebrow}>الموقع التقريبي</p><h2>{property.district}</h2><div className={styles.locationPreview}><span className={styles.mapRoadOne} /><span className={styles.mapRoadTwo} /><span className={styles.miniPin} style={{ left: "52%", top: "46%" }}>⌂</span></div></article>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

type Priority = "cost" | "space" | "rooms" | "available";
const priorityLabel: Record<Priority, string> = { cost: "التكلفة السنوية", space: "المساحة", rooms: "عدد الغرف", available: "التوفر الآن" };

function recommendation(properties: PublicProperty[], priority: Priority) {
  const sorted = [...properties];
  if (priority === "cost") sorted.sort((a, b) => a.price - b.price);
  if (priority === "space") sorted.sort((a, b) => b.area - a.area);
  if (priority === "rooms") sorted.sort((a, b) => b.bedrooms - a.bedrooms);
  if (priority === "available") sorted.sort((a, b) => Number(b.status === "available") - Number(a.status === "available") || a.price - b.price);
  return sorted[0];
}

export function ComparisonExperience({ initial, properties: catalog }: { initial: InitialQuery; properties: PublicProperty[] }) {
  const [ids, setIds] = useState<string[]>(() => parseShortlist(catalog, initial.shortlist));
  const [priority, setPriority] = useState<Priority>("cost");
  const properties = ids.map((id) => findPublicProperty(catalog, id)).filter((item): item is PublicProperty => Boolean(item));
  const recommended = properties.length ? recommendation(properties, priority) : undefined;
  const shortlistQuery = shortlistValue(ids);

  const remove = (id: string) => {
    const next = ids.filter((item) => item !== id);
    setIds(next);
    updateUrlShortlist(next);
  };

  if (properties.length < 2) {
    return <div className={styles.publicPage}><PublicHeader shortlistCount={properties.length} shortlistQuery={shortlistQuery} /><main className={styles.pageShell}><EmptyState title="أضف عقارين على الأقل للمقارنة" body="المقارنة تعمل فقط على قائمتك المختصرة، ولا نضيف خيارات أو درجات من تلقاء أنفسنا." action={<Link className={styles.primaryButton} href={queryWithShortlist("/search", ids)}>العودة إلى البحث</Link>} /></main><PublicFooter /></div>;
  }

  return (
    <div className={styles.publicPage}>
      <PublicHeader shortlistCount={properties.length} shortlistQuery={shortlistQuery} />
      <main className={styles.pageShell}>
        <div className={styles.breadcrumb}><Link href={queryWithShortlist("/search", ids)}>نتائج البحث</Link><span>/</span><strong>المقارنة</strong></div>
        <section className={styles.compareHeading}><div><p className={styles.eyebrow}>مقارنة مباشرة</p><h1>قارن الخيارات التي اخترتها</h1><p>لا توجد درجة إجمالية أو ذكاء اصطناعي. التوصية أدناه تتبع الأولوية التي تختارها أنت فقط.</p></div></section>
        <div className={styles.compareCards}>{properties.map((property) => <div key={property.id} className={styles.compareCard}><PropertyPhoto propertyId={property.id} alt={`صورة عقارية لـ ${property.title}`} /><div><h2>{property.title}</h2><p>{property.district}</p><strong><span dir="ltr">{formatAnnualPrice(property.price)}</span> ريال / سنة</strong><button type="button" onClick={() => remove(property.id)}>إزالة من المقارنة</button></div></div>)}</div>

        <section className={styles.priorityPanel} aria-labelledby="priority-title">
          <div><p className={styles.eyebrow}>أولويتك</p><h2 id="priority-title">ما العامل الأهم لك الآن؟</h2><p>اختيارك يغيّر التوصية بطريقة معلنة وحتمية.</p></div>
          <div className={styles.priorityOptions}>
            {(Object.keys(priorityLabel) as Priority[]).map((value) => <button key={value} className={priority === value ? styles.priorityActive : ""} type="button" onClick={() => setPriority(value)} aria-pressed={priority === value}>{priorityLabel[value]}</button>)}
          </div>
        </section>

        <div className={styles.tableWrap}>
          <table className={styles.compareTable}>
            <thead><tr><th>العامل</th>{properties.map((property) => <th key={property.id}>{property.title}</th>)}</tr></thead>
            <tbody>
              <tr><th>السعر السنوي</th>{properties.map((property) => <td key={property.id} dir="ltr">{formatAnnualPrice(property.price)}</td>)}</tr>
              <tr><th>المساحة</th>{properties.map((property) => <td key={property.id} dir="ltr">{property.area} m²</td>)}</tr>
              <tr><th>الغرف</th>{properties.map((property) => <td key={property.id}>{property.bedrooms}</td>)}</tr>
              <tr><th>التوفر</th>{properties.map((property) => <td key={property.id}>{property.statusLabel}</td>)}</tr>
              <tr><th>النوع</th>{properties.map((property) => <td key={property.id}>{property.typeLabel}</td>)}</tr>
            </tbody>
          </table>
        </div>

        {recommended ? (
          <section className={styles.recommendation} data-testid="recommendation">
            <div><span>وفق أولويتك: {priorityLabel[priority]}</span><h2>{recommended.title}</h2><p>{priority === "cost" ? "هو الأقل تكلفة سنويًا بين الخيارات المختارة." : priority === "space" ? "يوفر أكبر مساحة بين الخيارات المختارة." : priority === "rooms" ? "يوفر أكبر عدد غرف بين الخيارات المختارة." : "متاح الآن، ومع التعادل نعرض الأقل تكلفة سنويًا."}</p><small>هذه قاعدة مقارنة معلنة وليست تقييمًا شاملاً أو درجة مخفية.</small></div>
            <div className={styles.recommendationActions}><Link className={styles.secondaryButton} href={queryWithShortlist(`/assets/${recommended.id}`, ids)}>مراجعة التفاصيل</Link><Link className={styles.primaryButton} href={queryWithShortlist(`/inquiry?property=${recommended.id}`, ids)}>الاستفسار عن هذا الخيار</Link></div>
          </section>
        ) : null}
      </main>
      <PublicFooter />
    </div>
  );
}
