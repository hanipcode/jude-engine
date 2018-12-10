// TODO: This is an example only, will later be moved under example folder

import * as express from 'express';
import * as bodyParser from 'body-parser';
import GameSocket from './engine';

const app: express.Application = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const game: GameSocket = new GameSocket();

app.post('/room/start', function(req: express.Request, res: express.Response) {
  const { roomId } = req.body;
  if (!roomId) {
    return res.status(404).send({
      error: true,
      message: 'room not found',
    });
  }
  try {
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

app.get('/end', function(req, res) {
  return res.send({
    message: 'server ended',
  });
});

app.listen(8000, () => {
  console.log('server started on port 8000');
});
