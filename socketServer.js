const WebSocket = require('ws');

class WebSocketServer {
  connection = null;

  constructor() {
    this.connection = new WebSocket.Server({
      port: 8001,
    });
  }
}

module.exports = WebSocketServer;
