import * as WebSocket from 'ws';
import { HandlerFunc } from './types/HandlerFunc';

interface User {
  id: number;
  connection: WebSocket;
  sendMessage(message: any);
  sendError(message: any);
  addHandler(type: string, handler: Function);
}

class User implements User {
  id: number;
  connection: WebSocket;

  constructor(userId: number, connection: WebSocket) {
    this.id = userId;
    this.connection = connection;
  }

  sendMessage(message: any) {
    this.connection.send(JSON.stringify(message));
  }

  sendError(message: any) {
    this.sendMessage({
      error: true,
      message,
    });
  }

  addHandler(type: string, handler: HandlerFunc) {
    this.connection.on('message', (message: string) => {
      let data: any;
      try {
        data = JSON.parse(message);
      } catch (error) {
        this.sendError(error.message);
        return;
      }
      console.log(data);
      if (!handler || typeof handler !== 'function') {
        this.sendError('Handler should be a function');
        return;
      }
      if (data.type === type) {
        const user: User = this;
        try {
          handler(data, user);
        } catch (error) {
          this.sendError(error.message);
        }
      }
    });
  }
}

export default User;
