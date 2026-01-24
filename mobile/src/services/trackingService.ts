import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// Replace with 'ws://10.0.2.2:8080/ws-tracking/websocket' for Android Emulator
const WS_URL = 'ws://192.168.0.177:8080/ws-tracking/websocket';

class TrackingService {
  client: Client | null = null;
  driverId: string | null = null;
  locationSubscription: Location.LocationSubscription | null = null;

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

  async startLocationTracking(activeOrderId: string | null = null) {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }

    if (this.locationSubscription) {
        this.locationSubscription.remove();
    }

    this.locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        if (this.client && this.client.connected && this.driverId) {
            const payload = {
                driverId: this.driverId,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                orderId: activeOrderId
            };

            this.client.publish({
                destination: '/app/update',
                body: JSON.stringify(payload),
                headers: {
                    'content-type': 'application/json'
                }
            });
            console.log('Sent location update:', payload.latitude, payload.longitude);
        }
      }
    );
  }

  stop() {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    if (this.client) {
      this.client.deactivate();
    }
  }
}

export const trackingService = new TrackingService();
