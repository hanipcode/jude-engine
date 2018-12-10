import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { getUserIdFromUrl } from './lib/user';
import User from './adapters/user';
import Room from './adapters/room';

import { HandlerFunc } from './adapters/types/HandlerFunc';

interface JoinData {
  userId: number;
  roomId: number;
}

interface MessageData {
  userId: number;
  roomId: number;
  message: string;
}

interface ParsedMessage {
  type: 'join' | 'message';
  data: JoinData | MessageData;
}

interface HandlerData {
  type: string;
  payload: any;
}

interface GameSocket {
  connection: WebSocket.Server;
  roomList: Array<Room>;
  members: Array<User>;
  startRoom(roomId: number);
  addCustomHandler(eventType: string, handler: HandlerFunc);
}

class GameSocket implements GameSocket {
  connection: WebSocket.Server = null;
  roomList: Array<Room> = [];
  members: Array<User> = [];

  private addMember(connection: WebSocket, currentUser: User) {
    const isAlreadyAdded: boolean =
      this.members.findIndex(user => user.id === currentUser.id) > -1;
    if (isAlreadyAdded) return;
    this.members.push(currentUser);
  }

  private addRoom(room: Room) {
    this.roomList.push(room);
  }

  private joinRoomHandler(message: HandlerData, user: User) {
    if (!message.payload) throw new Error('message dont have any payload');
    const { roomId } = message.payload;
    if (!roomId) throw new Error('roomId cannot be empty');
    const roomIndex = this.roomList.findIndex(room => room.roomId === roomId);
    const isRoomAdded = roomIndex > -1;
    let currentRoom: Room;
    if (!isRoomAdded) {
      currentRoom = new Room(roomId);
      this.addRoom(currentRoom);
    } else {
      currentRoom = this.roomList[roomIndex];
    }
    console.log(this.roomList);
    currentRoom.addMember(user);
    console.log('member success join', currentRoom.members);
  }

  constructor() {
    this.connection = new WebSocket.Server({
      port: 8001,
    });
    this.connection.on('connection', (currentConnection, request) => {
      const userId = getUserIdFromUrl(request.url);
      const user = new User(userId, currentConnection);
      this.addMember(currentConnection, user);
      user.addHandler('join', this.joinRoomHandler.bind(this));
    });
  }

  startRoom(roomId: number) {
    const selectedRoomIndex = this.roomList.findIndex(
      room => room.roomId === roomId
    );
    if (selectedRoomIndex === -1) {
      throw new Error('Room is not registered !');
    }
    console.log(this.roomList[selectedRoomIndex]);
    this.roomList[selectedRoomIndex].start();
  }
}

export default GameSocket;
