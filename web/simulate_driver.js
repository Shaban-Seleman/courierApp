import { Client } from '@stomp/stompjs';
import { WebSocket } from 'ws';

Object.assign(global, { WebSocket });

const TOKEN = 'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJkcml2ZXIxQGNvdXJpZXIuY29tIiwidXNlcklkIjoiMDMyMGZjNGQtNzRkZC00MDU4LTk5MjAtMDNmZTA2NjEwZDNkIiwicm9sZSI6IkRSSVZFUiIsImZ1bGxOYW1lIjoiU2ltdWxhdGVkIERyaXZlciIsImlhdCI6MTc2OTI0NTYwOCwiZXhwIjoxNzY5MzMyMDA4fQ.7PhSnKEs-2Ncydp5O9gfxrP-cjOXesBB4n_l1odNCg2Lu4hsTBhfS9Da8N5K3D13';
const DRIVER_ID = '0320fc4d-74dd-4058-9920-03fe06610d3d';

const client = new Client({
    brokerURL: 'ws://localhost:8080/ws-tracking/websocket',
    connectHeaders: {
        Authorization: `Bearer ${TOKEN}`,
    },
    debug: function (str) {
        console.log(str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
});

client.onConnect = function (frame) {
    console.log('Connected: ' + frame);

    let lat = 40.7128;
    let lng = -74.0060;
    let angle = 0;
    const radius = 0.01; // approx 1km

    setInterval(() => {
        angle += 0.1;
        const newLat = lat + radius * Math.cos(angle);
        const newLng = lng + radius * Math.sin(angle);

        const locationUpdate = {
            driverId: DRIVER_ID,
            latitude: newLat,
            longitude: newLng,
            status: 'ONLINE',
            orderId: null // Idle
        };

        console.log(`Sending update: ${newLat.toFixed(4)}, ${newLng.toFixed(4)}`);

        client.publish({
            destination: '/app/update',
            body: JSON.stringify(locationUpdate),
        });
    }, 2000);
};

client.onStompError = function (frame) {
    console.log('Broker reported error: ' + frame.headers['message']);
    console.log('Additional details: ' + frame.body);
};

client.activate();
