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
  joinedRoomsId: Array<number> = [];
  isAlive: boolean;
  connection: WebSocket;
  pingInterval: NodeJS.Timer;

  constructor(userId: number, connection: WebSocket) {
    this.id = userId;
    this.connection = connection;
    this.isAlive = true;

    this.connection.on('pong', () => {
      this.heartBeat();
    });
    this.pingInterval = setInterval(() => {
      if (this.isAlive === false) {
        clearInterval(this.pingInterval);
        return this.connection.terminate();
      }

      this.isAlive = false;
      this.connection.ping(() => false);
    }, 10000);
  }

  heartBeat() {
    this.isAlive = true;
  }

  addJoinedRoom(roomId: number) {
    this.joinedRoomsId.push(roomId);
  }

  removeJoinedRoom(roomId: number) {
    this.joinedRoomsId = this.joinedRoomsId.filter(
      roomIdItem => roomIdItem !== roomId
    );
  }

  setOnOpen(fn: Function) {
    this.connection.onopen = event => {
      this.heartBeat();
      fn.call(fn, event);
    };
  }

  removeOnOpen(fn: Function) {
    this.connection.onopen = () => false;
  }

  setOnClose(fn: Function) {
    this.connection.onclose = event => {
      this.isAlive = false;
      fn.call(fn, event);
    };
  }

  removeOnCLose() {
    this.connection.onclose = () => false;
  }

  sendMessage(message: any) {
    if (this.connection.readyState === this.connection.OPEN) {
      this.connection.send(JSON.stringify(message));
    }
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
          return;
        }
      }
    });
  }
}

export default User;
