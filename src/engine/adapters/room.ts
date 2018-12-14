import User from './user';
import { HandlerFunc, RoomHandlerFunc } from './types/HandlerFunc';
import { DispatchedEvent } from './types/DispatchedEvent';

interface HandlerData {
  type: string;
  payload: any;
}

interface HandlerList {
  [index: number]: any;
  0: string;
  1: Function;
}

export default class Room {
  roomId: number = null;
  members: Array<User> = [];
  started: boolean = false;
  events: Array<HandlerList> = [];
  messageHandler: Array<HandlerList> = [];
  turn: number = 0;

  constructor(roomId) {
    this.roomId = roomId;
    this.messagePacketTypeHandler = this.messagePacketTypeHandler.bind(this);
  }

  private initStart() {
    this.started = true;
    this.turn = 1;
    this.dispatchEvent('start');
  }

  private initStop() {
    this.started = false;
    this.turn;
    this.dispatchEvent('stop');
  }

  addMessageHandler(type: string, handler: RoomHandlerFunc) {
    this.messageHandler.push([type, handler]);
  }

  removeMessageHandler(type: string, handler: RoomHandlerFunc) {
    const filteredMessageHandler = this.messageHandler.filter(
      handlerItem => handlerItem[0] !== type && handlerItem[1] !== handler
    );
    console.log(
      'removing message handler',
      this.messageHandler,
      'to',
      filteredMessageHandler
    );
    this.messageHandler = filteredMessageHandler;
  }

  messagePacketTypeHandler(message: string) {
    let data: any;
    try {
      data = JSON.parse(message);
      const room: Room = this;
      const matchedHandlers: Array<HandlerList> = this.messageHandler.filter(
        handlerItem => handlerItem[0] === data.type
      );
      this.messageHandler.forEach(handler => console.log(handler[0]));
      console.log(matchedHandlers.length, 'nyoh', matchedHandlers);
      matchedHandlers.forEach(handler => handler[1](data, room));
    } catch (error) {
      console.log(error);
      return;
    }
  }

  initHandlerForUser(user: User, packetType: string) {
    user.connection.on(packetType, this.messagePacketTypeHandler);
  }

  removeHandlerForUser(user: User, packetType: string) {
    user.connection.off(packetType, this.messagePacketTypeHandler);
  }

  addListener(eventType: string, callbackFunction: DispatchedEvent) {
    this.events.push([eventType, callbackFunction]);
  }

  removeListener(eventType: string, callbackFunction: DispatchedEvent) {
    const filteredEvents = this.events.filter(
      eventItem =>
        !(eventItem[0] === eventType && eventItem[1] === callbackFunction)
    );
    console.log(this.events, filteredEvents);
    this.events = filteredEvents;
  }

  removeAllListenerWithType(eventType: string) {
    const filteredEvents = this.events.filter(
      eventItem => eventItem[0] !== eventType
    );
    this.events = filteredEvents;
  }

  dispatchEvent(eventType: string, data?: any) {
    const matchedEvent = this.events.filter(event => event[0] === eventType);
    const room: Room = this;
    matchedEvent.forEach(event => event[1](eventType, room, data));
  }

  addMember(newUser: User, message?: HandlerData) {
    const memberIndex = this.members.findIndex(user => user.id === newUser.id);
    const isAlreadyAdded = memberIndex > -1;
    // should have thrown error ?
    if (isAlreadyAdded) {
      this.members[memberIndex].sendError('You Already joined the room');
      return;
    }
    this.initHandlerForUser(newUser, 'message');
    this.members.push(newUser);
    if (message) {
      this.broadcastMessage({
        type: 'joined',
        payload: {
          userId: newUser.id,
          message: `${newUser.id} joined the room`,
          ...message.payload,
        },
      });
    }
  }

  removeMember(userId: number, message: any = {}) {
    const memberIndex = this.members.findIndex(user => user.id === userId);
    const isAlreadyAdded = memberIndex > -1;
    // should have thrown error ?
    if (!isAlreadyAdded) return;
    const currentMember = this.members[memberIndex];
    this.removeHandlerForUser(currentMember, 'message');
    this.members = this.members.filter(member => member.id !== userId);
    if (message) {
      this.broadcastMessage({
        type: 'leaved',
        payload: {
          userId: userId,
          message: `${userId} leave the room`,
          ...message.payload,
        },
      });
    }
  }

  getMemberByUserId(userId: number): User {
    const memberIndex = this.members.findIndex(user => user.id === userId);
    const isAlreadyAdded = memberIndex > -1;
    // should have thrown error ?
    if (!isAlreadyAdded) return;
    const currentMember = this.members[memberIndex];
    return currentMember;
  }

  broadcastMessage(data: any) {
    this.members.forEach(user => {
      user.sendMessage(data);
    });
  }

  start() {
    this.initStart();
  }

  stopRoom() {
    this.initStop();
  }

  increaseTurn() {
    this.turn = this.turn + 1;
  }
}
