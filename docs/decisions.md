# Décisions

Format : contexte, options, choix, raison.

## D1. Emplacement du projet
- Contexte : le dossier `14. ELAN` ne contenait que le cadrage et le PRD en PDF. Le dossier vide `ELAN` créé plus tôt sur le Bureau n'existe plus.
- Choix : projet dans `14. ELAN/elan-prototype`, à côté des PDF.
- Raison : tout le matériel du cas reste au même endroit.

## D2. React 18
- Contexte : le gabarit Vite installe React 19, la stack verrouillée demande React 18.
- Choix : rétrogradé en 18.3.1.
- Raison : respecter la stack verrouillée.

## D3. Accent `#4C3DFF` conservé
- Contexte : point de départ à valider en AA.
- Options : ajuster la teinte, ou garder.
- Choix : conservé tel quel. Contraste 6,14 sur blanc, 5,58 sur `#F5F4F0`, texte blanc dessus à 6,14.
- Raison : passe AA sans ajustement, teinte distincte de toute fintech de référence.

## D4. Jetons dans `@theme` Tailwind v4
- Choix : variables sémantiques déclarées dans `@theme` (utilitaires `bg-bg`, `text-muted`...), surchargées dans `:root[data-theme="dark"]`.
- Raison : un seul endroit à modifier, le mode sombre fonctionne à l'exécution sans doubler les classes.

## D5. Sources de données de la référence
- Contexte : qonto.com/fr analysé par Playwright, pas par navigateur MCP.
- Choix : script `scripts/analyze-reference.mjs`, résultat dans `docs/reference-analysis.md`.
- Raison : reproductible et sans dépendance à l'état du navigateur de l'utilisatrice.

## D6. Cohérence des chiffres du cadrage
- Contexte : le brief annonce « 60 % de demandes envoyées complètes » et le cadrage donne 12 incomplètes sur 30 envoyées (40 %), cohérent.
- Choix : reprendre ces chiffres tels quels dans le panneau « Mesure », présentés comme ordres de grandeur à calibrer.

## Skills
- Disponibles et chargés à la phase concernée : impeccable, design-system, ui-ux-pro-max, design-taste-frontend, motion-framer, audit, critique, polish, layout, typeset, adapt, emil-design-eng.
- Absent : `product-team/product-designer/SKILL.md` (introuvable). Principes appliqués à la main : problème, parcours, états, mesure d'impact, déjà portés par le cadrage et le PRD.
- Phase 1 : aucun skill chargé avant les premières lignes de code (je les ai listés, puis chargés ensuite). Écart assumé, noté ici.

## D7. Logo : deux pistes défendues sur trois
- Contexte : brief de trois pistes, liste noire anti-AI-slop reçue en cours de phase 2.
- Options : garder une troisième piste faible pour faire nombre, ou la détruire.
- Choix : trois pistes dessinées puis reprises une fois selon la liste ; arc et point, fusion a + n, hampe décalée détruits. Restent le monogramme É et le mot-symbole, liés par une règle unique (coupe à 45°). Le lockup les assemble.
- Raison : « pas de piste sûre ajoutée pour faire nombre ». Détail dans `docs/brand.md`.

## D8. Chemins avec emoji et espaces
- Contexte : un script a écrit dans un dossier parasite à cause de `URL.pathname` (caractères encodés).
- Choix : `fileURLToPath`, dossier parasite supprimé (il ne contenait que mes sorties de scripts).

