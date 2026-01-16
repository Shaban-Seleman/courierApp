import { Client } from '@stomp/stompjs';

class TrackingService {
  client: Client | null = null;

  connect(onMessage: (message: any) => void) {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws/websocket', // Use correct WS protocol
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('Connected to WebSocket');
      
      // Subscribe to Global Map Updates (Admin)
      this.client?.subscribe('/topic/admin/map', (message) => {
        if (message.body) {
          onMessage(JSON.parse(message.body));
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }
}

export const trackingService = new TrackingService();
