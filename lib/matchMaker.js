var geoip = require('geoip-lite');


class MatchMaker {


    requestMatch(request) {


        var ip = request.ip;// "207.97.227.239";
        var geo = geoip.lookup(ip);
        console.log(geo);
    }
}


module.exports = MatchMaker;