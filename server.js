const express = require('express');
const lib = require('./lib/util/util');
const MatchMaker = require('./lib/matchMaker')
const app = express();
const port = 8000;

const mm = new MatchMaker();

mm.run(500);

app.set('trust proxy', true);


app.get('/register/', (req, res) => {
  var ip = req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    null;
  var player = mm.registerPlayer(ip);
 
  if (player) {
    res.json({ playerID: player.playerID })
  } else {
    res.status(400).send({
      message: 'IP not found!'
    });
  }
})

app.get('/matchmaking/:playerID', (req, res) => {
  var playerID = req.params.playerID;
  var player = mm.getPlayer(playerID);
  if (player) {
    var lobbyID = mm.requestMatch(req.params.playerID);
    if (lobbyID) {
      res.json({ lobbyID: lobbyID });
    } else {
      res.status(400).send({
        message: 'No lobby found'
      });
    }
  } else {
    res.status(400).send({
      message: 'Player not registered'
    });
  }
});

app.get('/', (req, res) => {
  console.log("online");
});

app.use('/graph', express.static('view/graph'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});






