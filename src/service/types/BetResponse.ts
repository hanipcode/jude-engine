export interface BetResponse {
  message: string;
  success: Success;
}
interface Success {
  id_rooms: string;
  sessions_id: number;
  users_id: string;
  phone: string;
  datetime_games: string;
  coin_games: number;
}
