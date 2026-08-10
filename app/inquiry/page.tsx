import { PersistentInquiryExperience } from "@/components/public/PersistentInquiryExperience";
import { getInquiry, getPublicPropertyFromDatabase } from "@/lib/data/repository";

type InquiryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function InquiryPage({ searchParams }: InquiryPageProps) {
  const params = await searchParams;
  const initial = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, first(value)]));
  const propertyId = initial.property ?? "narjis-101";
  const property = getPublicPropertyFromDatabase(propertyId) ?? getPublicPropertyFromDatabase("narjis-101");

  if (!property) {
    throw new Error("Deterministic RP04 listing seed is unavailable.");
  }

  const shortlist = (initial.shortlist ?? "").split(",").filter(Boolean);
  const persisted = initial.submitted ? getInquiry(initial.submitted) : null;
  const persistedInquiry = persisted?.listingId === property.id ? persisted : null;

  return (
    <PersistentInquiryExperience
      property={property}
      shortlist={shortlist}
      persistedInquiry={persistedInquiry}
    />
  );
}
