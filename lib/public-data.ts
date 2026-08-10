export type PropertyStatus = "available" | "soon";

export type PublicProperty = {
  id: string;
  title: string;
  district: string;
  districtKey: "narjis" | "yasmin" | "aqiq" | "malqa" | "arid";
  type: "apartment" | "villa" | "duplex" | "studio";
  typeLabel: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: PropertyStatus;
  statusLabel: string;
  summary: string;
  amenities: string[];
  mapX: number;
  mapY: number;
};

export const publicProperties: PublicProperty[] = [
  { id: "narjis-101", title: "شقة النرجس 101", district: "الرياض — حي النرجس", districtKey: "narjis", type: "apartment", typeLabel: "شقة", price: 72000, bedrooms: 2, bathrooms: 2, area: 135, status: "available", statusLabel: "متاح الآن", summary: "شقة هادئة بتوزيع عملي ومساحات معيشة مضاءة طبيعيًا، قريبة من الخدمات اليومية.", amenities: ["موقف سيارة", "مطبخ مجهز", "مصعد", "مدخل هادئ"], mapX: 52, mapY: 57 },
  { id: "yasmin-villa", title: "فيلا الياسمين", district: "الرياض — حي الياسمين", districtKey: "yasmin", type: "villa", typeLabel: "فيلا", price: 150000, bedrooms: 5, bathrooms: 5, area: 350, status: "available", statusLabel: "متاح الآن", summary: "فيلا عائلية معاصرة بخصوصية مرتفعة ومساحات واسعة ومجلس مستقل ومواقف داخلية.", amenities: ["مجلس مستقل", "غرفة معيشة واسعة", "غرفة خادمة", "موقفان للسيارات"], mapX: 61, mapY: 28 },
  { id: "aqiq-duplex", title: "دوبلكس العقيق", district: "الرياض — حي العقيق", districtKey: "aqiq", type: "duplex", typeLabel: "دوبلكس", price: 98000, bedrooms: 3, bathrooms: 3, area: 210, status: "available", statusLabel: "متاح الآن", summary: "دوبلكس عملي بطابقين مع فصل واضح بين المعيشة وغرف النوم ومساحة عائلية مريحة.", amenities: ["مدخل مستقل", "صالة عائلية", "موقف سيارة", "مساحة تخزين"], mapX: 21, mapY: 63 },
  { id: "malqa-studio", title: "استوديو الملقا", district: "الرياض — حي الملقا", districtKey: "malqa", type: "studio", typeLabel: "استوديو", price: 45000, bedrooms: 1, bathrooms: 1, area: 45, status: "soon", statusLabel: "متاح قريبًا", summary: "استوديو مدمج للاستخدام الفردي مع تخطيط بسيط وقرب من محاور الحركة والخدمات.", amenities: ["مطبخ مدمج", "دخول مستقل", "موقف مشترك"], mapX: 69, mapY: 72 },
  { id: "yasmin-12", title: "شقة الياسمين 12", district: "الرياض — حي الياسمين", districtKey: "yasmin", type: "apartment", typeLabel: "شقة", price: 66000, bedrooms: 2, bathrooms: 2, area: 110, status: "available", statusLabel: "متاح الآن", summary: "شقة متوازنة ضمن مبنى حديث، مناسبة لمن يريد مساحة مريحة بتكلفة سنوية أقل.", amenities: ["مصعد", "موقف سيارة", "مطبخ مجهز"], mapX: 72, mapY: 39 },
  { id: "arid-villa", title: "فيلا العارض", district: "الرياض — حي العارض", districtKey: "arid", type: "villa", typeLabel: "فيلا", price: 180000, bedrooms: 6, bathrooms: 6, area: 420, status: "available", statusLabel: "متاح الآن", summary: "فيلا كبيرة لعائلة تحتاج غرفًا أكثر ومساحات استقبال متعددة ضمن نطاق سكني هادئ.", amenities: ["6 غرف نوم", "مجلس", "غرفة خادمة", "موقفان للسيارات"], mapX: 38, mapY: 22 }
];

export const getPublicProperty = (id: string) => publicProperties.find((property) => property.id === id);
export const formatAnnualPrice = (price: number) => new Intl.NumberFormat("en-US").format(price);

export type SearchCriteria = { district?: string; type?: string; budget?: string; rooms?: string; availability?: string };

export function filterPublicProperties(criteria: SearchCriteria) {
  return publicProperties.filter((property) => {
    if (criteria.district && criteria.district !== "all" && property.districtKey !== criteria.district) return false;
    if (criteria.type && criteria.type !== "all" && property.type !== criteria.type) return false;
    if (criteria.rooms && criteria.rooms !== "all" && property.bedrooms < Number(criteria.rooms)) return false;
    if (criteria.availability === "now" && property.status !== "available") return false;
    if (criteria.availability === "soon" && property.status !== "soon") return false;
    if (criteria.budget === "under80" && property.price >= 80000) return false;
    if (criteria.budget === "80-130" && (property.price < 80000 || property.price > 130000)) return false;
    if (criteria.budget === "130plus" && property.price < 130000) return false;
    return true;
  });
}
