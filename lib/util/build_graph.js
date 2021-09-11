const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const fs = require('fs');

data_dict = {};

var rad = function (x) {
    return x * Math.PI / 180;
};

var getDistance = function (p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.lat - p1.lat);
    var dLong = rad(p2.lng - p1.lng);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
};


var p1 = { lat: 66.0, lng: 33.0 }
var p2 = { lat: -170.7075, lng: -14.295833 }

var dist = getDistance(p1, p2);

console.log(dist);
var graph = [];

function outputGraph() {
    const csvWriter = createCsvWriter({
        path: 'data/graph.csv',
        header: [
            { id: 'A', title: 'A' },
            { id: 'B', title: 'B' },
            { id: 'dist', title: 'distance' },
        ]
    });

    csvWriter
        .writeRecords(graph)
        .then(() => console.log('The CSV file was written successfully'));
}


function process_neighbours() {
    fs.createReadStream('data/raw/query.tsv')
        .pipe(csv({ separator: '\t' }))
        .on('data', (row) => {
            //console.log(row);
            var p1 = data_dict[row.countryCode];
            var p2 = data_dict[row.neighbourCode];

            if (p1 && p2) {
                var dist = getDistance(p1, p2);
                row.dist = dist;
                var obj = { A: row.countryCode, B: row.neighbourCode, dist: dist }
                graph.push(obj);
            } else {
                console.log(row.neighbourLabel);
            }

        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            outputGraph();
            //console.log(graph);
        });
}


fs.createReadStream('data/countries.csv')
    .pipe(csv())
    .on('data', (row) => {

        data_dict[row.countryCode] = row

    })
    .on('end', () => {
        console.log('CSV file successfully processed');
        //console.log(data_dict);
        process_neighbours();
    });