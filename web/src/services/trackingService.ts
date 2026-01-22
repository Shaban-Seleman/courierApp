import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

type TrackingUpdateCallback = (update: any) => void;

class TrackingService {
  client: Client | null = null;
  private subscriptions: { [topic: string]: { callback: TrackingUpdateCallback, subscription: StompSubscription | null } } = {};
  private connectionPromise: Promise<void> | null = null;
  private resolveConnection: (() => void) | null = null;
  private rejectConnection: ((error: Error) => void) | null = null;


  connect(token: string): Promise<void> {
    if (this.client && this.client.active) {
      return Promise.resolve(); // Already connected
    }

    if (this.connectionPromise) {
        return this.connectionPromise; // Return existing promise if connection is in progress
    }

    this.connectionPromise = new Promise((resolve, reject) => {
        this.resolveConnection = resolve;
        this.rejectConnection = reject;

        this.client = new Client({
            brokerURL: 'ws://localhost:8080/ws-tracking/websocket', // Use correct WS protocol
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: function (str) {
                console.log('STOMP (Web): ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
            console.log('Web connected to WebSocket');
            this.resolveConnection?.(); // Resolve the connection promise

            // Re-establish queued subscriptions on reconnect
            Object.keys(this.subscriptions).forEach(topic => {
                const subInfo = this.subscriptions[topic];
                if (!subInfo.subscription) { // If it's a queued subscription that hasn't been established yet
                    subInfo.subscription = this.client?.subscribe(topic, (message: IMessage) => {
                        if (message.body) {
                            subInfo.callback(JSON.parse(message.body));
                        }
                    }) || null;
                }
            });
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error (Web): ' + frame.headers['message']);
            console.error('Additional details (Web): ' + frame.body);
            this.rejectConnection?.(new Error(frame.headers['message'] || 'STOMP error'));
            this.connectionPromise = null; // Reset promise on error
        };

        this.client.onWebSocketError = (event) => {
            console.error('WebSocket error (Web):', event);
            this.rejectConnection?.(new Error('WebSocket connection error'));
            this.connectionPromise = null; // Reset promise on error
        };

        this.client.onDisconnect = () => {
            console.log('Web disconnected from WebSocket');
            // Do not reset connectionPromise here, as it might be a temporary disconnect/reconnect
        };

        this.client.activate();
    });

    return this.connectionPromise;
  }

  subscribeToAdminMap(callback: TrackingUpdateCallback): () => void {
    const topic = '/topic/admin/map';
    // If not connected yet, queue the subscription
    if (!this.client?.active) {
        this.subscriptions[topic] = { callback, subscription: null };
        console.warn('STOMP client not active. Subscription to admin map will be queued.');
        // Return a dummy unsubscribe function for immediate use
        return () => this.unsubscribe(topic);
    }
    // If already connected, subscribe directly
    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      if (message.body) {
        callback(JSON.parse(message.body));
      }
    });
    this.subscriptions[topic] = { callback, subscription };
    return () => this.unsubscribe(topic);
  }

  subscribeToOrderTracking(orderId: string, callback: TrackingUpdateCallback): () => void {
    const topic = `/topic/orders/${orderId}`;
    // If not connected yet, queue the subscription
    if (!this.client?.active) {
        this.subscriptions[topic] = { callback, subscription: null };
        console.warn(`STOMP client not active. Subscription to order ${orderId} will be queued.`);
        // Return a dummy unsubscribe function for immediate use
        return () => this.unsubscribe(topic);
    }
    // If already connected, subscribe directly
    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      if (message.body) {
        callback(JSON.parse(message.body));
      }
    });
    this.subscriptions[topic] = { callback, subscription };
    return () => this.unsubscribe(topic);
  }

  unsubscribe(topic: string) {
    if (this.subscriptions[topic] && this.subscriptions[topic].subscription) {
        this.subscriptions[topic].subscription.unsubscribe();
        console.log(`Unsubscribed from ${topic}`);
    }
    delete this.subscriptions[topic];
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.subscriptions = {};
      this.connectionPromise = null;
      this.resolveConnection = null;
      this.rejectConnection = null;
      console.log('Disconnected from WebSocket');
    }
  }
}

export const trackingService = new TrackingService();
