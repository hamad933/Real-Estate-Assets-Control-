import { MapExperience } from "@/components/public/PublicExperience";
import { listPublicPropertiesFromDatabase } from "@/lib/data/repository";

type MapPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  const initial = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, first(value)]));
  const properties = listPublicPropertiesFromDatabase();

  return (
    <>
      <MapExperience initial={initial} properties={properties} />
      <style>{`
        [aria-label="خريطة العقارات"] {
          position: relative;
          z-index: 1;
          align-self: stretch;
          pointer-events: none;
        }
        [aria-label="خريطة العقارات"] > button,
        [aria-label="خريطة العقارات"] > label,
        [aria-label="خريطة العقارات"] > [data-testid="map-selected-card"] {
          pointer-events: auto;
        }
        [aria-label="خريطة العقارات"] > button {
          z-index: 60;
          scroll-margin-block: 180px;
        }
        @media (min-width: 901px) {
          [aria-label="خريطة العقارات"] {
            height: 720px;
            min-height: 720px;
          }
        }
      `}</style>
    </>
  );
}
