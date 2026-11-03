# Identité Élan

Marque générée par `npm run brand` (`scripts/build-brand-html.mjs`) dans `html/brand/` et `html/js/logo-data.js`.

## Choix retenu : « élan » en bas de casse, symbole « é »

Trois pistes comparées à 16, 24 et 48 px (`docs/screens/logo-variantes.png`) :

| Piste | Verdict |
|---|---|
| Capitales fines ÉLAN | propre mais anonyme |
| Capitales avec ligature LA | le pied du L fusionne avec le A : bloc illisible à 16 px, écartée |
| **Bas de casse « élan », trait de 6** | **retenue** : lecture nette à 16 px, caractère propre |

Règle de construction : x-height de 32 unités sur une grille de 8, trait de 6, tous les terminaux coupés à 45°. Le « l » est coupé dans le prolongement de l'accent du « é » (parallélogramme à 45°, seul élément coloré). Le symbole est le « é » seul. Espacements ajustés lettre à lettre (le « n » resserré après comparaison).

Couleurs : encre `#1F1E1B` (`#F3F0E8` en sombre), accent bronze `#8F6D2E` (`#C9A66B` en sombre). Aucun dégradé dans le logo.

## Livrables (`html/brand/`)

`logo-mark*.svg` (é seul), `logo-wordmark*.svg` et `logo-lockup*.svg` (« élan »), en clair, sombre, monochrome et monochrome blanc ; `favicon.svg` (tuile pleine, inversée en mode sombre), `favicon.ico` (16, 32, 48), `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png` (régénérés par `npm run favicon`) ; `logo-mark-animated.svg` (480 ms de révélation puis 320 ms pour l'accent, 800 ms au total, statique avec `prefers-reduced-motion`).

## Zone de protection et taille minimale

Zone de protection : 8 unités. Taille minimale : symbole 16 px de haut, mot-symbole 20 px de haut. Contrôle : `docs/screens/logo-choisi-reel.png`.

## Historique

Une première série (arc et point, fusion a+n, hampe décalée) a été détruite ; une seconde (monogramme É et capitales fines) a été remplacée après comparaison avec le wordmark de la référence LEDGE (trait d'environ 0,11 de la hauteur de capitale) puis avec les variantes ci-dessus.

## Favicon

Révision : le « é » seul sur fond transparent était fin et presque invisible dans un onglet sombre. Il est maintenant sur une tuile pleine (encre et « é » crème en clair ; crème et « é » encre en sombre), avec l'accent bronze. Aperçus : `docs/screens/favicon-light.png` et `favicon-dark.png`.
