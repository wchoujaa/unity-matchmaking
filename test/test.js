var assert = require('assert');
var geoip = require('geoip-lite');

const lib = require('.././scripts/lib/util');
const fs = require('fs');
const { log } = require('console');



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


      assert.equal(ip_ls.length, ip_informations.length);

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