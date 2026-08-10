import { AssetDetailExperience } from "@/components/public/PublicExperience";

type AssetDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AssetDetailPage({ params, searchParams }: AssetDetailPageProps) {
  const { id } = await params;
  const rawSearch = await searchParams;
  const initial = Object.fromEntries(Object.entries(rawSearch).map(([key, value]) => [key, first(value)]));
  return <AssetDetailExperience propertyId={id} initial={initial} />;
}
