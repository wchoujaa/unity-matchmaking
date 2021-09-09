const fs = require('fs');
const util = require('./util/util');
var data;

try {
    data = fs.readFileSync('./data/position.json', 'utf8')
} catch (err) {
    console.error("error reading the file : ", err);
}

var json = JSON.parse(data);


positions = [];

json.forEach(position => {
    var { x, y } = position;
    positions.push([x, y]);
});


var centroids = util.kMeans(positions, 3);

console.log(centroids);