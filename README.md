# Élan, prototype « Demande de financement guidée »

Prototype web cliquable du parcours de demande de financement d'Élan, plateforme (fictive) d'un financeur public des petites entreprises. Données fictives. **HTML, CSS et JavaScript, sans framework ni build au déploiement.**

Site en ligne : https://elan-prototype.vercel.app

## Lancer

```bash
npm install
npm run dev        # http://127.0.0.1:5180
```

Le CSS est livré compilé (`html/css/app.css`). Pour le régénérer après avoir modifié les classes ou les jetons : `npm run css` (ou `npm run css:watch`).

## Parcours

| Route | Écran |
|---|---|
| `/` | Hero, entrée dans le prototype |
| `/bonjour` | « Bonjour Fabienne », « Bonjour Nicolas » : choix du profil, démarrage |
| `/eligibilite` | Écran 1 : pré-éligibilité en 5 questions, financements possibles en direct |
| `/demande/pieces` | Écran 2 : pièces guidées, assistant IA, invitation de l'experte-comptable |
| `/demande/recapitulatif`, `/demande/envoyee` | Récapitulatif, envoi, confirmation |
| `/expert/:token` | Vue de l'experte-comptable (pièces seulement) |
| `/pro/dossiers/:id` | Écran 3 : fiche dossier dans Élan Pro |
| `/styleguide` | Système de design |

Le panneau de démo s'ouvre avec **Maj + D** (ou le bouton « Démo » des en-têtes) : changement de profil, états de l'écran Pièces, erreurs injectables, visite guidée de 3 minutes, onglet Mesure.

## Structure

```
html/
  *.html, demande/*.html    une page par écran
  js/                       modules JavaScript natifs (core, state, shell, demo, une page-*.js par écran)
  js/engine.js              moteur d'éligibilité (fonction pure), js/financements.js ses règles
  css/input.css             jetons de design + composants, compile vers css/app.css
  brand/, photos/, icons/   marque, photographies, pictogrammes
scripts/                    contrôles (axe, hauteur, parcours complet) et génération (marque, icônes)
docs/                       décisions, marque, accessibilité, usage de l'IA, script de démo, parcours cible
```

## Jetons et reskin

Les composants ne consomment que des variables sémantiques de `html/css/input.css` (`--color-bg`, `--color-accent`, `--radius-card`...). Les modifier suffit à reskinner l'application. `npm run tokens:check` valide le contraste AA, en clair et en sombre.

## Contrôles

```bash
npm run dev &      # serveur local
npm run verif      # parcours complet : dépôts, erreurs, vue experte, visite guidée, mobile, sombre, clavier
npm run axe -- /eligibilite
npm run fit        # chaque écran tient dans la fenêtre sans défilement
```

Résultats détaillés dans `docs/a11y.md`. La version React/TypeScript d'origine est conservée sur le tag Git `react-version`.

## Crédits

Photographies des profils : Benoit Vacherie (Fabienne) et Oktay Köseoğlu (Nicolas), via Pexels, licence Pexels. Autres photographies : assets fournis par l'équipe projet. Pictogrammes : Lucide (licence ISC). Police : Geist. Le logo du cabinet Ledoux & Associés est fictif.
