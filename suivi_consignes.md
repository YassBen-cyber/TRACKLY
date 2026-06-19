# Suivi des Consignes et Évolutions du Projet

Ce document garde une trace de toutes les directives données par le "Boss" (l'utilisateur) pour le projet COACH.

## Consignes Globales
1. **Design** : Les interfaces doivent être modernes, dynamiques et visuellement impressionnantes (Dark mode, glassmorphism, animations fluides).
2. **Architecture** : Utilisation de Next.js, Supabase, TailwindCSS.
3. **Qualité du code** : Logique CRUD complète pour toutes les entités de l'application.

## Évolution de la Logique Métier (Pivot)
Nous avons abandonné la logique initiale de simples rendez-vous pour passer sur une logique de **"Journal d'exécution de Programmes"**.
La nouvelle hiérarchie côté client est la suivante :
- **Programmes** : Assigne un programme global à un athlète.
- **Séances (Prévues)** : Les entraînements assignés dans le programme.
- **Historique des Séances (Le cœur de l'appli)** : Le client exécute une séance, note ses performances réelles (poids, temps, etc.). À la fin de la séance, un enregistrement immuable est créé. Le tableau de bord affiche le taux de complétion, la progression, etc.
- **Métriques** : Suivi des constantes de l'athlète (poids, perf max, notes de confiance).
- **Nutrition / Rendez-vous** : Outils complémentaires.

## Historique des Demandes
- **Correction PDF** : Le bouton d'export PDF crashait avec une erreur de fonction de couleur ("lab"). Résolu avec `jspdf-autotable`.
- **Espace Client (Design & Mot de Passe)** : L'espace client a été re-designé en dark mode (glassmorphism) pour s'aligner avec l'app. La demande de mot de passe est désormais fermable (sauvegarde locale) ou disparaît après un succès.
- **Templates de Métriques (En cours)** : Créer des Gabarits/Templates de métriques (ex: "Objectif Prise de Masse", "Objectif Basket") pour pouvoir attribuer un ensemble de métriques à un client en un clic au lieu de les ajouter manuellement à chaque fois.
