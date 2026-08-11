import { ComparisonExperience } from "@/components/public/PublicExperience";
import { listPublicPropertiesFromDatabase } from "@/lib/data/repository";

type ComparisonPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ComparisonPage({ searchParams }: ComparisonPageProps) {
  const params = await searchParams;
  const initial = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, first(value)]));
  const properties = listPublicPropertiesFromDatabase();
  return <ComparisonExperience initial={initial} properties={properties} />;
}
