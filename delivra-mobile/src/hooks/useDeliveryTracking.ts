import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { socketService, LocationPayload } from '@services/socketService';

/**
 * Hook for tracking delivery in real-time via Socket.io
 * @param deliveryId - Delivery ID to track (null to stop tracking)
 * @returns Object containing driverLocation and isConnected status
 */
function useDeliveryTracking(deliveryId: string | null): {
  driverLocation: LocationPayload | null;
  isConnected: boolean;
} {
  const [driverLocation, setDriverLocation] = useState<LocationPayload | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!deliveryId) {
      // Disconnect socket if deliveryId becomes null
      socketService.disconnect();
      return;
    }

    const token = user?.token;

    if (!token) {
      console.warn('No token available for socket connection');
      return;
    }

    // Connect to socket
    socketService.connect(token);

    // Join delivery room
    socketService.joinDelivery(deliveryId);

    // Register location update callback
    socketService.onLocationUpdate((data: LocationPayload) => {
      setDriverLocation(data);
    });

    // Cleanup on unmount or deliveryId change
    return () => {
      socketService.leaveDelivery(deliveryId);
      socketService.offLocationUpdate();
      // Only disconnect if deliveryId becomes null (handled in outer effect)
    };
  }, [deliveryId, user?.token]);

  const isConnected = socketService.isConnected();

  return {
    driverLocation,
    isConnected,
  };
}

export default useDeliveryTracking;
