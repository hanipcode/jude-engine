import fetch, { Response } from 'node-fetch';

import { RoomDetailResponse } from './types/RoomDetailResponse';
import { BetResponse } from './types/BetResponse';
import { EndGameResponse } from './types/EndGameResponse';

const BASE_URL = 'https://trivia.shweapi.com/api/game';

function responseBuilder(response: Response) {
  try {
    return response.json();
  } catch (error) {
    response.text().then(text => console.log(text));
    throw new Error('Response is not a json type');
  }
}

export function getRoomDetailApi(roomId: number): Promise<RoomDetailResponse> {
  return fetch(`${BASE_URL}/room/${roomId}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }).then(response => responseBuilder(response));
}

export function betApi(
  userId: number,
  roomId: number,
  shioId: number,
  ammount: number
): Promise<BetResponse> {
  return fetch(`${BASE_URL}/stake`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      id_users: userId,
      id_rooms: roomId,
      id_shios: shioId,
      coin_games: ammount,
    }),
  }).then(response => responseBuilder(response));
}

export function endGameApi(roomId: number): Promise<EndGameResponse> {
  return fetch(`${BASE_URL}/end`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      id_rooms: roomId,
    }),
  }).then(response => responseBuilder(response));
}
