import User from '../user';
import Room from '../room';

export interface HandlerFunc {
  (data: any, user: User);
}

export interface RoomHandlerFunc {
  (data: any, room: Room);
}
