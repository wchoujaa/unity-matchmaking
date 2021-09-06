const express = require('express')
const app = express();
const port = 8000; 
app.get('/ip', (req, res) => {
  var geoip = require('geoip-lite');

  var ip = "207.97.227.239";
  //var geo = geoip.lookup(ip); 
  //console.log(geo); 

});

app.use('/graph', express.static('view/graph'));


 

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});

