// TODO: This is an example only, will later be moved under example folder

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import fetch from 'node-fetch';
import GameSocket from './engine';
import Room from './engine/adapters/room';
import User from './engine/adapters/user';
import { DispatchedEvent } from './engine/adapters/types/DispatchedEvent';
import { buildMessage } from './engine/lib/packet';
import { convertMinuteToMs } from './helpers/timeConvert';
import { getShioName } from './helpers/shioName';
import { getRoomDetailApi, endGameApi, betApi } from './service/api';
import {
  BetPayload,
  MessageType,
  MessageData,
} from './engine/messageInterface';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const game: GameSocket = new GameSocket(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let gameInterval: NodeJS.Timer;

// function roomForceStopHandler(eventType: string, room: Room) {
//   endGameApi(room.roomId)
// }
function roomEndHandler(eventType: string, room: Room) {
  let clock = 6000;
  clearInterval(gameInterval);
  let endInterval = setInterval(() => {
    if (clock === 0) {
      endGameApi(room.roomId).then(endGameResponse => {
        room.broadcastMessage({
          type: MessageType.gameEnd,
          payload: {
            winner: endGameResponse.winner,
          },
        });
      });
      clearInterval(endInterval);
      return;
    }
    if (clock === 6000) {
      room.broadcastMessage({
        type: MessageType.broadcast,
        payload: {
          message: 'Agent end the game, game will end soon',
        },
      });
    } else {
      room.broadcastMessage({
        type: MessageType.broadcast,
        payload: {
          message: `Game will end on ${clock / 1000} second`,
        },
      });
    }
    clock = clock - 1000;
  }, 1000);
}
function roomStartHandler(
  eventType: string,
  room: Room,
  gameTime: number,
  isAutoStart: boolean = false
) {
  game.addCustomRoomHandler(MessageType.bet, room.roomId, betHandler);
  room.broadcastMessage({
    type: MessageType.gameStart,
    payload: {
      turn: room.turn,
    },
  });

  let clock = gameTime;
  gameInterval = setInterval(() => {
    if (clock === 0) {
      endGameApi(room.roomId)
        .then(endGameResponse => {
          room.broadcastMessage({
            type: MessageType.gameEnd,
            payload: {
              winner: endGameResponse.winner,
            },
          });
          if (isAutoStart) {
            let willStartClock = 6000;
            let willStartInterval = setInterval(() => {
              if (willStartClock === 0) {
                room.increaseTurn();
                roomStartHandler(eventType, room, gameTime, isAutoStart);
                return;
              }
              if (willStartClock === 6000) {
                room.broadcastMessage({
                  type: MessageType.restart,
                  payload: {
                    roomId: room.roomId,
                  },
                });
                room.broadcastMessage({
                  type: MessageType.broadcast,
                  payload: {
                    message: 'The game will be restarted soon',
                  },
                });
              } else {
                room.broadcastMessage({
                  type: MessageType.broadcast,
                  payload: {
                    message: `The game will restart on ${willStartClock /
                      1000} second`,
                  },
                });
              }
            }, 1000);
          } else {
            room.removeListener('start', roomStartHandler);
          }
        })
        .catch(error => {
          console.log(`error in room ${error}`);
          if (isAutoStart) {
            room.increaseTurn();
            roomStartHandler(eventType, room, gameTime);
          } else {
            room.removeListener('start', roomStartHandler);
          }
        });
      // const endGameResponse = await endGameApi(room.roomId);
      clearInterval(gameInterval);
      game.removeCustomRoomHandler(MessageType.bet, room.roomId, betHandler);

      return;
    }
    if (clock <= 5000) {
      room.broadcastMessage({
        type: MessageType.broadcast,
        payload: {
          message: `game will end in ${clock / 1000} second`,
        },
      });
    }
    clock = clock - 1000;
  }, 1000);
}

async function betHandler(data: MessageData, room: Room) {
  console.log(data);
  if (!data.payload.userId) return;
  const currentUser = room.getMemberByUserId(data.payload.userId);
  if (!data.payload.phoneNumber || !data.payload.coin || !data.payload.shioId) {
    currentUser.sendError(
      'InvalidData: phoneNumber, coin, and shioId cannot be empty'
    );
    return;
  }
  const { userId, phoneNumber, coin, shioId } = data.payload;
  const betResponse = await betApi(userId, room.roomId, shioId, coin);
  currentUser.sendMessage(betResponse);

  room.broadcastMessage({
    type: MessageType.broadcast,
    message: `${data.payload.phoneNumber} bet ${
      data.payload.coin
    } on ${getShioName(data.payload.shioId)}`,
  });
}

app.post('/room/start', async function(
  req: express.Request,
  res: express.Response
) {
  const { roomId } = req.body;
  const roomDetail = await getRoomDetailApi(roomId);
  console.log(roomDetail);
  if (!roomId || !roomDetail.success) {
    return res.status(404).send({
      error: true,
      message: 'room not found',
    });
  }
  const isAutoStart = roomDetail.success.turn_rooms === 'auto';
  try {
    const gameTime = convertMinuteToMs(roomDetail.success.game_time_rooms);
    clearTimeout(gameInterval);
    game.createRoom(roomId);
    game.removeAllRoomEventListenerWithType('start', roomId);
    game.addRoomEventListener('start', roomId, (eventType, room) =>
      roomStartHandler(eventType, room, gameTime, isAutoStart)
    );
    game.addRoomEventListener('stop', roomId, (eventType, room) =>
      roomEndHandler(eventType, room)
    );

    game.startRoom(roomId);
    return res.send({
      message: `${roomId} started`,
    });
  } catch (error) {
    return res.send({
      error: true,
      message: error.message,
    });
  }
});

app.post('/room/end', async function(req, res) {
  const { roomId } = req.body;
  const roomDetail = await getRoomDetailApi(roomId);
  console.log(roomDetail);
  if (!roomId || !roomDetail.success) {
    return res.status(404).send({
      error: true,
      message: 'room not found',
    });
  }
  try {
    game.stopRoom(roomId);
    return res.send({
      message: 'room ended',
    });
  } catch (error) {
    return res.send({
      error: true,
      message: error.message,
    });
  }
});

server.listen(8000, () => {
  console.log('server started on port 8000');
});
