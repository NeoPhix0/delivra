# Configuration du service API - React Native Mobile

## Vue d'ensemble

L'app mobile utilise le service API partagé (`delivra-shared`) qui communique avec le backend `delivra-api`.

## Structure

```
delivra-mobile/
├── services/
│   └── api.ts              # Service API configuré avec ReactNativeStorageAdapter
├── .env.example            # Variables d'environnement à copier
├── app/                    # Écrans et navigation
└── package.json
```

## Configuration

### 1. Copier le fichier `.env`

```bash
cp delivra-mobile/.env.example delivra-mobile/.env
```

### 2. Configurer l'URL de l'API

Selon votre environnement de développement, modifiez `delivra-mobile/.env` :

#### Android Emulator
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
```

#### iOS Simulator
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

#### Device réel sur le même réseau
```env
EXPO_PUBLIC_API_URL=http://192.168.1.X:3000/api
```
Remplacer `192.168.1.X` par l'adresse IP locale de votre machine.

## Utilisation dans les composants

### Import des services

```typescript
import {
  authService,
  deliveryService,
  driverService,
  // ... autres services
} from '../../services/api';
```

### Exemple d'authentification

```typescript
import { authService, setOnUnauthorizedCallback } from '../../services/api';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  // Configurer le callback pour la déconnexion automatique
  React.useEffect(() => {
    setOnUnauthorizedCallback(() => {
      router.push('/(auth)/login');
    });
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      // Token sauvegardé automatiquement dans AsyncStorage
      router.push('/(tabs)');
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Login échoué');
    }
  };

  return (
    // ... JSX
  );
}
```

### Exemple de récupération de données

```typescript
import { deliveryService } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function MyOrdersScreen() {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await deliveryService.getMyDeliveries();
      setOrders(response.deliveries || response || []);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les commandes');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... JSX
  );
}
```

### Vérifier si l'utilisateur est connecté au démarrage

```typescript
import { getStoredAuth, setOnUnauthorizedCallback } from '../../services/api';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await getStoredAuth();
    if (user) {
      // Utilisateur déjà connecté
      router.push(`/(${user.role || 'client'})`);
    } else {
      router.push('/(auth)/welcome');
    }
  };

  // Configurer le callback de déconnexion automatique
  setOnUnauthorizedCallback(() => {
    router.push('/(auth)/login');
  });

  return (
    // ... JSX
  );
}
```

## Services disponibles

### `authService`
- `login(credentials)` - Authentification
- `register(userData)` - Enregistrement
- `logout()` - Déconnexion
- `getCurrentUser()` - Récupérer l'utilisateur connecté
- `getStoredUser()` - Récupérer l'utilisateur depuis AsyncStorage
- `isAuthenticated()` - Vérifier si l'utilisateur est connecté

### `deliveryService`
- `getMyDeliveries()` - Récupérer mes livraisons
- `createDelivery(data)` - Créer une livraison
- `getDeliveryById(id)` - Récupérer une livraison
- `updateDelivery(id, data)` - Mettre à jour une livraison
- `cancelDelivery(id)` - Annuler une livraison
- `assignDriver(deliveryId, driverId)` - Assigner un chauffeur

### `driverService`
- `getProfile()` - Récupérer le profil du chauffeur
- `updateProfile(data)` - Mettre à jour le profil
- `updateLocation(lat, lng)` - Mettre à jour la localisation
- `updateOnlineStatus(isOnline)` - Mettre à jour le statut online
- `getAvailableDeliveries()` - Récupérer les livraisons disponibles
- `acceptDelivery(deliveryId)` - Accepter une livraison
- `rejectDelivery(deliveryId)` - Refuser une livraison
- `getEarnings()` - Récupérer les gains
- `getEarningsStats()` - Statistiques des gains

### Autres services
- `categoryService` - Gestion des catégories
- `notificationService` - Notifications
- `userService` - Profil utilisateur
- `statsService` - Statistiques
- `serviceZoneService` - Zones de service
- `blogService` - Blog
- `geolocationService` - Géolocalisation
- `adminService` - Admin

## Gestion des erreurs

Les erreurs API sont automatiquement normalisées :

```typescript
import { apiHelpers } from '../../services/api';

try {
  await deliveryService.createDelivery(data);
} catch (error) {
  const { message, code, status } = apiHelpers.handleApiError(error);
  Alert.alert('Erreur', message);
}
```

## Stockage des données

Les tokens et informations utilisateur sont automatiquement stockés dans `AsyncStorage` :

```typescript
import { authService } from '../../services/api';

// Après login, les données sont sauvegardées
await authService.login({ email, password });

// Récupérer l'utilisateur stocké
const user = await authService.getStoredUser();

// Vérifier si connecté
const isAuth = await authService.isAuthenticated();
```

## Développement

### Démarrer l'app
```bash
cd delivra-mobile
npm start
```

### Sur Android
```bash
npm run android
```

### Sur iOS
```bash
npm run ios
```

### Sur le web (test)
```bash
npm run web
```

## Notes importantes

⚠️ **Assurez-vous que le backend `delivra-api` est en cours d'exécution** :
```bash
cd delivra-api
npm run dev
```

⚠️ **Configuration réseau** : Sur Android Emulator, utilisez toujours `10.0.2.2:3000` et non `localhost:3000`

⚠️ **Certificats SSL** : En développement, les certificats self-signed peuvent causer des problèmes. Utiliser HTTP ou configurer correctement les certificats en production.

## Dépannage

### L'app ne peut pas atteindre l'API
1. Vérifier que le backend est démarré
2. Vérifier l'URL de l'API dans `.env`
3. Vérifier que le firewall n'est pas bloquant
4. Vérifier que vous êtes sur le même réseau

### Erreur de token expiré
- Automatiquement géré par le callback `onUnauthorized`
- L'utilisateur est redirigé vers l'écran de login

### AsyncStorage non disponible
- Assurez-vous que `@react-native-async-storage/async-storage` est installé
- Cela fait partie des dépendances du `package.json`
