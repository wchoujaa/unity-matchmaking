const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const fs = require('fs');


data_dict = {};

function WriteCsv(list) {
    const csvWriter = createCsvWriter({
        path: 'data/countries.csv',
        header: [
            { id: 'countryLabel', title: 'countryLabel' },
            { id: 'countryCode', title: 'countryCode' },
            { id: 'lng', title: 'lng' },
            { id: 'lat', title: 'lat' },
        ]
    });

    const data = data_ls;

    csvWriter
        .writeRecords(data)
        .then(() => console.log('The CSV file was written successfully'));
}

var not_found = [];

function MatchWithGeolite() {
    fs.createReadStream('data/raw/GeoLite2-Country-Locations-en.csv')
        .pipe(csv())
        .on('data', (row) => {
            if (!(row.country_iso_code in data_dict)) {
                console.log(row);
                not_found.push(row);
            }
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            console.log(not_found.length);
        });
}



function parseWikiData() {
    fs.createReadStream('data/raw/query_country.tsv')
        .pipe(csv({ separator: '\t' }))
        .on('data', (row) => {
            //console.log(row);
            split = row.coord.split(" ");
            row.lng = split[0];
            row.lat = split[1];
            delete row.coord;
            data_dict[row.countryCode] = row
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            MatchWithGeolite();
        });
} 

parseWikiData();