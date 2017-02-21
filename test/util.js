var pixelmatch = require('pixelmatch');
var mapnik = require('mapnik');
var path = require('path');

module.exports.writeToDisk = function (key, svg) {
    if (process.env.UPDATE === 'true') {
        var s = new mapnik.Image.fromSVGBytesSync(new Buffer(svg), { scale: 2 });
        s.premultiplySync();
        s.saveSync(path.join(__dirname, 'fixtures', 'expected', key));
    } else {
        var p = new mapnik.Image.fromSVGBytesSync(new Buffer(svg), { scale: 2 });
        p.premultiplySync();
        p.saveSync(path.join(__dirname, 'fixtures', 'actual', key));
    }
}

module.exports.compare = function (name) {
    var actual = mapnik.Image.open(`${__dirname}/fixtures/actual/${name}`);
    var expected = mapnik.Image.open(`${__dirname}/fixtures/expected/${name}`);
    var difference = new mapnik.Image(actual.width(), actual.height());
    var diffPixels = difference.data();
    var pixelDifference = pixelmatch(actual.data(), expected.data(), diffPixels, actual.width(), actual.height(), { threshold: 0.1 });

    return pixelDifference;
};
