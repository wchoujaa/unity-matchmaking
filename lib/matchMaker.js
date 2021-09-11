var geoip = require('geoip-lite');
var util = require('./util/util');


const timer = ms => new Promise(res => setTimeout(res, ms))


class Player {

    constructor(coord) {
        this.id = util.uuidv4();
        this.coord = coord;
        this.lobbyId = null;
        this.ticket = null;
    }

}


class MatchMaker {
    playerDict = {};
    playerList = [];
    lobbySize = 1;


    registerPlayer(ip) {
        var player = null;
        try {
            var coord = this.getCoord(ip);
            var player = new Player(coord);
            // register Player
            this.playerDict[player.id] = player;
        } catch (error) {
            console.log(error);
        }
        return player;
    }

    requestMatch(playerID) {

        var player = this.playerDict[playerID];
        var lobbyId = null;
        if (player.ticket) {
            if (player.lobbyId) {
                lobbyId = player.lobbyId;
            }
        }
        // if no ticket get one and put the player in the queue 
        else {
            var ticket = this.getTicket(playerID);
            player.ticket = ticket;
            this.playerList.push(player);
        }
        // return the lobby ID if there is one
        return lobbyId;
    }

    getTicket(playerID) {
        return `ticket-${playerID}`;
    }


    getCoord(ip) {
        var geo = geoip.lookup(ip);
        var coord = null;
        if (geo) {
            var lat = geo.ll[0];
            var lng = geo.ll[1];
            coord = util.latLonToOffsets(lat, lng, 1000, 500);
        } else {
            throw `IP not found ${ip}`
        }
        return coord

    }

    findMatches(playerList) {
        var positions = playerList.map(function (player) {
            return [player.coord.x, player.coord.y];
        });

        var k = Math.trunc(playerList.length / this.lobbySize);
        var centroids = util.kMeans(positions, k);
        var matches = [];
        for (let i = 0; i < playerList.length; i++) {
            const player = playerList[i];
            const center = centroids[i];

            matches.push({ playerID: player.id, lobbyId: center })
        }

        return matches;
    }

    async run(tickRate) { // We need to wrap the loop into an async function for this to work
        var counter = 0;
        var str;
        while (true) {
            counter += 1;

            if (this.playerList.length >= this.lobbySize) {
                var matches = this.findMatches(this.playerList);
                this.updatePlayerList(matches);
            }
            await timer(tickRate);

        }


    }

    updatePlayerList(matches) {
        var playerDict = this.playerDict;
        matches.forEach(function (match) {
            var player = playerDict[match.playerID];
            player.lobbyId = match.lobbyId;
        })
    }

    getPlayer(playerID) {
        return this.playerDict[playerID];
    }
}

module.exports = MatchMaker;