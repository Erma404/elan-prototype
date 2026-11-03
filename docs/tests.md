# Tests réalisés (2026-11-03)

Tous les tests s'exécutent contre le site HTML servi localement (`node scripts/serve-html.mjs`, port 5180), puis les routes de production sont vérifiées après déploiement.

| Test | Outil | Résultat |
|---|---|---|
| Parcours de bout en bout (62 vérifications) | `npm run verif` (Playwright) | toutes passent, console propre |
| Mobile 390 px : pas de défilement horizontal sur 9 routes | `verif` §5 + captures `docs/screens/final/m390-*.png` | OK |
| Dépôt réel d'un fichier (envoi, vérification) | `verif` §1 | OK |
| Erreurs injectables : réseau, fichier trop lourd, assistant IA indisponible, session expirée, connexion perdue | `verif` §2 | OK, chaque erreur a son message et sa sortie |
| Vue experte-comptable (jamais de montant, dépôt, « Terminer », retour chez Fabienne) | `verif` §3 | OK |
| Visite guidée (7 étapes, sortie possible) | `verif` §4 | OK |
| Clavier : lien d'évitement, aucun piège, contour de focus, Entrée | `verif` §7 | OK |
| Pièce à corriger : envoi possible, alerte, « Envoyer quand même », compteur et aide cohérents | `verif` §8 | OK |
| Scénario « Une pièce à corriger » ouvre la pièce à corriger | `verif` §8 | OK |
| Journal de Nicolas : « Échange avec l'assistant » | `verif` §9 | OK |
| « Commencer » rétablit le persona Fabienne | `verif` §10 | OK |
| Logo de la confirmation aligné sur le texte (écart 0 px) | `verif` §11 | OK |
| axe-core, 9 routes × clair/sombre × 1440/390 px | `npm run axe` | zéro violation |
| Lighthouse, 8 routes | `npx lighthouse` | 100 / 100 / 100, LCP 1,1 à 1,2 s, CLS ≤ 0,002 |

Limites : pas de test avec un lecteur d'écran réel ni sur appareil mobile physique, pas de test utilisateur chronométré.
