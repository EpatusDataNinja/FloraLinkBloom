const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor() {
    this.clients = new Map(); // Map to store client connections
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server });
    
    this.wss.on('connection', async (ws, req) => {
      try {
        // Authenticate connection
        const token = req.headers['sec-websocket-protocol'];
        if (!token) {
          ws.close(4001, 'Authentication required');
          return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Store client connection
        this.clients.set(userId, ws);

        // Setup ping/pong
        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });

        ws.on('close', () => {
          this.clients.delete(userId);
        });

      } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.close(4002, 'Connection error');
      }
    });

    // Heartbeat check
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  broadcastUpdate(type, data) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, data }));
      }
    });
  }

  sendToUser(userId, type, data) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, data }));
    }
  }
}

module.exports = new WebSocketService(); 