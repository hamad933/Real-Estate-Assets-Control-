import { SearchExperience } from "@/components/public/PublicExperience";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const initial = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, first(value)]));
  return <SearchExperience initial={initial} />;
}
