"use client";

import { useEffect } from "react";
import Link from "next/link";

// Alias historique vers /clients.
// Le router.replace() de Next dans un useEffect provoque React #185
// (Maximum update depth exceeded) car l'objet router peut changer
// d'identité entre renders. Hard redirect une seule fois.
export default function Page() {
  useEffect(() => {
    window.location.replace(
      window.location.pathname.replace(/\/centres\/?$/, "/"),
    );
  }, []);

  return (
    <div className="flex h-full items-center justify-center p-8 text-[var(--color-ink-3)]">
      Redirection vers&nbsp;
      <Link href="/clients" className="text-[var(--color-accent)] underline">
        Clients
      </Link>
      …
    </div>
  );
}
