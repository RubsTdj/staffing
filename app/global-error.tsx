"use client";

// Affiche la vraie erreur au lieu de "This page couldn't load".
// Aide à diagnostiquer en prod minified (cliquer "Voir détail" donne
// le nom du composant et la stack).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          padding: 32,
          fontFamily: "system-ui, sans-serif",
          background: "#f1f3f7",
          color: "#0b1220",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            background: "#fff",
            border: "1px solid #d6dbe4",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 1px 2px rgba(11,18,32,.05)",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600 }}>
            Erreur côté client
          </div>
          <h1 style={{ marginTop: 8, fontSize: 22, fontWeight: 700 }}>
            {error.name || "Error"}
          </h1>
          <p style={{ marginTop: 4, fontSize: 14, color: "#1f2937" }}>
            {error.message || "Pas de message"}
          </p>
          {error.digest && (
            <p style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
              Digest : <code>{error.digest}</code>
            </p>
          )}
          {error.stack && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer", fontSize: 12, color: "#1d4ed8" }}>
                Voir la stack
              </summary>
              <pre
                style={{
                  marginTop: 8,
                  padding: 12,
                  background: "#0b1220",
                  color: "#fafafa",
                  fontSize: 11,
                  overflow: "auto",
                  borderRadius: 6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {error.stack}
              </pre>
            </details>
          )}
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "1px solid #1e40af",
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("popsgo-staffing-v2");
                  window.location.reload();
                }
              }}
              style={{
                background: "#fff",
                color: "#1f2937",
                border: "1px solid #d6dbe4",
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Reset état + reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
