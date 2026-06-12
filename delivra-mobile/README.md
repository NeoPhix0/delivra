# Delivra Mobile App

This is the Delivra mobile application built with [Expo](https://expo.dev) and [Expo Router](https://docs.expo.dev/router/introduction).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## API Configuration

The app uses a simple environment variable-based configuration to connect to the Delivra backend API.

### Environment Variables

Edit the `.env` file to set the API URL for your environment:

```bash
# Development (local)
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# Development (tunnel HTTPS for real device)
EXPO_PUBLIC_API_URL=https://wicked-cycles-repair.loca.lt/api

# Staging
EXPO_PUBLIC_API_URL=https://staging-api.delivra.com/api

# Production
EXPO_PUBLIC_API_URL=https://api.delivra.com/api
```

### Environments

The app automatically detects the environment based on the API URL:

- **Development**: URLs containing `localhost` or `127.0.0.1`
- **Staging**: URLs containing `staging` or `dev`
- **Production**: URLs containing `prod` or `api.delivra.com`

### Multi-Client Architecture

This configuration is consistent across all Delivra clients:

- **Mobile (Expo)**: Uses `EXPO_PUBLIC_API_URL` from `.env`
- **Web (React)**: Uses `REACT_APP_API_URL` from `.env`
- **Backend**: Uses `API_URL` from `.env`

All clients connect to the same backend API instance for a given environment.

### Configuration Helper

The `config/apiConfig.js` file provides helper functions:

```typescript
import { getApiUrl, getEnvironment, getConfig } from '../config/apiConfig';

// Get current API URL
const url = getApiUrl();

// Get current environment
const env = getEnvironment(); // 'development' | 'staging' | 'production'

// Get full configuration
const config = getConfig(); // { url, environment }
```

## Development

### Setting up LocalTunnel

For development with a real device outside your local network:

1. Install localtunnel:
   ```bash
   npm install -g localtunnel
   ```

2. Start the tunnel:
   ```bash
   lt --port 3000
   ```

3. Update `EXPO_PUBLIC_API_URL` in `.env` with the generated URL

### Setting up Ngrok (Alternative)

If you prefer ngrok:

1. Install ngrok and configure your authtoken
2. Start ngrok:
   ```bash
   ngrok http 3000
   ```

3. Update `EXPO_PUBLIC_API_URL` in `.env` with the generated URL

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
