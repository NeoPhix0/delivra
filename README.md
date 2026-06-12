# Delivra

Delivra is a modern on-demand delivery platform that connects clients who need packages delivered with available drivers. It provides real-time tracking, secure payments, and a seamless experience across mobile and web applications.

## What is Delivra?

Delivra is a delivery service platform where clients can request package deliveries, drivers can accept and fulfill delivery requests, and admins can manage the entire system. The platform handles everything from order creation to real-time tracking, driver assignment, and payment processing.

## Who is it for?

Delivra serves three main user roles:

- **Client**: Individuals or businesses who need packages delivered. They can create delivery requests, track their packages in real-time, communicate with drivers, and rate completed deliveries.

- **Driver**: Delivery personnel who accept delivery requests, pick up packages, and deliver them to recipients. Drivers can manage their availability, view delivery history, and track their earnings.

- **Admin**: Platform administrators who oversee the entire system. They can manage users, view all deliveries, assign drivers, and handle platform configuration.

## Project Structure

The Delivra monorepo contains four sub-projects:

- **delivra-api**: The backend REST API server built with Express.js, PostgreSQL, and Prisma ORM. It handles authentication, delivery management, real-time socket connections, and business logic.

- **delivra-mobile**: The React Native mobile app for iOS and Android. Built with Expo, it provides native mobile experiences for both clients and drivers with features like location tracking and push notifications.

- **delivra-web**: The React web application for clients. Built with React 19, Material-UI, and Leaflet maps, it offers a browser-based experience for creating deliveries and tracking packages.

- **delivra-shared**: Shared utilities, types, and configurations used across multiple projects (if present).

## Tech Stack

### Backend (delivra-api)
- Node.js with Express.js
- PostgreSQL database with Prisma ORM
- JWT authentication
- Socket.io for real-time communication
- Zod for validation
- Pino for logging

### Mobile (delivra-mobile)
- React Native with Expo
- TypeScript
- React Navigation
- Axios for API calls
- Socket.io-client for real-time updates
- Expo Location for GPS tracking
- i18next for internationalization

### Web (delivra-web)
- React 19 with TypeScript
- Material-UI (MUI) components
- React Router for navigation
- Leaflet and React-Leaflet for maps
- Framer Motion for animations
- Axios for API calls

## Key Features

### For Clients
- Create delivery requests with pickup and delivery addresses
- Real-time package tracking with live map updates
- View delivery history and status
- Rate and review drivers
- Cancel deliveries when needed

### For Drivers
- View available delivery requests
- Accept or reject deliveries
- Real-time location sharing with clients
- Manage availability status
- View delivery history and earnings
- Rate clients

### For Admins
- View all deliveries and their status
- Manage users (clients and drivers)
- Assign drivers to deliveries
- View platform analytics
- Manage delivery categories

## Getting Started

### Backend (delivra-api)

1. Navigate to the API directory:
   ```bash
   cd delivra-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see Environment Variables section below)

4. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The API will run on `http://localhost:5000` by default.

### Mobile (delivra-mobile)

1. Navigate to the mobile directory:
   ```bash
   cd delivra-mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see Environment Variables section below)

4. Start the Expo development server:
   ```bash
   npx expo start
   ```

Scan the QR code with the Expo Go app on your mobile device, or press `a` for Android emulator or `i` for iOS simulator.

### Web (delivra-web)

1. Navigate to the web directory:
   ```bash
   cd delivra-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see Environment Variables section below)

4. Start the development server:
   ```bash
   npm start
   ```

The web app will open in your browser at `http://localhost:3000`.

## Environment Variables

### delivra-api
Create a `.env` file in the `delivra-api` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/delivra
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
```

### delivra-mobile
Create a `.env` file in the `delivra-mobile` directory:

```env
API_URL=http://localhost:5000
```

### delivra-web
Create a `.env` file in the `delivra-web` directory:

```env
REACT_APP_API_URL=http://localhost:5000
```
