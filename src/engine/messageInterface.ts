import User from './adapters/user';

export enum MessageType {
  join = 'join',
  joined = 'joined',
  leave = 'leave',
  leaved = 'leaved',
  bet = 'bet',
  restart = 'restart',
  chat = 'chat',
  broadcast = 'broadcast',
  gameStart = 'game_start',
  gameEnd = 'game_end',
  gameEndAgent = 'game_end_agent',
  gameSessionFinish = 'game_session_finish',
  clock = 'clock',
}

export interface JoinPayload {
  roomId: number;
  phoneNumber: string;
}

export interface GameSessionFinshPayload {
  roomId: number;
}

export interface RestartPayload {
  roomId: number;
}

export interface BetPayload {
  userId: number;
  roomId: number;
  shioId: number;
  coin: number;
  phoneNumber: string;
}

interface ChatPayload {
  userId: number;
  roomId: number;
  message: string;
  phoneNumber: string;
}

interface BroadcastPayload {
  message: string;
}
interface ClockPayload {
  second: number;
}

interface GameStartPayload {
  turn: number;
}

interface GameEndPayload {
  winner: string;
}
type MessageTypeInterface =
  | MessageType.join
  | MessageType.joined
  | MessageType.bet
  | MessageType.broadcast
  | MessageType.gameStart
  | MessageType.gameEnd
  | MessageType.chat;

type MessagePayloadInterface =
  | JoinPayload
  | BetPayload
  | ChatPayload
  | BroadcastPayload
  | GameStartPayload
  | GameEndPayload;

export interface MessageData {
  type: MessageTypeInterface;

  payload: any;
}
