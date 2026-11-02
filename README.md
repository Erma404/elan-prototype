# Élan, prototype « Demande de financement guidée »

Prototype web cliquable du parcours de demande de financement d'Élan, plateforme (fictive) d'un financeur public des petites entreprises. Données fictives.

## Lancer

```bash
npm install
npm run dev        # http://127.0.0.1:5173
npm run build      # production
npm test           # tests unitaires (moteur d'éligibilité)
npm run axe        # audit accessibilité (le serveur de développement doit tourner)
npm run fit        # vérifie que chaque écran tient dans la fenêtre sans scroll
npm run shots      # captures dans docs/screens/
```

## Parcours

| Route | Écran |
|---|---|
| `/` | Hero, entrée dans le prototype |
| `/eligibilite` | Écran 1 : pré-éligibilité en 5 questions, financements possibles en direct |
| `/demande/pieces` | Écran 2 : pièces guidées, assistant IA, invitation de l'experte-comptable |
| `/demande/recapitulatif`, `/demande/envoyee` | Récapitulatif, envoi, confirmation |
| `/expert/:token` | Vue de l'experte-comptable (pièces seulement) |
| `/pro/dossiers/:id` | Écran 3 : fiche dossier dans Élan Pro |
| `/styleguide` | Système de design |

Le panneau de démo s'ouvre avec **Maj + D** (ou le bouton « Démo » de l'en-tête) : scénarios, erreurs injectables, visite guidée, onglet Mesure.

## Structure

`src/{app,components,features,domain,mocks,styles,lib}`. Le moteur d'éligibilité est une fonction pure (`src/domain/eligibility.ts`) alimentée par `src/domain/financements.json`. L'API est simulée dans `src/mocks/`.

## Jetons et reskin

Tous les composants consomment des variables sémantiques de `src/styles/tokens.css` (`--color-bg`, `--color-accent`, `--radius-card`...). Modifier ce fichier suffit à reskinner l'application. `npm run tokens:check` valide le contraste AA, en clair et en sombre.

## Marque

`npm run brand` génère le logo, le wordmark, les favicons et le symbole animé depuis une seule construction géométrique (`scripts/build-brand.mjs`). Détail dans `docs/brand.md`.

## Décisions et documentation

`docs/decisions.md` consigne chaque décision et le registre des données inventées. Autres documents : `docs/parcours-cible.md`, `docs/design-tokens.md`, `docs/brand.md`.

Pile : Vite, React 18, TypeScript, Tailwind CSS v4, Radix UI, Framer Motion, Zustand, Zod, Vitest, Playwright.
