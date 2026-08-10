import { InquiryExperience } from "@/components/public/PublicExperience";

type InquiryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function InquiryPage({ searchParams }: InquiryPageProps) {
  const params = await searchParams;
  const initial = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, first(value)]));
  return <InquiryExperience initial={initial} />;
}
