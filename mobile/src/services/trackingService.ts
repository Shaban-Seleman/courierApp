import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with 'ws://10.0.2.2:8080/ws-tracking/websocket' for Android Emulator
const WS_URL = 'ws://192.168.0.177:8080/ws-tracking/websocket';

class TrackingService {
  client: Client | null = null;
  driverId: string | null = null;
  watchId: number | null = null;

  async connect(driverId: string) {
    this.driverId = driverId;
    const token = await AsyncStorage.getItem('token');

    this.client = new Client({
      brokerURL: WS_URL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      // React Native doesn't support TextDecoder/TextEncoder by default in some environments,
      // stompjs v7 handles this, but forcing binary can be safer or debugging
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      debug: (str) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
    });

    this.client.onConnect = () => {
      console.log('Mobile connected to Tracking WS');
      // Tracking is started via specific call from Dashboard when "Online"
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.activate();
  }

  startLocationTracking(activeOrderId: string | null = null) {
    // In a real app, use expo-location or react-native-geolocation-service
    // Here we'll mock location updates

    // Mock movement
    let lat = 40.7128;
    let lng = -74.0060;

    this.watchId = setInterval(() => {
        if (this.client && this.client.connected && this.driverId) {
            lat += 0.0001;
            lng += 0.0001;

            const payload = {
                driverId: this.driverId,
                latitude: lat,
                longitude: lng,
                orderId: activeOrderId
            };

            this.client.publish({
                destination: '/app/update',
                body: JSON.stringify(payload),
                headers: {
                    'content-type': 'application/json'
                }
            });

        }
    }, 5000) as unknown as number;
  }

  stop() {
    if (this.watchId !== null) {
      clearInterval(this.watchId);
      this.watchId = null;
    }
    if (this.client) {
      this.client.deactivate();
    }
  }
}

export const trackingService = new TrackingService();