## Skills réellement chargés (mise à jour)
- `product-team/product-designer/SKILL.md` : introuvable (recherche dans ~/.claude, Bureau, Documents, Téléchargements, Applications). Principes appliqués à la main : problème, parcours, états, mesure d'impact, tirés du cadrage et du PRD.
- `impeccable` : chargé. Changements : contexte de design écrit dans `.impeccable.md` ; dégradé IA recentré sur turquoise profond et ocre (violet-bleu interdit) ; règles retenues pour la suite : pas de bordure latérale colorée, pas de texte en dégradé, pas de bounce, animations sur transform et opacity, hauteurs animées par grid-template-rows, ne pas imbriquer de cartes. Exceptions au skill listées dans `.impeccable.md`.
- `ui-ux-pro-max` : chargé, recherches `--design-system` et `--domain ux` lancées. Changements : style « Accessible & Ethical » confirmé, annonces d'erreur par `role="alert"`, libellés visibles, progression d'étapes et chemin de récupération sur chaque erreur. Sa palette or et violet est écartée (palette verrouillée par le brief).
- Les autres skills (design-system, motion-framer, audit, critique, polish, layout, typeset, adapt, emil-design-eng) seront chargés à leur phase.

## D9. Recentrage visuel après retour de l'utilisatrice (« horrible »)
- Contexte : première version du styleguide = catalogue générique, corps de texte timide, accent indigo partout, sections à plat. Comparée aux captures de qonto.com/fr (`docs/reference/`), il manquait : grandes cartes bento, titres très gros et gras, boutons principaux noirs, aplats sombres en forte opposition, vrais fragments d'interface dans les cartes.
- Choix : bouton principal en encre (`--color-primary`), indigo réservé à la progression, la sélection, le focus et les liens ; rayon de carte 24 px ; hero sombre avec titre jusqu'à 68 px ; sections en grille bento.
- À faire dans les écrans : fragments d'interface réels dans les cartes (écran Pièces, résultats d'éligibilité), titres 40 à 56 px, aplat sombre pour le bloc IA.

## D10. Neuf pièces, pas huit
- Contexte : le brief liste 8 pièces mais fixe la jauge à « 6 pièces sur 9 ».
- Choix : 9 pièces. J'ajoute « Statuts de l'entreprise à jour » (recommandée) au groupe « Votre entreprise ». 7 pièces obligatoires (bloquantes), 2 recommandées.
- Raison : garder la jauge « 6 sur 9 » du brief sans inventer de contradiction visible.

## D11. Vérification automatique des documents, règle de démonstration
- Choix : le premier dépôt du bilan déclenche l'alerte « La page 2 du bilan est manquante » (état « à corriger »), le remplacement est lisible. Les autres pièces sont « lisibles ».
- Raison : rend le cas « document incomplet » jouable à coup sûr pendant la démonstration de 3 minutes. L'IA alerte, ne bloque jamais l'envoi du reste.

## D12. Un seul écran, sans scroll de page (contrainte de l'utilisatrice)
- Contexte : « tout doit se faire et être visible sur un seul screen ». La première version de l'écran Pièces (accordéon vertical) faisait 2 186 px de haut.
- Choix : mise en page maître-détail verrouillée à la hauteur de la fenêtre sur ordinateur (≥ 1024 px de large) : liste des pièces, détail de la pièce choisie, colonne d'avancement. Le défilement interne n'est qu'un filet de sécurité sur petites hauteurs. Sur mobile, la page défile (impossible de tout faire tenir sur 390 px).
- Contrôle : `npm run fit` vérifie que la hauteur du document ne dépasse pas celle de la fenêtre à 1440 × 900 et 1280 × 720, sur chaque écran du prototype.

## D13. Correction de données : aucun montant prérempli, toute valeur inventée est étiquetée
- Contexte : le montant de 80 000 € vient d'une valeur de démonstration donnée par erreur, elle n'est pas dans le brief. Les chiffres des financements, les plafonds et les délais sont des inventions du prototype.
- Choix : question 4 sans valeur (curseur neutre, bouton Continuer désactivé, saisie libre) ; titre de l'écran Pièces limité à ce que l'utilisateur a saisi ; persona Fabienne préremplie avec les seuls faits du brief ; critères d'éligibilité reformulés sans chiffre ; tout chiffre restant porte l'étiquette « Exemple fictif » ; l'assistant ne cite aucun nombre (test unitaire).
- Conflit résolu : l'audit demandait aussi « état initial = Fabienne, 80 000 € ». Je préremplis Fabienne sans montant, et 80 000 € n'existe que comme raccourci étiqueté « Exemple fictif ».

