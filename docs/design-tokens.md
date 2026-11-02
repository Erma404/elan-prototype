# Jetons de design

Source unique : `src/styles/tokens.css`. Les composants consomment uniquement des variables sémantiques
(`--color-bg`, `--color-text`, `--color-accent`, `--radius-card`...), jamais une valeur en dur.

## Reskinner l'application

1. Modifier les échelles primitives (`--color-indigo-*`) et les alias sémantiques (`--color-accent*`) dans `tokens.css`.
2. Reporter les mêmes valeurs dans le bloc `:root[data-theme="dark"]`.
3. Lancer `npm run tokens:check` : le script échoue si une paire passe sous AA.

## Échelles (50 à 900)

Encre (neutre), indigo (accent), vert (succès), ambre (alerte), rouge (erreur). Détail dans `tokens.css`.

## Contrastes AA validés (`npm run tokens:check`)

Texte 4,5 pour 1, composants 3 pour 1, en clair et en sombre. Exemples :

| Paire | Clair | Sombre |
|---|---|---|
| Texte sur fond | 19,3 | 17,9 |
| Texte atténué sur fond | 6,7 | 8,1 |
| Texte sur accent | 6,1 | validé |
| Succès, alerte, erreur sur fond | 5,3 / 5,5 / 5,6 | 8,7 / 10,1 / 7,6 |
| Bordure forte (composant) sur fond | 3,4 | validé |

## Typographie

Geist variable, auto-hébergée. Échelle 12, 14, 16, 18, 20, 24, 32, 40, 56 px avec interlignes définis.
Chiffres tabulaires (`.tabular`) pour tout montant, compteur et pourcentage.

## Rayons, ombres, mouvement, empilement

Rayons 8, 12, 20 (carte), 28. Ombres sm, md, lg. Durées 120, 200, 320 ms, courbes `ease-out` et `ease-in-out`.
Empilement : sticky 20, en-tête 30, drawer 50, dialogue 60, toast 70, démo 80.
