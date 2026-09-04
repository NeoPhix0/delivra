import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { socketService, LocationPayload, StatusPayload } from '@services/socketService';

/**
 * Hook for tracking delivery in real-time via Socket.io
 * @param deliveryId - Delivery ID to track (null to stop tracking)
 * @returns Object containing driverLocation, deliveryStatus, and isConnected status
 */
function useDeliveryTracking(deliveryId: string | null): {
  driverLocation: LocationPayload | null;
  deliveryStatus: string | null;
  isConnected: boolean;
} {
  const [driverLocation, setDriverLocation] = useState<LocationPayload | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const token = user?.token;

    if (!deliveryId || !token) {
      // Disconnect socket if deliveryId becomes null or token missing
      socketService.disconnect();
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

    // Register status update callback
    socketService.onStatusUpdate((data: StatusPayload) => {
      setDeliveryStatus(data.status);
    });

    // Cleanup on unmount or deliveryId change
    return () => {
      socketService.leaveDelivery(deliveryId);
      socketService.offLocationUpdate();
      socketService.offStatusUpdate();
      // Only disconnect if deliveryId becomes null (handled in outer effect)
    };
  }, [deliveryId, user?.token]);

  const isConnected = socketService.isConnected();

  return {
    driverLocation,
    deliveryStatus,
    isConnected,
  };
}

export default useDeliveryTracking;
