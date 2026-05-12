import { EmptyPage } from "@/components/empty-page";
export default function Page() {
  return (
    <EmptyPage
      breadcrumb={["Demandes", "Une idée ? Un problème ?"]}
      title="Une idée ? Un problème ?"
      hint="Vue MVP à venir : formulaire Titre / Type / Priorité / Description + dépôt de fichier."
    />
  );
}
