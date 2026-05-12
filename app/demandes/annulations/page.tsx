"use client";

import { PageHeader } from "@/components/page-header";
import { AnnulationsList } from "@/components/views/annulations-list";

export default function Page() {
  return (
    <>
      <PageHeader
        breadcrumb={["Demandes", "Annulations"]}
        title="Demandes d'annulation"
        subtitle="Vue centralisée Inbox · approuver / refuser les annulations envoyées par les OPS."
        showFilters={false}
      />
      <div className="px-8 py-6">
        <AnnulationsList />
      </div>
    </>
  );
}
