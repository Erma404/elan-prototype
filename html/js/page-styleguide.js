import { $, btn, badge, badgeStatut, banniere, progression, anneau, reglerTheme, STATUTS } from './core.js'
import { icon } from './icons.js'
import { logo } from './shell.js'
$('#logo').innerHTML = logo('wordmark', 'h-7')
$('#themes').innerHTML = [['light', 'Clair', 'sun'], ['dark', 'Sombre', 'moon'], ['system', 'Auto', '']].map(([v, l, i]) => `<button type="button" data-choix-theme="${v}" class="tr inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-sm px-3 text-sm font-medium text-muted hover:text-text">${i ? icon(i) : ''}${l}</button>`).join('')
$('#themes').onclick = (e) => { const b = e.target.closest('[data-choix-theme]'); if (b) reglerTheme(b.dataset.choixTheme) }
const jetons = ['bg', 'bg-soft', 'surface', 'text', 'muted', 'border', 'accent', 'accent-soft', 'primary', 'success', 'warning', 'danger']
$('#pastilles').innerHTML = jetons.map((j) => `<li class="rounded-md bg-surface p-3"><span class="block h-12 rounded-sm border border-border" style="background:var(--color-${j})"></span><p class="ident mt-2 text-xs">--color-${j}</p></li>`).join('')
$('#b-var').innerHTML = ['primary', 'secondary', 'ghost', 'destructive'].map((v) => `<button type="button" class="${btn(v)}">${{ primary: 'Envoyer ma demande', secondary: 'Remplacer', ghost: 'Annuler', destructive: 'Retirer l’accès' }[v]}</button>`).join('')
$('#b-tai').innerHTML = ['sm', 'md', 'lg'].map((t) => `<button type="button" class="${btn('primary', t)}">${{ sm: 'Petit', md: 'Moyen', lg: 'Grand' }[t]}</button>`).join('')
$('#b-etat').innerHTML = `<button type="button" aria-busy="true" class="${btn('primary')}">${icon('loader-circle', 'size-4 animate-[spin_0.8s_linear_infinite]')}Envoi en cours</button><button type="button" aria-disabled="true" title="Il manque 2 pièces obligatoires." class="${btn('primary')}">Envoyer ma demande</button>`
$('#s-liste').innerHTML = Object.keys(STATUTS).map((s) => badgeStatut(s)).join('') + badge('Obligatoire', 'accent') + badge('Recommandée')
$('#b-liste').innerHTML = banniere({ ton: 'info', titre: 'Enregistré à 14:32', corps: 'Votre demande est sauvegardée automatiquement.' }) + banniere({ ton: 'warning', titre: 'Connexion perdue', corps: 'Vos modifications sont gardées sur cet appareil.' }) + banniere({ ton: 'danger', titre: 'Envoi impossible', corps: 'Le fichier n’a pas pu être transmis.' }) + banniere({ ton: 'success', titre: 'Demande envoyée' })
$('#progres').innerHTML = `<div class="flex items-center gap-5">${anneau(66, 72, 'Complétude', '<span class="text-base">6/9</span>')}<div><p class="text-lg font-semibold">6 pièces sur 9</p><p class="text-sm text-muted">Il vous en reste 3.</p></div></div><div class="mt-4">${progression(66, 'Complétude')}</div>`
