# Audit des routes API — Delivra Backend

**Date :** 9 juin 2026  
**Comparaison entre** `API_CONTRACT.md` et les routes implémentées dans `src/routes/`

---

## ✅ Routes implémentées (41)

### authService

| Méthode | Endpoint | Fichier |
|---------|----------|---------|
| POST | `/auth/login` | authRoutes.js |
| POST | `/auth/register` | authRoutes.js |
| POST | `/auth/logout` | authRoutes.js |
| GET | `/auth/me` | authRoutes.js |
| POST | `/auth/refresh` | authRoutes.js |
| POST | `/auth/forgot-password` | authRoutes.js |
| POST | `/auth/reset-password` | authRoutes.js |
| POST | `/auth/verify-email` | authRoutes.js |

### deliveryService

| Méthode | Endpoint | Fichier |
|---------|----------|---------|
| POST | `/deliveries` | deliveryRoutes.js |
| GET | `/deliveries` | deliveryRoutes.js |
| GET | `/deliveries/:id` | deliveryRoutes.js |
| PATCH | `/deliveries/:id/status` | deliveryRoutes.js |
| PATCH | `/deliveries/:id/cancel` | deliveryRoutes.js |

### driverService

| Méthode | Endpoint | Fichier |
|---------|----------|---------|
| GET | `/driver/available-deliveries` | driverRoutes.js |
| POST | `/driver/deliveries/:id/accept` | driverRoutes.js |
| POST | `/driver/deliveries/:id/reject` | driverRoutes.js |
| GET | `/driver/deliveries` | driverRoutes.js |
| PUT | `/driver/online-status` | driverRoutes.js |
| PUT | `/driver/location` | driverRoutes.js |
| GET | `/driver/earnings` | driverRoutes.js |
| GET | `/driver/earnings/stats` | driverRoutes.js |

### categoryService

| Méthode | Endpoint | Fichier |
|---------|----------|---------|
| GET | `/categories` | categoryRoutes.js |
| GET | `/categories/:id` | categoryRoutes.js |
| GET | `/categories/popular` | categoryRoutes.js |
| POST | `/categories` | categoryRoutes.js |
| DELETE | `/categories/:id` | categoryRoutes.js |

### notificationService

| Méthode | Endpoint | Fichier |
|---------|----------|---------|
| GET | `/notifications` | notificationRoutes.js |
| PATCH | `/notifications/:id/read` | notificationRoutes.js |
| GET | `/notifications/unread-count` | notificationRoutes.js |

### userService

| Méthode | Endpoint | Fichier |
|---------|----------|---------|
| GET | `/users/profile` | userRoutes.js |
| PUT | `/users/profile` | userRoutes.js |
| PUT | `/users/change-password` | userRoutes.js |
| DELETE | `/users/account` | userRoutes.js |

### statsService

| Méthode | Endpoint | Fichier |
|---------|----------|---------|
| GET | `/stats/user` | statsRoutes.js |
| GET | `/stats/driver` | statsRoutes.js |
| GET | `/stats/admin` | statsRoutes.js |

### adminService

| Méthode | Endpoint | Fichier |
|---------|----------|---------|
| GET | `/admin/dashboard` | adminRoutes.js |
| GET | `/admin/users` | adminRoutes.js |
| POST | `/admin/users/:id/block` | adminRoutes.js |
| POST | `/admin/users/:id/unblock` | adminRoutes.js |
| DELETE | `/admin/users/:id` | adminRoutes.js |
| GET | `/admin/orders` | adminRoutes.js |

---

## ⚠️ Routes avec divergence de méthode/chemin (4)

| Contrat (API_CONTRACT.md) | Implémenté | Différence |
|---------------------------|------------|------------|
| `PATCH /categories/:id` | `PUT /categories/:id` | Méthode : PATCH → PUT |
| `PUT /notifications/read-all` | `PATCH /notifications/read-all` | Méthode : PUT → PATCH |
| `POST /deliveries/:id/assign-driver` | `PATCH /deliveries/:id/assign` | Méthode + chemin modifiés |
| `PATCH /admin/orders/:id/status` | `PUT /admin/orders/:id/status` | Méthode : PATCH → PUT |

---

## ❌ Routes manquantes (23)

### 🔴 serviceZoneService — Aucun fichier de routes (3 routes)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/service-zones` | Lister les zones de service |
| GET | `/service-zones/:id` | Détail d'une zone |
| POST | `/service-zones/check-point` | Vérifier si un point est dans une zone |

**Fichiers manquants :** `serviceZoneRoutes.js`, `serviceZoneController.js`, `serviceZoneService.js`

### 🔴 blogService — Aucun fichier de routes (4 routes)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/blog/posts` | Lister les articles |
| POST | `/blog/posts` | Créer un article |
| PATCH | `/blog/posts/:id` | Modifier un article |
| DELETE | `/blog/posts/:id` | Supprimer un article |

**Fichiers manquants :** `blogRoutes.js`, `blogController.js`, `blogService.js`

### 🔴 geolocationService — Aucun fichier de routes (4 routes)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/geocode` | Géocodage d'adresse |
| POST | `/reverse-geocode` | Géocodage inverse |
| POST | `/geocode/distance` | Calcul de distance |
| POST | `/geocode/estimate-time` | Estimation du temps |

**Fichiers manquants :** `geolocationRoutes.js`, `geolocationController.js`, `geolocationService.js`

### 🟠 deliveryService — Routes manquantes (6 routes)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/client/deliveries` | Livraisons du client connecté |
| PATCH | `/deliveries/:id` | Mise à jour générique d'une livraison |
| POST | `/deliveries/:id/image` | Upload d'image pour une livraison |
| GET | `/drivers/available` | Liste des chauffeurs disponibles |
| GET | `/drivers/:id` | Détails d'un chauffeur |
| GET | `/deliveries/history` | Historique global des livraisons |

**Note :** Le préfixe `/client` n'est pas monté dans `index.js`

### 🟠 driverService — Routes manquantes (2 routes)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/driver/profile` | Profil du chauffeur |
| PUT | `/driver/profile` | Mise à jour du profil chauffeur |

### 🟠 userService — Routes manquantes (1 route)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/users/profile-picture` | Upload de photo de profil |

### 🟠 notificationService — Routes manquantes (1 route)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| DELETE | `/notifications/:id` | Supprimer une notification |

### 🟠 adminService — Routes manquantes (2 routes)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/admin/transactions` | Liste des transactions |
| GET | `/admin/system-stats` | Statistiques système |

---

## 📊 Résumé

| Catégorie | Nombre |
|-----------|--------|
| Routes dans le contrat | **69** |
| Routes implémentées correctement | **41** |
| Routes avec divergence (méthode/chemin) | **4** |
| Routes totalement manquantes | **23** |
| **Taux de couverture** | **59%** |

### Services complets (aucune route manquante)
- ✅ authService (8/8)
- ✅ statsService (3/3)

### Services partiels
- 🟡 driverService (8/10)
- 🟡 categoryService (5/6)
- 🟡 notificationService (3/5)
- 🟡 userService (4/5)
- 🟡 deliveryService (5/11)
- 🟡 adminService (6/9)

### Services totalement absents
- 🔴 serviceZoneService (0/3)
- 🔴 blogService (0/4)
- 🔴 geolocationService (0/4)