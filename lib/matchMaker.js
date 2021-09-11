var geoip = require('geoip-lite');
var util = require('./util/util');


const timer = ms => new Promise(res => setTimeout(res, ms))


class Player {

    constructor(coord) {
        this.playerID = util.uuidv4();
        this.coord = coord;
        this.lobbyId = null;
        this.ticket = null;
    }

}


class MatchMaker {
    playerDict = {};
    playerQueue = [];
    lobbySize = 1;


    registerPlayer(ip, res) {
        var player = null;
        try {
            var coord = this.getCoord(ip);
            var player = new Player(coord);
            // register Player
            this.playerDict[player.playerID] = player;
        } catch (error) {
            console.log(error);
        }

        if (player) {
            res.json({ playerID: player.playerID })
        } else {
            res.status(400).send({
                message: 'IP not found!'
            });
        }
    }

    requestMatch(playerID, res) {
        var player = this.getPlayer(playerID);
        if (!player) {
            res.status(400).send({
                msg: 'Player not registered'
            });
        }
        if (player.ticket) {
            //Error: player match already requested
            res.json({ msg: "player already in matchmaking" });
        }
        // if no ticket get one and put the player in the queue 
        else {
            var ticket = this.getTicket(playerID);
            player.ticket = ticket;
            this.playerQueue.push(player);
            res.json({ msg: "match request success" });
        }
    }

    requestLobbyID(playerID, res) {
        var player = this.getPlayer(playerID);
        if (!player) {
            res.status(400).send({
                msg: 'Player not registered'
            });
        }
        if (player.ticket) {
            if (player.lobbyId) {
                res.json({ lobbyID: player.lobbyId, message: 'success: match found' });
            } else {
                // match not found yet
                res.status(400).send({
                    message: 'Player not in matchmaking'
                });
            }
        } else {
            // Error: matchmaking not requested
            res.status(400).send({
                message: 'No match found'
            });
        }

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

    findMatches() {

        var playerList = this.playerQueue.splice(0, this.lobbySize);

        var positions = playerList.map(function (player) {
            return [player.coord.x, player.coord.y];
        });

        var k = Math.trunc(playerList.length / this.lobbySize);
        var centroids = util.kMeans(positions, k);
        var dict = {};

        for (let i = 0; i < centroids.length; i++) {
            const center = centroids[i];
            if (!(center in dict))
                dict[center] = util.gen4digit();
        }

        var matches = [];
        for (let i = 0; i < playerList.length; i++) {
            const player = playerList[i];
            const center = centroids[i];

            matches.push({ playerID: player.playerID, lobbyId: dict[center] })
        }

        return matches;
    }

    async run(tickRate) { // We need to wrap the loop into an async function for this to work
        var counter = 0;
        var str;
        while (true) {
            counter += 1;

            if (this.playerQueue.length >= this.lobbySize) {

                var matches = this.findMatches();
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