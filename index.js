const express = require('express');
const app = express();
const WebSocketServer = require('./socketServer');

app.get('/start', function(req, res) {
  return res.send({
    message: 'ok',
  });
});

app.get('/end', function(req, res) {
  return res.send({
    message: 'server ended',
  });
});

app.listen(8000, () => {
  console.log('server started on port 8000');
});
