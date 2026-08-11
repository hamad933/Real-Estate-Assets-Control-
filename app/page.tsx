import { DiscoveryExperience } from "@/components/public/PublicExperience";
import { listPublicPropertiesFromDatabase } from "@/lib/data/repository";

export default function PublicHome() {
  const properties = listPublicPropertiesFromDatabase();
  return <DiscoveryExperience properties={properties} />;
}
