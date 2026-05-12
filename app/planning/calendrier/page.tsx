import { EmptyPage } from "@/components/empty-page";
export default function Page() {
  return (
    <EmptyPage
      breadcrumb={["Planning", "Calendrier"]}
      title="Calendrier (Google Agenda)"
      hint="Vue mensuelle/hebdo type Google Agenda · prochain sprint."
    />
  );
}
