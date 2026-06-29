<div align="center">

# 🚀 Portfolio Dashboard & Admin API

### Un CMS moderne développé sur mesure pour administrer entièrement un site Portfolio.

Interface d'administration • API REST • Gestion des médias • Gestion des utilisateurs • RGPD • Configuration complète du site vitrine

---

![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-black?logo=jsonwebtokens)
![Material UI](https://img.shields.io/badge/Material_UI-7.x-007FFF?logo=mui&logoColor=white)

</div>

---

# 📖 Présentation

Bienvenue sur le dépôt du **Portfolio Dashboard & Admin API**.

Ce projet est composé de deux applications complémentaires :

| Application | Description |
|-------------|-------------|
| 🎨 **Dashboard Admin** | Interface d'administration complète du site vitrine |
| ⚙️ **API Admin** | API REST sécurisée assurant le traitement des données et la communication avec la base MySQL |

Contrairement à un CMS traditionnel, cette application a été développée spécifiquement pour administrer mon site Portfolio.

L'objectif est simple :

> **Permettre de modifier l'intégralité du contenu du site vitrine sans modifier une seule ligne de code.**

Toutes les informations visibles sur le site sont pilotées depuis le Dashboard.

---

# ✨ Fonctionnalités principales

Le Dashboard permet notamment la gestion de :

- 🏠 Page d'accueil
- 👤 Section À propos
- 🖼 Galerie photos
- 💼 Services
- 📨 Formulaires de contact
- 🔒 Utilisateurs
- ⚙️ Paramètres du site
- 🛡 Configuration RGPD
- 📄 Documents légaux
- 💾 Stockage serveur

---

# 📑 Sommaire

- [Présentation](#-présentation)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Fonctionnalités](#-fonctionnalités-principales)
- [Modules du Dashboard](#-modules-du-dashboard)
- [Gestion du site vitrine](#-gestion-du-site-vitrine)
- [Gestion des utilisateurs](#-gestion-des-utilisateurs)
- [Gestion RGPD](#-gestion-rgpd)
- [Gestion des fichiers](#-gestion-des-fichiers)
- [Sécurité](#-sécurité)
- [Structure du projet](#-structure-du-projet)
- [Installation](#-installation)
- [Roadmap](#-roadmap)

---

# 🏗 Architecture

Le projet est composé de trois éléments.

```
                Internet
                    │
                    │
        ┌───────────▼───────────┐
        │     Site vitrine      │
        │      (React)          │
        └───────────┬───────────┘
                    │
          Appels API REST
                    │
        ┌───────────▼───────────┐
        │       API Admin       │
        │-----------------------│
        │ Node.js               │
        │ Express               │
        │ JWT                   │
        │ Multer                │
        │ MySQL                 │
        └───────────┬───────────┘
                    │
         Requêtes SQL / Upload
                    │
          ┌─────────▼──────────┐
          │       MySQL        │
          └────────────────────┘
                    ▲
                    │
                    │
        ┌───────────┴───────────┐
        │    Dashboard Admin    │
        │       React           │
        └───────────────────────┘
```

Le Dashboard communique exclusivement avec l'API REST.

Aucun accès direct à la base de données n'est effectué depuis le Frontend.

Toutes les opérations transitent par l'API :

- authentification
- lecture
- création
- modification
- suppression
- upload des fichiers
- configuration du site

---

# 💻 Technologies

## Frontend

| Technologie | Utilisation |
|-------------|-------------|
| ⚛ React | Interface utilisateur |
| 📘 TypeScript | Typage |
| 🎨 Material UI | Composants graphiques |
| 🌐 Axios | Communication avec l'API |

---

## Backend

| Technologie | Utilisation |
|-------------|-------------|
| 🟢 Node.js | Serveur |
| 🚀 Express | API REST |
| 🔑 JWT | Authentification |
| 📂 Multer | Upload des fichiers |

---

## Base de données

| Technologie | Utilisation |
|-------------|-------------|
| 🐬 MySQL | Stockage des données |

---

## Fonctionnalités techniques

- 🔐 Authentification JWT

- 📁 Upload sécurisé des fichiers

- 🗑 Suppression automatique des fichiers orphelins

- 🛡 Validation serveur

- 📧 Envoi d'e-mails

- 🕒 Purge automatique RGPD

- 📦 API REST

- 📊 Gestion du stockage serveur

- 📸 Prévisualisation des images

---

# 🎯 Philosophie du projet

Le Dashboard n'est pas un simple outil d'administration.

Il constitue un véritable **CMS personnalisé**, développé exclusivement pour répondre aux besoins du site Portfolio.

Toutes les informations du site sont configurables depuis une interface moderne, permettant d'éviter toute intervention dans le code source.

Cette approche permet :

- une maintenance simplifiée ;
- une évolution plus rapide du site ;
- une administration centralisée ;
- une meilleure sécurité des données ;
- une séparation claire entre le contenu et le développement.

---

# 🧩 Modules du Dashboard

Le Dashboard est organisé en plusieurs modules indépendants permettant d'administrer l'intégralité du site vitrine.

Chaque module possède sa propre interface, ses formulaires et ses règles de gestion.

---

# 🏠 Page d'accueil

La page d'accueil du site vitrine est entièrement configurable.

Le Dashboard permet de modifier :

| Élément | Description |
|---------|-------------|
| 📝 Titre | Titre principal affiché sur la page d'accueil |
| 📄 Sous-titre | Texte situé sous le titre |
| 🖼 Image de fond | Image principale affichée en arrière-plan |

Toutes les modifications sont immédiatement prises en compte par le site vitrine.

---

# 👤 Section "À propos"

Cette section permet de présenter le propriétaire du Portfolio.

## Fonctionnalités

- 📷 Modification de la photo portrait
- 📝 Modification du texte de présentation
- 👀 Prévisualisation de l'image

Cette section est utilisée directement par le site vitrine.

---

# 🖼 Galerie Photos

La galerie constitue l'un des principaux contenus du Portfolio.

Depuis le Dashboard il est possible de :

- importer une nouvelle image ;
- remplacer une image existante ;
- supprimer une image ;
- modifier son ordre d'affichage ;
- choisir si elle est affichée sur le site vitrine.

## Gestion des informations

Selon leur utilisation, les images peuvent disposer des informations suivantes :

| Champ | Obligatoire |
|--------|-------------|
| Titre | ✅ |
| alt text | ✅ |
| Ordre d'affichage | ❌ |
| Affichage sur le site | ✅ |

Les métadonnées sont donc totalement optionnelles.

Une image sans ordre d'affichage sera automatiquement enregistrée en dernière position.

---

# 💼 Services

Le Dashboard permet de gérer la totalité des services proposés sur le site.

Pour chaque service il est possible de définir :

- le titre ;
- la description ;
- le tarif ;

## Activation de la section

La section **Services** peut être activée ou désactivée à tout moment.

Lorsqu'elle est désactivée :

- elle n'est plus affichée sur le site ;
- les données restent conservées.

Cette fonctionnalité permet d'activer ou masquer rapidement cette partie du Portfolio sans supprimer son contenu.

---

# 📨 Gestion des demandes de contact

Le site vitrine dispose d'un système complet de gestion des demandes de contact.

Toutes les demandes envoyées depuis le formulaire sont centralisées dans le Dashboard.

## Types de demandes

Le formulaire peut proposer plusieurs catégories :

- 📩 Demande de contact
- 🏢 Devis professionnel
- 🏠 Devis particulier

Chaque catégorie peut être activée ou désactivée indépendamment depuis les paramètres du site.

---

## Suivi des demandes

Chaque demande possède un état permettant de suivre son traitement.

Exemple de workflow :

```
Nouveau message
        │
        ▼
Non traité
        │
        ▼
En cours
        │
        ▼
Traité
```

Le système repose sur des **badges** permettant d'identifier rapidement l'état de chaque demande.

Les badges sont modifiables directement depuis le Dashboard.

---

## Informations disponibles

Chaque demande contient notamment :

| Information | Description |
|------------|-------------|
| 👤 Nom | Expéditeur |
| 📧 Adresse e-mail | Contact |
| 📱 Téléphone | Facultatif |
| 📂 Type de demande | Contact / Devis |
| 💬 Message | Contenu envoyé |
| 🕒 Date de réception | Horodatage |
| 🏷 Statut | Badge de suivi |

---

# ⚙️ Configuration du site vitrine

Toutes les informations visibles sur le Portfolio sont administrables.

Le Dashboard centralise ces paramètres afin d'éviter toute modification du code source.

---

## 🌐 Identité du site

Configuration des informations générales :

| Élément |
|----------|
| Nom du site |
| Description |
| Image d'onglet (favicon) |
| Titre SEO |

---

## 🏠 Paramètres de la page d'accueil

Configuration de :

- titre principal ;
- sous-titre ;
- image de fond.

---

## 🖼 Paramètres de la galerie

Cette page permet de modifier les textes affichés dans la section Portfolio.

Les éléments configurables sont :

- titre de la section ;
- texte de présentation ;
- texte du bouton principal ;
- texte des boutons secondaires.

Aucune modification du code n'est nécessaire.

---

## 📨 Paramètres de la section Contact

Cette page permet de personnaliser entièrement le formulaire de contact.

Configuration disponible :

| Paramètre |
|------------|
| Titre |
| Sous-titre |
| Texte du bouton d'envoi |
| Activation des demandes de contact |
| Activation des devis particuliers |
| Activation des devis professionnels |

Les formulaires peuvent être activés ou désactivés indépendamment.

---

## 📄 Footer

Le Dashboard permet de modifier :

- le texte affiché dans le footer ;
- le texte SEO ;
- le lien vers Instagram.

Toutes les modifications sont immédiatement utilisées par le site vitrine.

---

# 📚 Gestion des documents légaux

Le Dashboard permet d'administrer les documents réglementaires du site.

Les fichiers pris en charge sont notamment :

- 📄 Mentions légales
- 📄 Politique de confidentialité
- 📄 Conditions Générales de Vente
- 📄 Autres documents réglementaires

Ces documents sont directement accessibles depuis le site vitrine.

---

# 🎨 Expérience utilisateur

Le Dashboard a été conçu pour offrir une interface claire et intuitive.

Les principales fonctionnalités de l'interface sont :

- ✅ notifications (Toast) ;
- 🖼 aperçu instantané des images ;
- 📁 upload simplifié ;
- ⚡ mises à jour dynamiques ;
- 📱 interface responsive ;
- 🎯 formulaires organisés par onglets ;
- 🔍 navigation claire entre les différentes sections.

L'objectif est de rendre l'administration du site rapide, simple et agréable.

---

# ⚙️ Paramètres du Dashboard

En complément de la configuration du site vitrine, le Dashboard dispose de sa propre interface d'administration permettant de gérer son fonctionnement, ses utilisateurs, le stockage du serveur ainsi que les paramètres liés au RGPD.

---

# 👥 Gestion des utilisateurs

Le Dashboard intègre un système de gestion des comptes administrateurs.

Chaque utilisateur possède son propre compte permettant d'accéder à l'interface d'administration.

## Fonctionnalités

Le module permet de :

- ➕ Créer un utilisateur
- ✏️ Modifier un utilisateur
- 🚫 Désactiver un utilisateur
- 🗑️ Supprimer un utilisateur

---

## Liste des utilisateurs

La liste affiche l'ensemble des comptes enregistrés.

| Information | Description |
|------------|-------------|
| 👤 Nom | Nom de l'utilisateur |
| 📧 Adresse e-mail | Identifiant de connexion |
| 🟢 Statut | Actif ou Inactif |
| ⚙️ Actions | Modifier, Désactiver, Supprimer |

Chaque ligne dispose d'actions rapides permettant d'administrer le compte.

---

## Création et modification

Le formulaire permet notamment de renseigner :

- Nom
- Adresse e-mail
- Mot de passe
- Confirmation du mot de passe
- Statut du compte

Le même formulaire est utilisé pour la création et la modification d'un utilisateur.

---

# 🛡️ Gestion RGPD

Le Dashboard intègre un système complet de gestion des données personnelles afin de respecter les obligations du Règlement Général sur la Protection des Données (RGPD).

L'ensemble des paramètres est regroupé dans un onglet dédié.

---

## 📊 Tableau de bord RGPD

Le Dashboard affiche en temps réel plusieurs informations :

| Information |
|--------------|
| 📩 Nombre de messages à supprimer |
| 📅 Durée actuelle de conservation |
| 🔄 Purge automatique activée ou non |
| 🕒 Date de la prochaine purge automatique |

Ces informations permettent de contrôler rapidement l'état du système.

---

## ⚙️ Configuration

Le comportement du système peut être personnalisé.

Paramètres disponibles :

- durée de conservation des données ;
- heure quotidienne de la purge ;
- activation ou désactivation de la purge automatique.

L'ensemble des modifications est pris en compte sans redémarrage de l'application.

---

## 🗑️ Purge manuelle

Le Dashboard permet également de lancer une suppression manuelle des données expirées.

Cette opération est indépendante de la purge automatique.

---

## 📤 Extraction des données

Dans le cadre du RGPD, le Dashboard permet :

- d'extraire les données personnelles d'un demandeur ;
- de générer un export des informations ;
- d'envoyer automatiquement ces données par e-mail.

---

# 💾 Gestion du stockage

Le Dashboard dispose d'une interface permettant de visualiser l'espace disque utilisé par l'application.

Cette page présente une répartition par dossier afin d'identifier rapidement les éléments occupant le plus d'espace.

Exemple :

| Dossier | Utilisation |
|----------|-------------|
| uploads/ | XX Mo |
| gallery/ | XX Mo |
| portraits/ | XX Mo |
| background/ | XX Mo |
| legal/ | XX Mo |

Un récapitulatif affiche également :

- capacité totale utilisée ;
- taille globale des dossiers.

---

# 🖼️ Gestion des médias

Le Dashboard centralise l'ensemble des fichiers utilisés par le site.

Selon leur rôle, les images peuvent être utilisées pour :

- la galerie ;
- la photo de présentation ;
- la page d'accueil ;
- le logo du Dashboard ;
- l'image de la sidebar ;
- le favicon ;
- d'autres éléments graphiques.

Toutes les images disposent d'un aperçu directement dans l'interface.

---

## Nettoyage automatique

Le système prévoit un mécanisme de suppression des fichiers devenus inutiles.

Cette fonctionnalité permet de limiter l'accumulation de fichiers orphelins sur le serveur tout en garantissant l'intégrité des contenus encore utilisés.

---

# 🖥️ Paramètres généraux

Le Dashboard possède sa propre identité visuelle.

Les éléments suivants sont configurables :

| Élément |
|----------|
| 📝 Nom du Dashboard |
| 📄 Description |
| 🖼️ Logo principal |
| 📂 Image de la sidebar |

Chaque image est affichée avec un aperçu avant validation.

---

# 🔐 Authentification

L'accès au Dashboard est protégé.

Le processus d'authentification repose sur un système de jetons (JWT).

Le fonctionnement est le suivant :

```
Connexion
      │
      ▼
Vérification des identifiants
      │
      ▼
Création d'un JWT
      │
      ▼
Authentification des requêtes
```

Toutes les routes sensibles de l'API nécessitent un jeton valide.

---

# 🛡️ Sécurité

Plusieurs mécanismes garantissent la sécurité de l'application.

## Validation des données

Toutes les données sont validées côté serveur avant leur enregistrement.

Les contrôles portent notamment sur :

- les champs obligatoires ;
- les longueurs maximales ;
- les formats attendus ;
- les types de fichiers.

---

## Gestion des fichiers

Les fichiers sont traités exclusivement par l'API.

Le Dashboard n'accède jamais directement au système de fichiers.

Les opérations prises en charge sont :

- upload sécurisé ;
- renommage ;
- remplacement ;
- suppression ;
- nettoyage automatique.

---

## Protection des routes

Toutes les opérations sensibles sont protégées.

L'utilisateur doit être authentifié pour :

- modifier le contenu ;
- supprimer des données ;
- administrer les utilisateurs ;
- accéder aux paramètres.

---

# 📈 Performances

Le Dashboard a été conçu pour limiter les échanges inutiles avec le serveur.

Les principaux objectifs sont :

- chargements rapides ;
- interface réactive ;
- optimisation des appels API ;
- limitation des opérations coûteuses.

---

# 🎨 Interface utilisateur

Une attention particulière a été portée à l'expérience utilisateur.

L'interface propose notamment :

- 🎉 notifications sous forme de Toast ;
- 📷 aperçu des images ;
- 🧭 navigation claire ;
- 📑 organisation par onglets ;
- 🎯 formulaires simples et cohérents ;
- 📱 interface responsive.

L'objectif est de rendre l'administration du site intuitive, même pour une utilisation occasionnelle.

---

# 📁 Structure du projet

Le projet est organisé autour de deux applications principales :

```text
portfolio-admin-workspace/
│
├── portfolio-admin/          # Dashboard Admin - Frontend React
│
└── portfolio-admin-api/      # API Admin - Backend Node.js / Express

```

---

# 🖥️ Frontend - Dashboard Admin

Le Dashboard Admin est développé avec **React**, **TypeScript**, **Vite** et **Tailwind CSS**.

```text
portfolio-admin/
│
├── public/
│   └── vite.svg
│
├── src/
│   │
│   ├── app/
│   │   │
│   │   ├── components/
│   │   │   ├── editor/
│   │   │   ├── legal/
│   │   │   ├── portfolio/
│   │   │   ├── ui/
│   │   │   ├── users/
│   │   │   ├── ExportRgpdModal.tsx
│   │   │   ├── HeaderSearch.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ToastProvider.tsx
│   │   │
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── providers/
│   │   ├── router/
│   │   ├── services/
│   │   └── main.tsx
│   │
│   ├── assets/
│   ├── lib/
│   ├── styles/
│   ├── App.tsx
│   ├── env.ts
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .env
├── .env.development
├── .gitattributes
├── .gitignore
├── .htaccess
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Organisation du Frontend

| Dossier / fichier | Rôle |
|---|---|
| `src/app/components/` | Composants principaux du Dashboard |
| `src/app/components/editor/` | Composants liés aux formulaires ou éditeurs de contenu |
| `src/app/components/legal/` | Composants de gestion des documents légaux |
| `src/app/components/portfolio/` | Composants liés à la galerie / portfolio |
| `src/app/components/ui/` | Composants UI réutilisables |
| `src/app/components/users/` | Composants de gestion des utilisateurs |
| `src/app/context/` | Contextes React globaux |
| `src/app/hooks/` | Hooks personnalisés |
| `src/app/layouts/` | Layouts du Dashboard |
| `src/app/pages/` | Pages principales de l'application |
| `src/app/providers/` | Providers globaux |
| `src/app/router/` | Configuration du routing |
| `src/app/services/` | Services d'appel à l'API |
| `src/assets/` | Ressources statiques |
| `src/lib/` | Fonctions utilitaires / librairies internes |
| `src/styles/` | Styles globaux |
| `env.ts` | Configuration d'environnement côté Frontend |


---

# ⚙️ API Admin

L'API est développée en **Node.js**, **Express** et **TypeScript**.

Son architecture est organisée par domaines fonctionnels (feature-based architecture), chaque module regroupant l'ensemble des éléments nécessaires à son fonctionnement (routes, contrôleurs, services, modèles, validations, etc.).

Cette organisation facilite la maintenance, la lisibilité du code et l'ajout de nouvelles fonctionnalités.

## Arborescence

```text
portfolio-admin-api/
│
├── src/
│   │
│   ├── about/                     # Gestion de la section "À propos"
│   ├── auth/                      # Authentification JWT
│   ├── common/                    # Fonctions utilitaires communes
│   ├── db/                        # Configuration MySQL
│   ├── legal/                     # Gestion des documents légaux
│   ├── messages/                  # Gestion des formulaires de contact
│   ├── portfolio/                 # Gestion de la galerie photos
│   ├── portfolio-site-settings/   # Paramètres du site vitrine
│   ├── rgpd/                      # Traitements RGPD
│   ├── routes/                    # Routes principales de l'API
│   ├── services-content/          # Gestion de la section Services
│   ├── settings-general/          # Paramètres généraux du Dashboard
│   ├── types/                     # Types TypeScript
│   ├── users/                     # Gestion des utilisateurs
│   ├── websocket/                 # Communication temps réel
│   │
│   ├── env.ts                     # Chargement de la configuration
│   └── server.ts                  # Point d'entrée de l'application
│
├── storage/
│   │
│   ├── dev/                       # Stockage environnement Développement
│   │   ├── about-section-photo/
│   │   ├── legal-documents-archives/
│   │   ├── logos/
│   │   ├── portfolio-images/
│   │   └── portfolio-site-settings/
│   │
│   └── prod/                      # Stockage environnement Production
│       ├── about-section-photo/
│       ├── legal-documents-archives/
│       ├── logos/
│       ├── portfolio-images/
│       └── portfolio-site-settings/
│
├── scripts/
│   ├── backup-dashboard.sh        # Sauvegarde du Dashboard
│   └── restore-dashboard.sh       # Restauration du Dashboard
│
├── .env
├── .env.development
├── package.json
├── tsconfig.json
└── package-lock.json
```

---

## Organisation des modules

L'API est découpée en modules métier afin de séparer clairement les différentes fonctionnalités.

| Module | Description |
|---------|-------------|
| 🔐 **auth** | Authentification, connexion et gestion des jetons JWT |
| 👤 **about** | Gestion de la section « À propos » |
| 🖼️ **portfolio** | Gestion de la galerie photos |
| 💼 **services-content** | Gestion des services proposés sur le site |
| 📨 **messages** | Traitement des demandes de contact |
| 📄 **legal** | Gestion des documents légaux |
| ⚙️ **portfolio-site-settings** | Configuration du site vitrine |
| 🛡️ **rgpd** | Gestion des traitements liés au RGPD |
| 👥 **users** | Administration des utilisateurs |
| 🎛️ **settings-general** | Paramètres généraux du Dashboard |
| 🌐 **websocket** | Communication temps réel avec le Dashboard |

---

## Gestion du stockage

Les fichiers uploadés ne sont pas stockés dans la base de données mais directement sur le serveur.

L'API distingue deux environnements de stockage :

- 🛠️ **Développement** (`storage/dev`)
- 🚀 **Production** (`storage/prod`)

Chaque environnement possède sa propre arborescence afin de séparer complètement les données utilisées pendant le développement de celles de la production.

Cette organisation facilite :

- le déploiement ;
- les sauvegardes ;
- les restaurations ;
- les migrations entre environnements.

---

## Scripts de maintenance

Le dossier `scripts/` regroupe différents scripts d'administration destinés à simplifier la maintenance du projet.

Les scripts actuellement disponibles permettent notamment :

- 💾 la sauvegarde complète du Dashboard ;
- ♻️ la restauration d'une sauvegarde.

---

# 📡 Communication

Le Dashboard communique exclusivement avec l'API REST.

```text
Dashboard
     │
 HTTP / HTTPS
     │
     ▼
API REST
     │
     ▼
MySQL
```

Le Frontend n'effectue jamais de requêtes SQL directement.

Toutes les opérations passent par l'API.

---

# 🔄 Cycle de fonctionnement

```text
Utilisateur
      │
      ▼
Dashboard Admin
      │
 Appel API REST
      │
      ▼
API Admin
      │
Validation
      │
      ▼
MySQL
      │
Réponse JSON
      │
      ▼
Dashboard
```

---

# 🚧 Roadmap

Le projet continue d'évoluer.

Parmi les améliorations envisagées :

- 📊 Tableau de bord avec statistiques
- 📈 Graphiques d'utilisation
- 🔔 Centre de notifications
- 📜 Journal d'activité
- 🗂️ Gestion avancée des médias
- 🌍 Internationalisation
- 📤 Sauvegarde et restauration
- 📱 Amélioration continue de l'interface responsive

---

# 🤝 Contribution

Ce projet est développé dans un cadre personnel.

Les suggestions d'amélioration sont les bienvenues.

---

# 📄 Licence

Ce projet est distribué à des fins de démonstration et d'apprentissage.

Aucune licence open source n'est actuellement associée au projet.

---

# 👨‍💻 Auteur

Développé par **Mael Constantin**.

---

<div align="center">

### ⭐ Merci d'avoir pris le temps de découvrir ce projet !

</div>