### Registre des données inventées pour la démonstration

| Donnée | Où | Traitement |
|---|---|---|
| Plafonds et planchers de montant, effectif maximal, ancienneté minimale de chaque financement | `src/domain/financements.json` (moteur) | Jamais affichés : les critères sont reformulés sans chiffre |
| « Jusqu'à 80 % de l'équipement », « garantie jusqu'à 70 % », « jusqu'à 50 % », « de 4 000 à 8 000 € » | cartes et panneau de l'éligibilité | Étiquette « Exemple fictif » |
| Délais « sous 10, 15, 20 jours ouvrés » | cartes de résultat, confirmation | Étiquette « Exemple fictif » |
| Raccourcis de montant (20 000, 50 000, 80 000, 150 000 €) | question 4 | Étiquette « Exemple fictif », jamais une valeur par défaut |
| Montants et pourcentages dans les exemples de documents | aperçus des pièces | Remplacés par des masques « XXX XXX € », étiquette « Exemple fictif » |
| Durée de conservation de 5 ans | récapitulatif | Étiquette « Exemple fictif » (le brief la dit déjà fictive) |
| Numéro de dossier `ELAN-2026-04817`, noms de fichiers, dates d'envoi | pièces, confirmation, Élan Pro | Étiquette « Exemple fictif », police d'identifiant |
| Entreprises et dirigeants de la file de travail Élan Pro | écran 3 | Noms fictifs, bandeau « Prototype, données fictives » |
| Numéro de téléphone de l'aide | dialogue d'aide | Mention « numéro fictif » |
| Réponses de l'assistant | drawer IA | Texte scripté, source « Référentiel Élan, v1 », aucun nombre qui ne vienne de l'utilisateur ou du référentiel |

## D14. Plus aucune mention « Exemple fictif » dans l'interface (demande de l'utilisatrice)
- Contexte : « tout doit être comme un vrai parcours ». Les étiquettes « Exemple fictif » de D13 cassaient l'illusion d'un produit en production.
- Choix : toutes les étiquettes sont retirées de l'interface. Restent : le bandeau discret « Prototype, données fictives » (exigé par le brief, masquable depuis le panneau de démo) et le registre de D13 ci-dessus, qui documente toujours chaque valeur inventée.
- Inchangé : aucun montant prérempli (le montant n'apparaît que s'il a été saisi), l'assistant ne cite aucun nombre qu'il n'a pas reçu, les critères restent reformulés sans chiffre.
- Risque assumé : un évaluateur pourrait prendre « jusqu'à 80 % de l'équipement » pour une vraie condition. Le bandeau de bas d'écran et ce registre sont la seule protection.
- Correctif associé : la visite guidée ne réinitialise plus les réponses de l'éligibilité, ce qui effaçait le montant choisi à la jauge.

## D15. Aucune durée promise tant qu'elle n'est pas mesurée
- Contexte : « 1 minute » (objectif du brief pour la pré-éligibilité) figurait dans le hero comme une promesse. Personne n'a chronométré le parcours avec de vraies personnes.
- Choix : le hero dit « 5 questions », fait vérifiable. Aucune durée n'est affichée dans l'interface.
- Estimation interne, non mesurée : l'éligibilité (5 questions) prend environ 1 à 2 minutes à une personne qui la découvre. Le dépôt des pièces dépend des documents déjà disponibles : aucun chiffre n'est avancé.
- À faire : chronométrer 5 personnes (test prévu à la semaine 3 du plan du PRD) avant d'afficher une durée.

