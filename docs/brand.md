# Identité Élan

Assets générés par `npm run brand` (`scripts/build-brand.mjs` et `scripts/build-favicons.mjs`) dans `public/brand/`. Les tracés utilisés par l'application sont écrits dans `src/components/ui/logo-data.ts` : une seule source.

## Révision : cohérence avec le style LEDGE et le hero

La première version (É en bloc gras, wordmark en bas de casse, trait de 8 unités pour une capitale de 32) contredisait le hero, écrit en Geist 300. Mesures prises sur vos assets :

| Élément | Trait / hauteur de capitale |
|---|---|
| Wordmark LEDGE (`asset 0.png`) | environ 0,11 |
| Hero (Geist 300) | environ 0,09 |
| Élan, première version | 0,25 |
| Élan, graisse légère | 0,125 (trait de 4 pour 32) |

Le wordmark passe donc en capitales légères, sans espacement forcé, comme LEDGE.

## Règle de construction (inchangée)

Capitale de 32 unités sur une grille de 8. Tous les terminaux sont coupés à 45° : barres du É, pied du L. L'accent du É est un parallélogramme à ce même angle, séparé du E par un vide de 5 unités. Le haut du A est coupé à plat, le N reste droit.

## Deux graisses optiques

- Légère (trait de 4) : wordmark et lockup, à partir de 24 px de haut. Rendu `public/brand/logo-wordmark*.svg`.
- Régulière (trait de 6) : symbole É, favicon, petites tailles. À 16 px, le trait fait plus de 2 px, les vides entre barres plus de 3 px : la lecture tient.

## Couleur

Encre `#1F1E1B` (ou `#F3F0E8` en sombre), accent bronze `#8F6D2E` (ou `#C9A66B` en sombre). Aucun dégradé dans le logo. L'accent est le seul élément coloré.

## Pistes écartées (première série)

Arc et point (lecture « signal »), fusion a+n (« élon »), hampe décalée (forme sans lecture). Le brief demande trois pistes, la liste noire interdit d'en ajouter une pour faire nombre : deux pistes défendues, une seule retenue pour la révision.

## Livrables

| Fichier | Usage |
|---|---|
| `logo-mark.svg`, `-sombre`, `-mono`, `-mono-blanc` | symbole É (graisse régulière) |
| `logo-wordmark*.svg`, `logo-lockup*.svg` | ÉLAN en capitales légères, avec zone de protection pour le lockup |
| `favicon.svg` (suit le thème), `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png` | onglet, mobile |
| `logo-mark-animated.svg` | chargement : 480 ms de révélation du É puis 320 ms pour l'accent, 800 ms au total, statique avec `prefers-reduced-motion` |

Version Élan Pro : wordmark suivi de « Pro » en 12 px, graisse 600, dans une pastille de bordure fine.

## Zone de protection et taille minimale

- Zone de protection : 8 unités sur les quatre côtés.
- Taille minimale : symbole 16 px de haut, wordmark 20 px de haut (soit 44 px de large).
- Contrôle visuel : `docs/screens/logo-gate.png` (16, 24, 48, 160 px, clair, sombre, monochrome).
