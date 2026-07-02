# Trackly 🚀

**Trackly** est une plateforme SaaS complète de coaching sportif et de gestion de la performance, conçue pour centraliser la relation entre le coach et ses athlètes. L'application propose deux espaces dédiés (Coach et Athlète), avec un design premium, fluide et compatible Mode Sombre/Clair.

---

## 🛠️ Stack Technique

- **Framework :** Next.js 15 (App Router, Server Actions)
- **Base de données & Auth :** Supabase (PostgreSQL, Row Level Security, Storage, Authentication)
- **Styling :** Tailwind CSS v4, composants ShadCN UI, CSS Variables
- **Icônes :** Lucide React
- **Graphiques :** Recharts
- **Export PDF :** jsPDF, html-to-image

---

## ✨ Fonctionnalités Principales

### 👨‍🏫 Espace Coach (`/coach`)
L'interface de gestion ultime pour piloter son activité de coaching sportif.

1. **Tableau de Bord & CRM Athlètes :**
   - Statistiques globales (athlètes actifs, rendez-vous à venir, engagement).
   - Gestion des clients : ajout par email, vue d'ensemble, accès rapide aux profils.
   - Accès aux informations personnelles des athlètes : date de naissance (avec calcul de l'âge), adresse, et une mise en évidence des **antécédents médicaux / blessures** pour adapter les entraînements.

2. **Suivi des Performances (Métriques) :**
   - Création de **Templates de Métriques** (ex: Poids, Qualité du sommeil, RPE, Variabilité de la fréquence cardiaque).
   - Assignation personnalisée des métriques aux clients.
   - Visualisation de l'évolution via des graphiques interactifs.

3. **Planification des Entraînements :**
   - **Bibliothèque de Séances :** Création de modèles d'entraînements réutilisables.
   - **Planificateur Hebdomadaire :** Assignation de séances aux clients jour par jour.
   - Gestion des jours de repos et intégration directe des disponibilités renseignées par le client.

4. **Calendrier & Rendez-vous :**
   - **Gestion des Disponibilités Spécifiques :** Le coach peut définir ses créneaux de disponibilité par date exacte.
   - Visualisation des disponibilités croisées entre le coach et le client.
   - Prise de rendez-vous (visio ou présentiel) avec l'athlète.
   - Historique des rendez-vous et rédaction de **Bilans d'entraînements** après chaque appel.

5. **Gestion de la Facturation (Paiements) :**
   - Suivi des paiements des clients (En attente, Payé, En retard).
   - Création de factures/échéances avec montants et dates d'échéance.

6. **Configuration & Personnalisation :**
   - Édition du profil (photo de profil, mot de passe).
   - Bascule instantanée entre le mode sombre et le mode clair.

---

### 🏃‍♂️ Espace Athlète (`/client`)
Un portail dédié à la progression, au retour d'information et à l'interaction fluide avec le coach.

1. **Vue d'ensemble & Planning :**
   - Affichage immédiat des séances du jour et des prochains rendez-vous.
   - Vue sur l'historique récent et les retours du coach.

2. **Saisie des Métriques :**
   - L'athlète peut renseigner au quotidien ou de manière hebdomadaire les métriques demandées par son coach.
   - Historique visuel de ses propres performances.

3. **Gestion des Disponibilités :**
   - Indication au coach des créneaux précis (date et heures) où l'athlète est disponible pour un entraînement ou pour un appel.

4. **Exécution des Séances :**
   - Détails précis des séances de la semaine.
   - **Export PDF :** Possibilité de télécharger la séance au format PDF pour l'emmener à la salle de sport.

5. **Réservation de Rendez-vous :**
   - L'athlète peut réserver directement un créneau parmi les disponibilités spécifiques partagées par le coach.

6. **Historique & Paiements :**
   - Accès aux bilans rédigés par le coach.
   - Suivi clair de ce qu'il reste à payer.

7. **Profil & Santé :**
   - Mise à jour des informations personnelles (Date de naissance, adresse).
   - Renseignement approfondi des **Antécédents médicaux et blessures**, envoyé directement au coach.

---

## 🎨 Design & Expérience Utilisateur
L'application a été entièrement repensée avec une esthétique premium inspirée des standards "Future of Finance" :
- **Dark Mode Natif :** L'intégralité du site, des formulaires aux tableaux de bord, supporte un basculement fluide entre mode sombre et clair via `next-themes`.
- **Glassmorphism & Flous :** Utilisation de panneaux avec effet verre (`glass-panel`), de bordures subtiles et de dégradés lumineux (glow effects).
- **Landing Page Impactante :** Une vitrine avec animations, polices modernes (Satoshi & Apple Garamond) et espace prévu pour une mise en avant du produit.

---

## 🔐 Architecture Supabase (Base de données)
Le projet repose sur une série de tables liées et protégées par des règles RLS (Row Level Security) :
- `profiles` : Stocke les informations des utilisateurs (Coach/Client, données personnelles).
- `metric_templates` & `metric_types` & `metric_values` : Gère le suivi de la performance.
- `session_templates` & `assigned_sessions` : Gère les bibliothèques d'entraînements et les plannings.
- `client_availabilities` & `coach_specific_availabilities` : Gère la disponibilité asynchrone entre coachs et clients.
- `appointments` & `training_reports` : Gère la prise de rendez-vous et les feedbacks post-appels.
- `payments` : Gère le suivi des flux financiers.

*Pour plus d'informations sur les schémas exacts, référez-vous au fichier `scheme.sql` à la racine.*
