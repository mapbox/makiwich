var pixelmatch = require('pixelmatch');
var mapnik = require('mapnik');
var path = require('path');
var fs = require('fs');

module.exports.writeToDisk = function (key, svg) {
    if (process.env.UPDATE === 'true') {
        var s = new mapnik.Image.fromSVGBytesSync(new Buffer(svg), { scale: 2 });
        s.premultiplySync();
        fs.writeFileSync(path.join(__dirname, 'fixtures', 'expected', key), s.encodeSync('png'), {encoding: 'binary'});
    } else {
        var p = new mapnik.Image.fromSVGBytesSync(new Buffer(svg), { scale: 2 });
        p.premultiplySync();
        p.saveSync(path.join(__dirname, 'fixtures', 'actual', key));
        fs.writeFileSync(path.join(__dirname, 'fixtures', 'actual', key), p.encodeSync('png'), {encoding: 'binary'});
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
