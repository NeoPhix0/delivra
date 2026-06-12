import { io, Socket } from 'socket.io-client';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

let socket: Socket | null = null;
let locationUpdateCallback: ((data: LocationPayload) => void) | null = null;

export interface LocationPayload {
  lat: number;
  lng: number;
  heading?: number;
  timestamp: string;
}

/**
 * Connect to Socket.io server with JWT token
 * @param token - JWT access token
 */
function connect(token: string): void {
  if (socket?.connected) {
    console.log('Socket already connected');
    return;
  }

  socket = io(BASE_URL, {
    transports: ['websocket'],
    autoConnect: false,
    auth: {
      token,
    },
  });

  socket.connect();

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  // Register location update listener if callback is set
  if (locationUpdateCallback) {
    socket.on('delivery:location', locationUpdateCallback);
  }
}

/**
 * Disconnect from Socket.io server
 */
function disconnect(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected manually');
  }
}

/**
 * Join a delivery room for real-time tracking
 * @param deliveryId - Delivery ID to join
 */
function joinDelivery(deliveryId: string): void {
  if (!socket?.connected) {
    console.warn('Socket not connected, cannot join delivery');
    return;
  }

  socket.emit('delivery:join', { deliveryId });
  console.log('Joined delivery room:', deliveryId);
}

/**
 * Leave a delivery room
 * @param deliveryId - Delivery ID to leave
 */
function leaveDelivery(deliveryId: string): void {
  if (!socket?.connected) {
    console.warn('Socket not connected, cannot leave delivery');
    return;
  }

  socket.emit('delivery:leave', { deliveryId });
  console.log('Left delivery room:', deliveryId);
}

/**
 * Register callback for delivery:location events
 * @param callback - Function to call when location updates are received
 */
function onLocationUpdate(callback: (data: LocationPayload) => void): void {
  locationUpdateCallback = callback;

  if (socket?.connected) {
    socket.on('delivery:location', callback);
  }
}

/**
 * Remove location update listener
 */
function offLocationUpdate(): void {
  if (socket && locationUpdateCallback) {
    socket.off('delivery:location', locationUpdateCallback);
  }
  locationUpdateCallback = null;
}

/**
 * Check if socket is connected
 * @returns true if connected, false otherwise
 */
function isConnected(): boolean {
  return socket?.connected || false;
}

/**
 * Emit an event to the socket server
 * @param event - Event name
 * @param data - Event payload
 */
function emit(event: string, data: any): void {
  if (socket?.connected) {
    socket.emit(event, data);
  }
}

export const socketService = {
  connect,
  disconnect,
  joinDelivery,
  leaveDelivery,
  onLocationUpdate,
  offLocationUpdate,
  isConnected,
  emit,
};
