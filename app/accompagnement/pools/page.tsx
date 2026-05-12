import { EmptyPage } from "@/components/empty-page";
export default function Page() {
  return (
    <EmptyPage
      breadcrumb={["Accompagnement", "Pools"]}
      title="Pools de disponibilité"
      hint="Vue MVP à venir : cartes par client avec statuts Dispo / Backup / Indispo."
    />
  );
}
