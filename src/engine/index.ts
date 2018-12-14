import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { getUserIdFromUrl } from './lib/user';
import User from './adapters/user';
import Room from './adapters/room';

import { HandlerFunc, RoomHandlerFunc } from './adapters/types/HandlerFunc';
import { DispatchedEvent } from './adapters/types/DispatchedEvent';

interface HandlerData {
  type: string;
  payload: any;
}

class GameSocket {
  connection: WebSocket.Server = null;
  roomList: Array<Room> = [];
  members: Array<User> = [];

  private addRoom(room: Room) {
    this.roomList.push(room);
  }

  private joinRoomHandler(message: HandlerData, user: User) {
    if (!message.payload) throw new Error('message dont have any payload');
    const { roomId } = message.payload;
    if (!roomId) throw new Error('roomId cannot be empty');
    user.addJoinedRoom(roomId);
    const roomIndex = this.roomList.findIndex(room => room.roomId === roomId);
    const isRoomAdded = roomIndex > -1;
    let currentRoom: Room;
    if (!isRoomAdded) {
      currentRoom = new Room(roomId);
      this.addRoom(currentRoom);
    } else {
      currentRoom = this.roomList[roomIndex];
    }
    currentRoom.addMember(user, message);

    console.log('member success join');
  }

  private leaveRoomHandler(message: HandlerData, user: User) {
    if (!message.payload) throw new Error('message dont have any payload');
    const { roomId } = message.payload;
    if (!roomId) throw new Error('roomId cannot be empty');
    user.removeJoinedRoom(roomId);
    const roomIndex = this.roomList.findIndex(room => room.roomId === roomId);
    const isRoomAdded = roomIndex > -1;
    if (!isRoomAdded) return;
    const currentRoom = this.roomList[roomIndex];
    currentRoom.removeMember(user.id, message);
  }

  private getRoomWithId(roomId: number): Room {
    return this.roomList.filter(room => room.roomId === roomId)[0];
  }

  private closeConnectionHandler(user: User) {
    user.joinedRoomsId.forEach(roomItemId => {
      const matchedRoom = this.getRoomWithId(roomItemId);
      matchedRoom.removeMember(user.id);
    });
  }

  constructor() {
    this.connection = new WebSocket.Server({
      port: 8001,
    });
    this.connection.on('connection', (currentConnection, request) => {
      const userId = getUserIdFromUrl(request.url);
      const user = new User(userId, currentConnection);
      this.addMember(user);
      this.setInitialHandler(user);
      user.setOnOpen(() => {
        console.log(`user ${user.id} reopen connection`);
        this.addMember(user);
        this.setInitialHandler(user);
      });
      user.setOnClose(() => {
        console.log(`${user.id} leave`, user.joinedRoomsId);
        user.joinedRoomsId.forEach(roomItemId =>
          this.closeConnectionHandler(user)
        );
        this.removeMember(user.id);
      });
    });
  }

  setInitialHandler(user: User) {
    user.addHandler('join', this.joinRoomHandler.bind(this));
    user.addHandler('leave', this.leaveRoomHandler.bind(this));
  }

  addMember(currentUser: User) {
    console.log('adding member', currentUser.id);
    const isAlreadyAdded: boolean =
      this.members.findIndex(user => user.id === currentUser.id) > -1;
    if (isAlreadyAdded) {
      console.log('member is already added');

      return;
    }
    this.members.push(currentUser);
  }

  removeMember(userId: number) {
    console.log('remove member', userId);
    this.members = this.members.filter(user => user.id !== userId);
  }

  removeMemberFromRoom(roomId: number, userId: number) {
    const roomIndex = this.roomList.findIndex(room => room.roomId === roomId);
    if (!(roomIndex > -1)) return;
    const currentRoom = this.roomList[roomIndex];
    currentRoom.removeMember(userId);
  }

  createRoom(roomId: number) {
    const roomIndex = this.roomList.findIndex(room => room.roomId === roomId);
    const isRoomIndex = roomIndex > -1;
    if (isRoomIndex) return;
    const room = new Room(roomId);
    this.roomList.push(room);
  }

  startRoom(roomId: number) {
    const selectedRoomIndex = this.roomList.findIndex(
      room => room.roomId === roomId
    );
    let currentRoom: Room;
    if (selectedRoomIndex === -1) {
      currentRoom = new Room(roomId);
      this.roomList.push(currentRoom);
    } else {
      currentRoom = this.roomList[selectedRoomIndex];
    }
    console.log('room starting');
    currentRoom.start();
  }

  addCustomRoomHandler(type: string, roomId: number, handler: RoomHandlerFunc) {
    const roomIndex = this.roomList.findIndex(room => room.roomId === roomId);
    const isRoomIndex = roomIndex > -1;
    if (!isRoomIndex) {
      throw new Error('Room with specified id not found');
    }
    const currentRoom: Room = this.roomList[roomIndex];
    currentRoom.addMessageHandler(type, handler);
  }

  removeCustomRoomHandler(
    type: string,
    roomId: number,
    handler: RoomHandlerFunc
  ) {
    const roomIndex = this.roomList.findIndex(room => room.roomId === roomId);
    const isRoomIndex = roomIndex > -1;
    if (!isRoomIndex) {
      throw new Error('Room with specified id not found');
    }
    const currentRoom: Room = this.roomList[roomIndex];
    currentRoom.removeMessageHandler(type, handler);
  }

  addRoomEventListener(
    eventType: string,
    roomId: number,
    eventHandler: DispatchedEvent
  ) {
    const roomIndex = this.roomList.findIndex(room => room.roomId === roomId);
    const isRoomIndex = roomIndex > -1;
    if (!isRoomIndex) {
      throw new Error('Room with specified id not found');
    }
    const currentRoom: Room = this.roomList[roomIndex];
    currentRoom.addListener(eventType, eventHandler);
  }

  removeRoomEventListener(
    eventType: string,
    roomId: number,
    eventHandler: DispatchedEvent
  ) {
    const roomIndex = this.roomList.findIndex(room => room.roomId === roomId);
    const isRoomIndex = roomIndex > -1;
    if (!isRoomIndex) {
      throw new Error('Room with specified id not found');
    }
    const currentRoom: Room = this.roomList[roomIndex];
    currentRoom.removeListener(eventType, eventHandler);
  }

  removeAllRoomEventListenerWithType(eventType: string, roomId: number) {
    const roomIndex = this.roomList.findIndex(room => room.roomId === roomId);
    const isRoomIndex = roomIndex > -1;
    if (!isRoomIndex) {
      throw new Error('Room with specified id not found');
    }
    const currentRoom: Room = this.roomList[roomIndex];
    currentRoom.removeAllListenerWithType(eventType);
  }
}

export default GameSocket;
