# Rapport de Projet : EmbroCraftDZ

## 1. Vue d'Ensemble
**EmbroCraftDZ** est une plateforme SaaS et Marketplace dédiée à la **Couture Artisanale Algérienne**. Elle connecte des clients avec des couturières expertes et des ateliers de broderie pour la réalisation de créations uniques (tenues quotidiennes, robes de luxe, broderie traditionnelle).

Le projet cible spécifiquement le marché algérien (DZ) et propose une interface multilingue (Français, Arabe, Anglais) pour une accessibilité maximale.

---

## 2. Architecture Technique (Stack TI)

Le projet utilise une stack moderne et performante ("Bleeding Edge") :

| Composant | Technologie |
| :--- | :--- |
| **Framework Frontend** | **Next.js 16 (App Router)** |
| **Bibliothèque UI** | **React 19** |
| **Base de Données / Backend** | **Supabase** (Postgres, Auth, Storage) |
| **Stylisation** | **Tailwind CSS 4** + **Shadcn UI** |
| **Animations** | **Framer Motion** & **TW-Animate-CSS** |
| **Icônes** | **Lucide-React** & Material Icons |
| **Visualisation** | **Recharts** (pour les statistiques dashboard) |
| **Notifications** | **Resend API / React-Hot-Toast** |

---

## 3. Structure de l'Application

L'application est divisée en plusieurs grands modules via le système de **Route Groups** de Next.js :

### A. Espace Public (`(public)`)
- **Marketplace** : Recherche et découverte de professionnels.
- **Profils Professionnels** : Présentation des couturières et créateurs.
- **Processus de Commande** : Checkout, gestion des paniers, suivi simplifié.
- **Authentification** : Inscription, Connexion, et Récupération de mot de passe.

### B. Espace Dashboard (`(dashboard)`)
La plateforme gère quatre rôles distincts avec des dashboards personnalisés :
1. **Admin** : Gestion globale des utilisateurs, projets, et statistiques.
2. **Client** : Suivi de commandes, gestion des demandes de création.
3. **Couturière** : Gestion des commandes reçues, portfolio, et workflow de production.
4. **Creator** : Espace dédié aux designers et créateurs de modèles.

---

## 4. Fonctionnalités Clés Implémentées

- **Internationalisation (i18n)** : Support complet de l'Arabe (RTL), Français et Anglais avec un système de traduction centralisé.
- **Workflow de Projet Sophistiqué** : Pipeline de statuts complet permettant de structurer chaque étape de la commande.
- **Data Live Dynamique** : Le marketplace et les dashboards de l'application s'appuient à 100 % sur des records authentifiés provenant de requêtes en direct vers la base de données (pas de mock data).
- **Communication par Email** : Intégration de Resend pour l'envoi manuel et automatique de notifications liées au changement de statut.
- **Système de Tracking** : Timeline visuelle pour le client permettant de suivre l'avancement de sa pièce artisanale.

---

## 5. État Actuel du Développement (Recent History)

Les dernières itérations se sont concentrées sur le passage de la plateforme à un état prêt pour la **Production** :
- **Suppression des Mock Data** : Refactorisation de tous les modules (Marketplace, Tableaux de bord) afin d'éliminer définitivement l'ensemble des données statiques en dur.
- **Nettoyage des Comptes Démos** : Purge de la base de données pour supprimer tous les anciens comptes et contenus de démonstration superflus. Quatre comptes administratifs et professionnels ont été délibérément conservés pour servir de référence.
- **Renforcement UX/UI liés aux DB** : Assurance que les changements asynchrones des appels Supabase se traduisent par une interface réactive et propre (loaders appropriés, gestion des requêtes vides).

---

## 6. Prochaines Étapes Suggérées

1. **Optimisation SEO** : Finalisation du balisage sémantique sur la marketplace pour le référencement local.
2. **Mobile App / PWA** : Amélioration de l'expérience progressive web app pour les couturières en mobilité.
3. **Paiement Local** : Intégration de solutions de paiement spécifiques à l'Algérie (CIB/Dahabia) si applicable.

---
*Rapport mis à jour le 11 Avril 2026 par Antigravity Assistant.*
