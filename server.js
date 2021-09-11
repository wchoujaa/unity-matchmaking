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
  mm.registerPlayer(ip, res);

})


// register in the matchmaking system
app.get('/matchmaking/match/:playerID', (req, res) => {
  var playerID = req.params.playerID;
  mm.requestMatch(playerID, res);
});

// get the lobby ID
app.get('/matchmaking/lobby/:playerID', (req, res) => {
  var playerID = req.params.playerID;
  mm.requestLobbyID(playerID, res);

});


app.get('/', (req, res) => {
  console.log("online");
});

app.use('/graph', express.static('view/graph'));

var exportApp = app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});


module.exports.server = exportApp;





