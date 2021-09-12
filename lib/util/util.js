function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

function latLonToOffsets(latitude, longitude, width, height) {
    const FE = 180; // false easting
    const FN = 0; // false north
    const radius = width / (2 * Math.PI);

    const latRad = degreesToRadians(latitude) + FN;
    const lonRad = degreesToRadians(longitude + FE);

    const x = lonRad * radius;

    const yFromEquator = radius * Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = height / 2 - yFromEquator;

    return { x, y };
}

const kMeans = (data, k = 1) => {

    const centroids = data.slice(0, k);
    const distances = Array.from({ length: data.length }, () =>
        Array.from({ length: k }, () => 0)
    );
    const classes = Array.from({ length: data.length }, () => -1);

    let itr = true;

    while (itr) {
        itr = false;

        for (let d in data) {
            for (let c = 0; c < k; c++) {
                distances[d][c] = Math.hypot(
                    ...Object.keys(data[0]).map(key => data[d][key] - centroids[c][key])
                );
            }
            const m = distances[d].indexOf(Math.min(...distances[d]));
            if (classes[d] !== m) itr = true;
            classes[d] = m;
        }

        for (let c = 0; c < k; c++) {
            centroids[c] = Array.from({ length: data[0].length }, () => 0);
            const size = data.reduce((acc, _, d) => {
                if (classes[d] === c) {
                    acc++;
                    for (let i in data[0]) centroids[c][i] += data[d][i];
                }
                return acc;
            }, 0);
            for (let i in data[0]) {
                centroids[c][i] = parseFloat(Number(centroids[c][i] / size).toFixed(2));
            }
        }
    }

    return classes;



};

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}



function gen4digit() {
    return "lobby-" + Math.floor(1000 + Math.random() * 9000);
}

module.exports.latLonToOffsets = latLonToOffsets;
module.exports.kMeans = kMeans;
module.exports.uuidv4 = uuidv4;
module.exports.gen4digit = gen4digit;

