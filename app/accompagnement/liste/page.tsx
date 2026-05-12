import { EmptyPage } from "@/components/empty-page";
export default function Page() {
  return (
    <EmptyPage
      breadcrumb={["Accompagnement", "Liste"]}
      title="Liste des accompagnements"
      hint="Vue MVP à venir : tableau groupé par client/centre, drawer d'assignation."
    />
  );
}
