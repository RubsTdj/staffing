import { EmptyPage } from "@/components/empty-page";
export default function Page() {
  return (
    <EmptyPage
      breadcrumb={["Rapports"]}
      title="Rapport trimestriel prime de déplacement"
      hint="Export CSV : trips mutualisés / jours terrain / IDF exclu / veille 0,5j · prochain sprint."
    />
  );
}
