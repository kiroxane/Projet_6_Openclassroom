# Mon Vieux Grimoire — API back-end

API REST du site de notation de livres « Mon Vieux Grimoire ».
Elle expose 9 routes consommées par le front-end React situé dans `../P7-Dev-Web-livres`.

**Stack :** Node.js · Express · MongoDB (Atlas) · Mongoose · JWT · bcrypt · Multer · Sharp

---

## Installation

### 1. Prérequis

- **Node.js 18 ou supérieur** (développé et testé sous Node 24)
- **npm**
- Un accès à une base **MongoDB Atlas** (voir § Base de données)

### 2. Installer les dépendances

```bash
cd backend
npm install
```

### 3. Configurer les variables d'environnement

Copiez le fichier d'exemple et renseignez-le :

```bash
cp .env.example .env
```

| Variable | Obligatoire | Description |
|---|---|---|
| `MONGODB_URI` | oui | Chaîne de connexion MongoDB Atlas (`mongodb+srv://…`) |
| `JWT_SECRET` | oui | Clé secrète de signature des tokens JWT |
| `PORT` | non | Port d'écoute, **4000** par défaut — valeur attendue par le front |

> ⚠️ Le fichier `.env` est volontairement exclu du dépôt (`.gitignore`).
> Les valeurs réelles sont fournies séparément, dans le dossier de livrables.

Pour générer une clé JWT si vous en créez une :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. Lancer le serveur

```bash
npm start      # production
npm run dev    # développement, avec rechargement automatique (nodemon)
```

Le démarrage est correct lorsque la console affiche :

```
Listening on port 4000
Connexion à MongoDB réussie !
```

### 5. Lancer le front-end

Dans un second terminal :

```bash
cd ../P7-Dev-Web-livres
npm install
npm start
```

L'application est alors disponible sur `http://localhost:3000` et interroge l'API sur
`http://localhost:4000`.

---

## Base de données

La base est hébergée sur **MongoDB Atlas**. Deux collections :

- `users` — e-mail (unique) et mot de passe haché
- `books` — livres, avec leur tableau de notes imbriqué

### Accès depuis une autre machine

L'accès Atlas est restreint par adresse IP. Le cluster de ce projet autorise `0.0.0.0/0`,
afin que l'application puisse être exécutée depuis n'importe quel poste sans configuration
supplémentaire. Aucune action n'est donc nécessaire pour lancer le projet.

Si vous utilisez **votre propre cluster** Atlas :

1. Créez un utilisateur de base de données (rôle *Read and write to any database*)
2. Dans **Network Access**, ajoutez votre IP — ou `0.0.0.0/0` pour un accès sans restriction
3. Reportez la chaîne de connexion dans `MONGODB_URI`

Les collections sont créées automatiquement au premier enregistrement : aucun script
d'initialisation n'est nécessaire.

---

## Les 9 routes de l'API

Base : `http://localhost:4000`

### Authentification — `/api/auth`

| Méthode | Route | Auth | Corps de la requête | Réponse |
|---|---|:---:|---|---|
| `POST` | `/signup` | — | `{ email, password }` | `201` · `{ message }` |
| `POST` | `/login` | — | `{ email, password }` | `200` · `{ userId, token }` |

### Livres — `/api/books`

| Méthode | Route | Auth | Corps de la requête | Réponse |
|---|---|:---:|---|---|
| `GET` | `/` | — | — | `200` · tableau de livres |
| `GET` | `/bestrating` | — | — | `200` · les 3 livres les mieux notés |
| `GET` | `/:id` | — | — | `200` · un livre |
| `POST` | `/` | ✅ | `multipart` : `book` (JSON) + `image` (fichier) | `201` · `{ message }` |
| `PUT` | `/:id` | ✅ | `multipart` (avec image) ou JSON (sans image) | `200` · `{ message }` |
| `DELETE` | `/:id` | ✅ | — | `200` · `{ message }` |
| `POST` | `/:id/rating` | ✅ | `{ userId, rating }` — note de 0 à 5 | `200` · le livre mis à jour |

Les routes protégées attendent l'en-tête :

```
Authorization: Bearer <token>
```

### Codes d'erreur

| Code | Signification |
|---|---|
| `400` | Requête invalide — note hors bornes, livre déjà noté, fichier non décodable, e-mail déjà utilisé |
| `401` | Non authentifié — token absent, invalide ou expiré · identifiants de connexion incorrects |
| `403` | Authentifié, mais non propriétaire de la ressource |
| `404` | Livre introuvable |

Le token JWT est valable **24 heures**.



## Scripts npm

| Commande | Effet |
|---|---|
| `npm start` | Démarre le serveur (`node server.js`) |
| `npm run dev` | Démarre le serveur avec rechargement automatique (`nodemon`) |

---

## Dépannage

| Symptôme | Cause probable |
|---|---|
| `Connexion à MongoDB échouée !` | `MONGODB_URI` absent ou mal formé dans `.env` · IP non autorisée dans Atlas |
| `401` sur toutes les routes protégées | `JWT_SECRET` absent · token expiré (24 h) · en-tête `Authorization` mal formé |
| `port: 4000 is already in use` | Un serveur tourne déjà — `lsof -ti:4000 \| xargs kill` |
| Les images ne s'affichent pas | Vérifiez que le serveur écoute bien sur le port 4000, attendu par le front |