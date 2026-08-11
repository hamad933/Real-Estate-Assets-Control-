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

export const formatAnnualPrice = (price: number) => new Intl.NumberFormat("en-US").format(price);

export type SearchCriteria = {
  district?: string;
  type?: string;
  budget?: string;
  rooms?: string;
  availability?: string;
};

export function findPublicProperty(properties: PublicProperty[], id: string) {
  return properties.find((property) => property.id === id);
}

export function filterPublicProperties(properties: PublicProperty[], criteria: SearchCriteria) {
  return properties.filter((property) => {
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
