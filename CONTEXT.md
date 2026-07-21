# Contexte et Documentation du Projet : CRM Coach (Trackly)

## 🎯 Objectif de l'Application
L'application "CRM Coach" (Trackly) est une plateforme web complète conçue pour mettre en relation des coachs sportifs et leurs clients/athlètes. Elle permet de digitaliser et centraliser tout le suivi de coaching : de la planification des entraînements à la gestion des paiements, en passant par le suivi des mensurations et la prise de rendez-vous en visio.

### 💎 Positionnement & Valeur Ajoutée Unique
Contrairement à des outils généralistes comme **Calendly** (qui ne gère que la prise de rendez-vous) ou **Google Sheets** (qui n'offre aucun rendu visuel professionnel) :
1. **L'Intégration Verticale (All-in-One)** : Un coach n'a plus besoin de payer 4 abonnements différents (Calendly pour les RDVs, TrueCoach pour les séances, Stripe/Paypal pour la facturation, et WhatsApp pour échanger les rapports de suivi). Tout est réuni dans un seul espace.
2. **Le Rendu Premium (L'effet Wouah)** : Le design dark mode et glassmorphism est conçu pour les coachs haut de gamme (High-Ticket) qui veulent offrir à leurs athlètes une expérience utilisateur digne d'une marque de luxe, justifiant des tarifs de coaching élevés.
3. **Le Cycle de Vie de la Séance** : La prise de rendez-vous est directement liée aux bilans d'entraînements et au suivi des métriques physiques du client.

---

## 🛠️ Stack Technique
*   **Framework Frontend & Backend :** [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Server Components)
*   **Langage :** TypeScript (`.tsx`, `.ts`)
*   **Styling :** [Tailwind CSS](https://tailwindcss.com/) avec [shadcn/ui](https://ui.shadcn.com/) pour les composants d'interface (Radix UI)
*   **Icônes :** Lucide React
*   **Base de Données & Authentification :** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Row Level Security)
*   **Outil de build :** Turbopack (intégré à Next.js)

---

## 👥 Rôles et Architecture Utilisateurs
Le système repose sur deux rôles principaux gérés dans la table `profiles` :

1.  **Le Coach (`role: 'coach'`) :**
    *   C'est l'administrateur de son espace.
    *   Il invite des clients via un système de lien unique (généré dans `/api/invite-client`).
    *   Il crée des programmes d'entraînement, suit les statistiques de ses clients, gère ses revenus et configure ses disponibilités pour les visios.

2.  **Le Client (`role: 'client'`) :**
    *   Il est rattaché à un `coach_id` précis.
    *   Il consulte ses entraînements du jour, coche les exercices terminés, ajoute ses mensurations (poids, photos), prend des rendez-vous et suit ses paiements.

---

## 🗄️ Structure de la Base de Données (PostgreSQL / Supabase)

Toute la sécurité est gérée au niveau de la base de données via les politiques **RLS (Row Level Security)**, assurant qu'un client ne voit que ses données et qu'un coach ne voit que celles de ses clients.

### 1. Utilisateurs
*   `profiles` : Stocke les informations des utilisateurs (`id`, `full_name`, `role`, `coach_id`, `photo_url`).

### 2. Entraînements (Workouts)
*   `workouts` : Une séance précise assignée à un client à une date donnée (`name`, `date`, `completed`).
*   `exercises` : Les exercices liés à un workout (`name`, `sets`, `reps`, `weight`, `rest`, `completed`, `order_index`).
*   `workout_templates` & `exercise_templates` : Permet au coach de créer des gabarits réutilisables pour gagner du temps.

### 3. Suivi Physique (Metrics)
*   `measurements` : Historique des pesées et photos d'évolution des clients (`date`, `weight`, `chest`, `waist`, `hips`, `thighs`, `notes`, `photos` en JSON).

### 4. Rendez-vous (Scheduling)
*   `coach_availabilities` : Les "Horaires Types" d'un coach (récurrence hebdomadaire, ex: "Tous les lundis").
*   `coach_specific_availabilities` : Les créneaux spécifiques réellement ouverts à la réservation pour des dates précises. C'est ce que le client voit.
*   `appointments` : Les rendez-vous réservés (`coach_id`, `client_id`, `start_time`, `end_time`, `status`, `notes`, `meeting_url`).
*   `training_reports` : Les bilans rédigés par le coach après un rendez-vous (`public_notes` visibles par le client, `private_notes` pour le coach).

### 5. Finance
*   `payments` : Suivi des encaissements (`amount`, `status: pending/paid`, `date`, `description`).

---

## 📂 Architecture des Dossiers (Next.js App Router)

Le projet est organisé par "espaces" pour bien séparer le code du coach de celui du client :

*   `/src/app/`
    *   `/api/` : Endpoints backend (ex: génération de lien d'invitation).
    *   `/auth/` : Gestion du callback Supabase après login.
    *   `/coach/` : **Espace Coach complet.**
        *   `/client/[id]` : Fiche détaillée d'un athlète (Vue 360°, historique RDV, métriques, programme).
        *   `/calendar` : Gestion des dispos et visios.
        *   `/workouts` & `/templates` : Création de programmes.
        *   `/payments` : Suivi financier.
    *   `/client/` : **Espace Client complet.**
        *   `/workout/[id]` : Le mode "Séance en cours" pour cocher les exercices pendant le sport.
        *   `/metrics` : Ajout des mensurations et photos de progression.
        *   `/history` : Vue des bilans de séances passés.
        *   Le dashboard principal inclut le modal de prise de rendez-vous (`book-appointment-modal.tsx`).

---

## ⚡ Flux de Données et Server Actions
L'application n'utilise presque pas d'API REST classiques. Elle s'appuie sur les **Server Actions** de Next.js (`'use server'`).
*   Chaque dossier possède un fichier `actions.ts`.
*   Lorsqu'un utilisateur soumet un formulaire (ex: Créer un RDV, Ajouter un exercice), un appel RPC direct est fait à la base de données via une Server Action.
*   La fonction termine souvent par `revalidatePath('/chemin')` pour rafraîchir instantanément l'UI côté client sans avoir à gérer des états complexes (Redux, etc.).

---

## 🎨 Philosophie Design
*   **UI/UX Premium :** Utilisation intensive des effets "Glassmorphism" (panneaux translucides), ombres douces, coins arrondis (`rounded-2xl`, `rounded-3xl`), et micro-animations (hover, transitions).
*   **Couleurs :** Thème majoritairement clair avec des touches de couleurs vives (bleu primaire, vert émeraude) pour indiquer les actions principales.

---

*Ce document sert de point de repère absolu pour comprendre le fonctionnement global de l'application, ses flux de données et ses règles métier.*
