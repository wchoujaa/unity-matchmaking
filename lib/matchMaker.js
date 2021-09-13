var geoip = require('geoip-lite');
var util = require('./util/util');


const timer = ms => new Promise(res => setTimeout(res, ms))


class Lobby {

    constructor(lobbyID, players) {
        this.lobbyID = lobbyID;
        this.players = players;
    }

    exportLobby(matchMaker) {
        var obj = { lobbyID: this.lobbyID, players: [] };
        var player, playerData;

        this.players.forEach(function (playerID) {
            player = matchMaker.getPlayer(playerID);
            playerData = { ip: player.ip }
            obj.players.push(playerData)
        });

        return obj;
    }

    selfDestruct(matchMaker) {

        var lobbyID = this.lobbyID;

        setTimeout(function () {
            matchMaker.destroyLobby(lobbyID);
        }, matchMaker.timeout);
    }
}

class Player {
    constructor(coord) {
        this.ip = null;
        this.playerID = util.uuidv4();
        this.coord = coord;
        this.lobbyID = null;
        this.ticket = null;
    }
}


class MatchMaker {

    constructor(lobbySize = 1, tickRate = 500, timeout = 100) {
        this.playerDict = {};
        this.playerQueue = [];
        this.lobbyDict = {};
        this.lobbySize = lobbySize;
        this.tickRate = tickRate; // milliseconds
        this.timeout = timeout;
    }




    registerPlayer(ip) {
        var player = null;
        var json = {};
        try {
            var coord = this.getCoord(ip);
            player = new Player(coord);
            // register Player
            this.playerDict[player.playerID] = player;
            json.playerID = player.playerID;

        } catch (error) {
            json.error = 'IP not found!';
        }

        return json;
    }

    requestMatch(playerID) {
        var player = this.getPlayer(playerID);
        var json = {};

        if (!player) {
            json.error = 'Player not registered';
            return json;
        }
        if (player.ticket) {
            //Error: player match already requested
            json.error = "Player already in matchmaking"
        }
        else // if no ticket get one and put the player in the queue 
        {
            var ticket = this.getTicket(playerID);
            player.ticket = ticket;
            this.playerQueue.push(player);
            json.message = 'Match request success';
        }
        return json;

    }

    requestLobbyID(playerID) {
        var player = this.getPlayer(playerID);
        var json = {};

        if (!player) {
            json.error = 'Player not registered';
            return json;
        }
        if (player.ticket) {
            if (player.lobbyID) {
                json = { ...this.lobbyDict[player.lobbyID] };
                json.message = "success: match found";
            } else // match not found yet
            {
                json.error = 'No match found';
            }
        } else // Error: matchmaking not requested
        {
            json.error = 'Player not in matchmaking';
        }
        return json;
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
        // splice player queue
        var lobbySize = this.lobbySize;
        var playerList = this.playerQueue.splice(0, lobbySize);

        var positions = playerList.map(function (player) {
            return [player.coord.x, player.coord.y];
        });
        // find K means
        var k = Math.trunc(playerList.length / lobbySize);
        var centroids = util.kMeans(positions, k);
        // export lobby list
        var dict = {};

        for (let i = 0; i < centroids.length; i++) {
            const center = centroids[i];
            const player = playerList[i];

            if (!(center in dict))
                dict[center] = util.gen4digit();

            player.lobbyID = dict[center];
        }

        var matches = centroids.map(function (center) {
            var lobbyID = dict[center];
            var players = playerList.filter(function (player) { return player.lobbyID === lobbyID; }).map(player => player.playerID);
            return { lobbyID: lobbyID, players: players };
        }).filter(function (matches) {
            return matches.players.length == lobbySize;
        });
        // only keep match with player number == lobbySize 
        return matches;
    }

    async run() {
        var counter = 0;

        while (true) {
            counter += 1;
            if (this.playerQueue.length >= this.lobbySize) {
                var matches = this.findMatches();
                this.updatePlayerList(matches);
            }
            await timer(this.tickRate);
        }
    }

    updatePlayerList(matches) {
        var playerDict = this.playerDict;
        var lobbyDict = this.lobbyDict;
        var lobby;
        var matchmaker = this;
        matches.forEach(function (match) {
            var lobbyID = match.lobbyID;
            var players = match.players;
            players.forEach(function (playerID) {
                var player = playerDict[playerID];
                player.lobbyID = lobbyID;
            });
            lobby = new Lobby(lobbyID, players);
            lobbyDict[lobbyID] = lobby;
            lobby.selfDestruct(matchmaker);
        });
        var log = `> ${matches.length} matches found`
        //console.log(log);
    }

    destroyLobby(lobbyID) {
        lobby = this.lobbyDict[lobbyID];
        var matchmaker = this;
        lobby.players.forEach(function (playerID) {
            var player = matchmaker.getPlayer(playerID);
            player.ticket = null;
            player.lobbyID = null;
        });

        this.lobbyDict[lobbyID] = null;
    }

    getPlayer(playerID) {
        return this.playerDict[playerID];
    }
}

module.exports = MatchMaker;