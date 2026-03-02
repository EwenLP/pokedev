# 🐉 Pokebuild

**Pokebuild** est une application web permettant aux dresseurs de consulter le Pokédex et de concevoir leur équipe stratégique de 6 Pokémon.

---

## 🚀 Fonctionnalités

### 👀 Mode Visiteur
- Consultation du Pokédex complet
- Fonction de recherche (nom, type, etc.)

### 👤 Mode Utilisateur
- Inscription / Connexion
- Création d’une équipe de 6 Pokémon
- Modification et sauvegarde de l’équipe

### 🛡️ Mode Admin
- Gestion complète des utilisateurs
- Suppression / modification des comptes si nécessaire

---

## 🛠️ Stack Technique

- **Frontend :** React.js (Vite)
- **Routing :** React Router
- **API externe :** PokéAPI (https://pokebuildapi.fr/api/v1)
- **Backend :** Node.js
- **Base de données :** MySQL

---

## 📋 Conventions de Nommage

### 📁 Fichiers et Dossiers
- **Composants :** `PascalCase`  
  Exemple : `PokemonCard.jsx`
- **Dossiers :** `kebab-case`  
  Exemple : `src/components/ui-elements/`
- **Hooks :** préfixe `use` en `camelCase`  
  Exemple : `usePokemonData.js`

---

### 💻 Code (JavaScript / React)

- **Variables / Fonctions :** `camelCase`  
  Exemple :
  ```js
  const [teamList, setTeamList] = useState([]);
  ```
- **Styles (CSS Modules) :** `kebab-case`  
  Exemple : `.main-container`

---

## 💬 Conventions de Commits

**Format :**
```
[préfixe] message de commit
```

| Préfixe        | Utilisation |
|----------------|-------------|
| **[FEAT]**     | Ajout d'une nouvelle fonctionnalité |
| **[FIX]**      | Correction d'un bug |
| **[DOCS]**     | Modification documentation |
| **[STYLE]**    | CSS / design uniquement |
| **[REFACTOR]** | Refactor sans changer le comportement |
| **[CHORE]**    | Maintenance / configuration |

**Exemple :**
```
git commit -m "[feat] ajout de la recherche par type"
```

---

# ✅ CHECK LIST VALIDATION PROJET SUPPORT (APPLICATION DES EQUIPES)

## 🎯 But

Valider rapidement un projet support réaliste et compatible certification (BC03, BC04, transversale).

---

## 📏 Règle

Le projet est validé **si et seulement si** tous les points ci-dessous sont respectés.

---

## 🧱 Stack et Structure

- Frontend présent
- API présente (backend réel)
- Base de données ou stockage structuré existant
- Aucun CMS utilisé

---

## 🔐 Authentification et Accès

- Authentification présente (même simple)
- Gestion minimale des droits ou rôles :
    - Au moins 2 niveaux (ex : utilisateur / admin)
    - OU restrictions d’accès sur certaines routes ou actions

---

## 🎯 Périmètre Réaliste

- 2 à 3 fonctionnalités principales maximum
- Parcours utilisateurs simples
- Démonstration claire possible en soutenance

---

## ✔️ Exemple d'application au projet Pokebuild

- ✔️ Consultation Pokédex (API externe)
- ✔️ Création / sauvegarde d’équipe (CRUD)
- ✔️ Gestion utilisateurs (admin)
- ✔️ Authentification
- ✔️ Séparation Front / API / DB
- ✔️ Périmètre maîtrisé

---

Projet structuré, démontrable et compatible certification. 🚀