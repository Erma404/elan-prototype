# Analyse de référence : qonto.com/fr

Relevé par script Playwright (`scripts/analyze-reference.mjs`), viewport 1440 px, le 2 novembre 2026.
Capture : `docs/screens/_reference-qonto-hero.png`. Usage : comprendre l'esprit, jamais reproduire la lettre.

## Relevé brut

| Domaine | Valeurs observées |
|---|---|
| Police | Sans géométrique propriétaire, graisses 400 (majorité), 600 (titres de cartes), 700 (titre hero) |
| Échelle de taille / interligne | 12/18, 14/22, 16/26, 18/28, 22/32, 24/32, 40/48, 56/64, 68/75 |
| Titre hero | 68 px, graisse 700, interligne 75 px, blanc sur photo sombre |
| Titres de section | 56 px / 600, 40 px / 600, 24 px / 600 |
| Texte | quasi noir `rgb(5,5,5)`, gris `rgb(61,61,61)`, blanc, gris clair `rgb(204,204,204)` sur fond sombre |
| Fonds | blanc, noir `rgb(5,5,5)`, gris très clair `rgb(245,245,245)` et `rgb(232,232,232)`, anthracite `rgb(26,26,26)` |
| Accent | aucun accent chromatique dominant : noir et blanc, un rouge ponctuel `rgb(249,86,86)` |
| Rayons | 24 px (cartes, majorité), 8 px (boutons), pilules, cercles |
| Ombres | quasi absentes : halo blanc très doux sur fond sombre, ombre portée 0 4 16 sur éléments flottants |
| Bouton principal | fond blanc sur sombre, texte noir, rayon 8 px, padding 12 × 16, 16 px |
| Mise en page | cartes « bento » à grands rayons, vrais écrans produit, bloc IA sur fond sombre, bandeau de confiance (+750 000 clients, support 7j/7, Made in France) |
| Ton | titres courts et affirmatifs, phrases nominales (« Compte pro. Financement. Facturation électronique. ») |
| Bloc IA | « Qonto IA. Vos décisions. Votre contrôle. » : promesse de contrôle, pas de magie |

## Ce que j'en retiens (esprit)

1. Sobriété radicale, noir et blanc, une idée par carte, beaucoup d'air.
2. Titres gras et courts, corps à 14 à 16 px avec interligne généreux.
3. Grands rayons (24 px) sur les cartes, rayon plus serré (8 px) sur les boutons.
4. Quasi pas d'ombres : la hiérarchie vient du contraste de fond.
5. L'IA est traitée comme une zone à part (fond sombre) avec une promesse de contrôle.
6. Confiance visible par des chiffres et des engagements concrets.

## Ce qu'Élan fait autrement

| Qonto | Élan |
|---|---|
| Noir et blanc pur | Encre `#0E0E12`, papier blanc, fond doux chaud `#F5F4F0` |
| Aucun accent | Un accent indigo `#4C3DFF`, réservé aux actions principales et aux moments clés |
| Police propriétaire | Geist auto-hébergée, chiffres tabulaires |
| Rayons 24 / 8 | Échelle 8, 12, 20, 28 |
| Dégradé sombre générique | Dégradé IA signature indigo, encre et turquoise, réservé aux éléments générés par l'IA |
| Photos produit | Vrais écrans du prototype et pictogrammes précis, aucune illustration de banque en ligne |
| Logo | Symbole original « Élan » (voir `docs/brand.md`) |
