import { EmptyPage } from "@/components/empty-page";
export default function Page() {
  return (
    <EmptyPage
      breadcrumb={["Équipe", "Équité"]}
      title="Tableau d'équité"
      hint="Déplacements/personne, balance Manager vs Formateur · prochain sprint."
    />
  );
}
