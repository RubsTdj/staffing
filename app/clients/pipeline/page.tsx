import { EmptyPage } from "@/components/empty-page";
export default function Page() {
  return (
    <EmptyPage
      breadcrumb={["Clients", "Pipeline"]}
      title="Pipeline commercial"
      hint="Vue Kanban Suspect → Ressenti → Accord → Signé · prochain sprint."
    />
  );
}
