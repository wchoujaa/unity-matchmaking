const express = require('express');
const lib = require('./lib/util/util');
const MatchMaker = require('./lib/matchMaker')


const app = express();
const port = 8000;

const mm = new MatchMaker();

mm.run();

function resHandler(res, json) {
  if (json.error) {
    res.status(400).send(json);
  } else {
    res.json(json);
  }

}

app.set('trust proxy', true);


app.get('/register/', (req, res) => {
  var ip = req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    null;

  var json = mm.registerPlayer(ip);
  resHandler(res, json); 
})


// register in the matchmaking system
app.get('/matchmaking/match/:playerID', (req, res) => {
  var playerID = req.params.playerID; 
  var json = mm.requestMatch(playerID);
  resHandler(res, json); 
});

// get the lobby ID
app.get('/matchmaking/lobby/:playerID', (req, res) => {
  var playerID = req.params.playerID;
  var json = mm.requestLobbyID(playerID);
  resHandler(res, json);
});

 
app.use('/graph', express.static('view/graph'));

app.listen(port, () => {
  console.log(`Server running on port ${port}!`)
});

 





