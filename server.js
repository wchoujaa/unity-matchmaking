const express = require('express');
const lib = require('./lib/util/util');
const MatchMaker = require('./lib/matchMaker')
const app = express();
const port = 8000;

const mm = new MatchMaker();

app.set('trust proxy', true);

app.get('/matchmaking', (req, res) => {
  var matchId = mm.requestMatch(req);
});

app.get('/', (req, res) => {
  console.log("online");
});

app.use('/graph', express.static('view/graph'));
app.use('/kmeans', express.static('view/kmeans'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});



