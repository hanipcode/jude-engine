export interface RoomDetailResponse {
  message: string;
  success: Success;
}
interface Success {
  id_rooms: number;
  users_id: number;
  room_categories_id: number;
  name_rooms: string;
  rtp_rooms: number;
  max_members_rooms: number;
  game_time_rooms: number;
  turn_rooms: string;
  credit_rooms: number;
}
