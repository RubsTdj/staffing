"use client";

import { PageHeader } from "@/components/page-header";
import { AnnulationsList } from "@/components/views/annulations-list";

export default function Page() {
  return (
    <>
      <PageHeader
        breadcrumb={["Accompagnement", "Demandes d'annulation"]}
        title="Demandes d'annulation"
        subtitle="Toutes les missions où une annulation a été demandée. Le Manager Déploiement approuve ou refuse."
        showFilters={false}
      />
      <div className="px-8 py-6">
        <AnnulationsList />
      </div>
    </>
  );
}
