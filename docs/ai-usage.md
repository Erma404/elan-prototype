# Usage de l'IA dans ce travail

Rédigé à partir de ce qui a réellement été fait.

## Qui a fait quoi

Le prototype a été conçu et construit avec Claude (Sonnet 5.5) dans Claude Code, à partir du cadrage, du PRD et du brief fournis. L'utilisatrice a piloté : direction visuelle (référence LEDGE, assets, hero), arbitrages produit, retours d'usage à chaque itération.

## Ce que l'IA a produit
- Architecture, code (d'abord React/TypeScript, puis port en HTML, CSS et JavaScript à la demande), moteur d'éligibilité et règles, textes en français, mocks.
- Logo : trois pistes dessinées, comparées à 16, 24 et 48 px, deux détruites, révision complète après comparaison avec le wordmark de référence.
- Vérifications : scripts Playwright et axe, mesures de hauteur, Lighthouse, lecture des captures.

## Ce qui a été corrigé par l'utilisatrice, et pourquoi c'est important
Plusieurs défauts n'ont pas été vus par les contrôles automatiques et ont été repérés à l'usage : zone de dépôt écrasée dans la vue experte, fenêtre qui se décalait à l'ouverture, ligne de fichier tronquée, pilule de démo qui recouvrait un bouton, avance automatique non désirée, « 0 résultat » sans explication, droit à l'erreur absent, durée « 1 minute » non mesurée. Chaque cas est consigné dans `docs/decisions.md`.

## Gardes-fous du produit (et leur test)
- L'assistant ne cite jamais un chiffre qu'il n'a pas reçu : test unitaire sur le moteur (version React, tag `react-version`).
- L'IA n'est jamais bloquante : l'envoi dépend des pièces obligatoires, pas de la vérification automatique ; une alerte ne désactive aucun bouton.
- Elle cite sa source (« Référentiel Élan, v1 ») et propose un conseiller quand elle n'est pas sûre.
- Les réponses de l'assistant sont scriptées : aucune génération en direct dans le prototype.

## Ce qui a été rejeté
Pistes de logo (arc et point, fusion a+n, hampe décalée, ligature LA), effets de dégradé violet-bleu, assistant d'accueil sur la page d'entrée, étiquette « Exemple fictif » sur chaque valeur.

## Limites honnêtes
Les chiffres des financements, plafonds et délais sont inventés. Les durées ne sont pas mesurées. Aucune évaluation avec de vraies personnes : le test du prototype avec 5 entrepreneurs, prévu au plan du PRD, reste à faire.
