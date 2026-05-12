# Popsgo — Operating workspace

Prototype frontend d'un OS de staffing médical. Pas de backend : tout
le state est mocké côté client avec Zustand.

## Stack

- Next.js 16 (App Router) — **static export**
- Tailwind v4
- Zustand (mock store)
- lucide-react
- Geist + Instrument Serif (Google Fonts)

## Dev local

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Déploiement GitHub Pages

L'app est servie statiquement à `https://<owner>.github.io/staffing/`.

Le workflow `.github/workflows/deploy-pages.yml` build et déploie sur
chaque push vers `main`.

### Activer Pages (une seule fois)

1. **Settings → Pages → Build and deployment → Source : `GitHub Actions`**
2. Push sur `main` ou lancer le workflow manuellement (onglet *Actions* → *Deploy to GitHub Pages* → *Run workflow*).
3. L'URL apparaît dans le résumé du job *deploy*.

Le `basePath` est injecté via la variable d'env `NEXT_PUBLIC_BASE_PATH`
(positionnée à `/staffing` dans le workflow). En local, elle est vide
donc l'app vit à la racine.
