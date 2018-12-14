import Room from '../room';
export interface DispatchedEvent {
  (eventType: string, room: Room, data?: any);
}
