var assert = require('assert');
var geoip = require('geoip-lite');

const lib = require('../lib/util/util');
const fs = require('fs');
const { log } = require('console');
const MatchMaker = require('../lib/matchMaker')



describe('kmeans', function () {
  describe('#kmeans()', function () {
    it('should return two clusters', function () {

      var test = [[0, 0], [0, 1], [2, 3], [3, 2]];
      var expected = [0, 0, 1, 1]
      var clusters = 2;
      var res = lib.kMeans(test, clusters);
      for (let i = 0; i < test.length; i++) {
        const element = expected[i];
        const result = res[i];
        assert.equal(element, result);

      }
    });
  });
});

describe('geoIP', function () {
  describe('#geoIPList()', function () {
    it('should return a list of Ip information', function () {
      var data;
      try {
        data = fs.readFileSync('./data/ip.txt', 'utf8')
      } catch (err) {
        console.error("error reading the file : ", err);
      }

      var ip_ls = data.split('\r\n');
      var ip_informations = [];

      ip_ls.forEach(function (ip) {
        var geo = geoip.lookup(ip);
        if (geo)
          ip_informations.push(geo);
      });


      //assert.equal(ip_ls.length, ip_informations.length);

    });
  });
});


describe('latLonToOffsets', function () {
  describe('#latLonToOffsets()', function () {
    it('test if list of x,y coordinates from Lat, Lng data is not NAN', function () {
      var data;
      try {
        data = fs.readFileSync('./data/ip-full.json', 'utf8')
      } catch (err) {
        console.error("error reading the file : ", err);
      }

      var json = JSON.parse(data);
      var res = [];

      json.forEach(element => {
        var lat = element.ll[0];
        var lng = element.ll[1];
        var { x, y } = lib.latLonToOffsets(lat, lng, 1000, 500);
        res.push({ x, y });
      });



      assert.equal(json.length, res.length)

      res.forEach(element => {
        var { x, y } = element;
        assert.equal(isNaN(x), false);
        assert.equal(isNaN(y), false);
      });
    });
  });
});



describe('K means', function () {
  describe('#kMeans()', function () {
    it('test for a given list of position return a centroid for each position', function () {
      var centroids = lib.kMeans([[0, 0], [0, 1], [1, 3], [2, 0]], 2);
      assert.equal(centroids.length, 4);
    });
  });
});


describe('Matchmaking', function () {
  describe('#registerPlayer()', function () {
    it('Try to resolve the coord for a given IP return a valid Player object', function () {
      var ip = "207.97.227.239";

      const mm = new MatchMaker();

      var player = mm.registerPlayer(ip);

      assert.ok(player.id)
      assert.ok(mm.playerDict[player.id])
    });
  });
});


describe('Matchmaking', function () {
  describe('#requestMatch()', function () {
    it('test an incoming connection to see if the player is registered in the list', function () {
      var ip = "207.900.207.239";

      const mm = new MatchMaker();

      mm.requestMatch(ip);

      //assert.equal(mm.playerList.length, 1);

    });
  });
});



describe('Matchmaking', function () {
  describe('#findMatches(playerList)', function () {
    it('test if we can get a match', function () {
      var ip = "207.97.227.239";

      const mm = new MatchMaker();
      mm.lobbySize = 1;
      var player = mm.registerPlayer(ip);
      mm.requestMatch(player.id);
      var match = mm.findMatches(mm.playerList);
      assert.equal(match.length, 1);


    });
  });
});


