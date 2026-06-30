# Maison Créative - site vitrine

Studio audio et vidéo à Nantes. Site statique connecté à Supabase.

## Structure

```
maison-creative/
  index.html              page unique de la vitrine
  css/styles.css          styles (charte Maison Créative)
  js/config.js            cles Supabase (a renseigner, ne plus reecrire)
  js/supabase-init.js     creation du client Supabase
  js/site.js              interactions + chargement dynamique
  assets/                 logo, monogramme, favicon
```

## 1. Renseigner les cles Supabase

Ouvre `js/config.js` et remplace les deux valeurs par celles de ton projet,
disponibles dans Supabase > Project Settings > API :

- `SUPABASE_URL` = Project URL
- `SUPABASE_ANON_KEY` = cle "anon public"

La cle anon est publique, elle est protegee par les regles RLS de la base.
Tant que ce fichier n'est pas renseigne, le site fonctionne en mode statique
(contenu par defaut). Une fois les vraies cles en place, ne reecris plus ce
fichier.

## 2. Tester en local

Le site charge des modules, il faut un petit serveur local (l'ouvrir en
double-clic ne suffit pas pour les appels Supabase). Au choix :

```
npx serve maison-creative
```
ou
```
python3 -m http.server 8080
```
puis ouvre l'adresse indiquee.

## 3. Deployer sur Vercel

1. Pousse le dossier sur un depot GitHub.
2. Sur Vercel, importe le depot.
3. Framework preset : "Other". Pas de build command. Output directory : la
   racine du projet.
4. Deploie. Le favicon et le contenu s'affichent automatiquement.

## 4. Donnees dynamiques

Une fois les cles renseignees, le site lit automatiquement :

- les offres depuis la table `services`
- l'equipe depuis la table `team_members` (visibles)
- la galerie depuis la table `gallery_photos` (visibles)
- les reglages (titre, sous-titre, horaires, logo) depuis `site_settings`

Ces contenus seront pilotes depuis le back office (etape suivante).

## A venir

- Reservation en ligne reliee a la fonction `book_slot`
- Back office (contenu, photos, creneaux, reservations)
- Notification WhatsApp a chaque reservation