## D16. Passage en HTML, CSS et JavaScript (demande de l'utilisatrice)
- Contexte : « j'aurais souhaité que ce soit du HTML et non du TypeScript ». Le brief verrouillait Vite, React 18 et TypeScript ; l'utilisatrice a choisi le port complet.
- Choix : site statique dans `html/` (pages HTML, modules JavaScript natifs, composants natifs `<dialog>`, `<details>`, `<input type="range">`). La feuille de style `html/css/app.css` est compilée par Tailwind (`npm run css`) puis livrée telle quelle : aucun build au déploiement.
- Conservé : toute la logique (moteur d'éligibilité, pièces, assistant scripté), le design, les jetons, les 9 écrans.
- Perdu : Radix (remplacé par les éléments natifs), Zustand (remplacé par un store de 20 lignes persisté), les tests unitaires du moteur (ils vivaient avec Vitest, à porter).
- Récupérable : la version React/TypeScript est sur le tag Git `react-version`.

## D17. Étiquettes « Exemple fictif » : conflit entre deux consignes
- Contexte : une consigne demandait de retirer toutes les mentions « Exemple fictif » (parcours comme un vrai), la suivante d'étiqueter le délai de réponse, la durée de conservation et les chiffres de financement.
- Choix : une note discrète en pied des écrans concernés (résultat d'éligibilité, récapitulatif, confirmation), au lieu d'une étiquette sur chaque valeur. Les chiffres restent présentés comme dans un vrai produit, la note dit qu'ils sont fictifs.
- Les deux consignes sont donc respectées à moitié. À trancher si l'une doit l'emporter : retirer les notes (parcours « vrai »), ou remettre une étiquette par valeur.

## D18. Logo : mot-symbole « élan » en bas de casse
- Comparaison à 16, 24 et 48 px de trois pistes (`docs/screens/logo-variantes.png`) : capitales fines (anonyme), capitales avec ligature LA (le pied du L fusionne avec le A, illisible à 16 px), bas de casse (retenu).
- Retenu : « élan » en trait de 6, « l » coupé à 45° dans le prolongement de l'accent du « é ». Le symbole devient le « é » seul, cohérent avec le mot-symbole. Espacement du « n » resserré après comparaison.

## D19. Profils et écran de bienvenue
- Ajout de `/bonjour` : « Bonjour Fabienne. », « Bonjour Nicolas. » ou « Bonjour. » (experte-comptable, non nommée dans le brief), puis démarrage du parcours. Le bouton « Commencer » du hero y mène.
- Le bouton de profil est dans chaque en-tête et ouvre un sélecteur ; le profil affiché suit la route (Fabienne, experte-comptable, Nicolas).

## D20. Relance de Nicolas
- Dossier complet : « Relancer » est remplacé par « Confirmer la réception », avec un message de confirmation. Dossier incomplet : le message liste les pièces manquantes et les pièces à corriger, séparément. Jamais de décompte à zéro.

## D21. Baseline du hero : « Donnez de l'élan à votre projet. »
- Historique : « Votre demande de financement, sans deviner ce qu'on attend de vous » (rejetée : décrit un problème, ne vend rien) puis « Un financement clair, un dossier complet » (rejetée : descriptive).
- Choix : s'appuyer sur le nom de la marque (élan = impulsion) avec une promesse de bénéfice, courte, sur deux lignes comme la référence. Sous-titre : le comment (éligibilité, pièces guidées, dossier prêt à instruire), sans durée ni chiffre non mesuré.
- Alternatives écartées : « Le financement de votre projet, enfin lisible » (bonne mais négative en creux), « Votre projet mérite un oui » (promet une réponse que le produit ne garantit pas).

## D22. Carte du hero : phrase de Fabienne côté bénéfice (fictive)
- Contexte : la citation du brief (« Je ne savais pas ce qu'on attendait de moi... J'ai lâché au moment des pièces ») décrit le problème de départ. Sur un hero elle ne donne pas envie d'agir.
- Choix : « Dès le départ, j'ai su si j'avais ma chance. Chaque pièce m'a été expliquée. », attribuée à Fabienne M., céramiste. Texte écrit pour le prototype, aucun chiffre, aucun résultat promis (pas de « mon four est financé »).
- Honnêteté : ce n'est pas une parole recueillie. Dans un produit réel, cette carte devrait citer un vrai retour d'utilisatrice, avec son accord. Le brief reste cité tel quel dans `docs/parcours-cible.md`.
- Essai écarté : la phrase de marque « Élan donne sa chance à chaque entrepreneur qui ose » avec un lien d'action a été testée sur la carte, puis retirée à la demande de l'utilisatrice. La carte reste le témoignage de Fabienne côté bénéfice.

## D24. Écran de bienvenue : une seule phrase
- Contexte : première connexion. Le texte d'accueil (le projet de four, le déroulé) donnait trop d'informations avant même de commencer.
- Choix : le salut et une phrase d'invitation (« Prête à démarrer votre demande ? », « Vos dossiers vous attendent. », « Fabienne M. vous a invitée à déposer des pièces. »). Le contexte du projet est donné par le parcours lui-même.

## D25. Écran de bienvenue : le choix du profil passe dans l'en-tête
- Choix : plus de sélecteur de profil sur la page. Restent le salut, une phrase et « Commencer ma demande », comme une vraie première connexion. Le changement de profil se fait par le bouton de profil de l'en-tête (présent sur tous les écrans), qui recharge l'accueil avec le bon salut.
- Conséquence : pour un évaluateur, le changement de profil est un peu moins visible. Il reste aussi accessible depuis le panneau de démo (Maj + D).

## D26. Portraits des profils et logo du cabinet expert-comptable
- Portraits : deux photographies fournies par l'utilisatrice (Pexels) remplacent les initiales : la femme pour Fabienne, l'homme pour Nicolas. Recadrées en carré sur le visage et optimisées (`html/photos/fabienne.jpg`, `nicolas.jpg`, 320 px). Elles apparaissent dans le bouton de profil des en-têtes, le sélecteur de profil, l'écran de bienvenue et, pour Fabienne, la carte du hero (même visage partout, sinon le personnage change de tête d'un écran à l'autre).
- Logo du cabinet (fictif, « Cabinet Ledoux & Associés ») : monogramme « L » en deux barres avec une cellule ambre, mot-symbole « LEDOUX » dessiné lettre par lettre (trait constant, aucune police), vert profond pour se distinguer d'Élan (`html/brand/cabinet-ledoux-marque.svg`, `cabinet-ledoux-logo.svg`). Il sert d'avatar à l'experte-comptable et d'identité sur sa vue de dépôt, sur une tuile blanche pour rester lisible en mode sombre.
- Réserve : ce sont des photos de personnes réelles utilisées pour des personnages fictifs, associées à une phrase écrite pour le prototype (carte du hero). Acceptable pour une démonstration, à remplacer par des visuels libres de droits pour ce cas précis ou par de vrais témoignages avec accord pour un produit réel.
- Crédits : photographies de Benoit Vacherie (Fabienne) et Oktay Köseoğlu (Nicolas), via Pexels.

## D27. Logo visible dès le chargement du hero
- Contexte : l'en-tête du hero était masqué au repos (comme la référence LEDGE), donc on ne savait pas où l'on se trouvait avant de scroller.
- Choix : le logo Élan est affiché en haut à gauche, en blanc sur la photo (accent bronze éclairci pour garder le contraste). Il s'estompe entre 12 % et 37 % du scroll pendant que la barre fixe, qui porte aussi le logo, apparaît (à 28 %) : un logo reste visible à chaque position (balayage de 0 à 700 px par pas de 25 px).
- Le menu de navigation reste absent du hero : une seule action (« Commencer »).

## D28. Sous-titre du hero : la phrase de positionnement
- Choix : « Le financement des petites entreprises, instruit par de vrais chargés d'affaires. » devient le sous-titre sous le H1, à la place du paragraphe décrivant le déroulé et de la mention en haut à gauche (supprimée pour ne pas la répéter). Le hero garde : logo, titre, sous-titre, « Commencer », « 5 questions • sans compte », carte de Fabienne.
