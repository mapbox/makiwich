var maki = require('maki');
var fs = require('fs');
var xml2js = require('xml2js')
var parseString = xml2js.parseString;
var queue = require('d3-queue').queue;
var q = new queue();

var fileNames = maki.layouts.all.all;
var dirname = maki.dirname;
var sizes = [11, 15];

var textSmall = '<tspan x="8.5" y="15">1</tspan>';
var textLarge = '<tspan x="9.5" y="18">1</tspan>';
var smallMarker = fs.readFileSync('./sources/marker-small.svg', 'utf8');
var largelMarker = fs.readFileSync('./sources/marker-large.svg', 'utf8');

module.exports = {};

parseString(smallMarker, (err, res) => {
    if (err) throw err;
    module.exports.smallParsedMarker = res;
});
parseString(largelMarker, (err, res) => {
    if (err) throw err;
    module.exports.largeParsedMarker = res;
});
parseString(textSmall, (err, res) => {
    if (err) throw err;
    module.exports.textSmallPlaceholder = res;
});
parseString(textLarge, (err, res) => {
    if (err) throw err;
    module.exports.textLargePlaceholder = res;
});

fileNames.forEach((name) => {
    q.defer((next) => {
        var sizeQueue = new queue();

        sizes.forEach((size) => {
            sizeQueue.defer((sizeNext) => {
                parseString(fs.readFileSync(`${dirname}/icons/${name}-${size}.svg`, 'utf8'), (err, parsedSVG) => {
                    if (err) return next(err);
                    return sizeNext(null, {
                        name: `${name}-${size}`,
                        svg: parsedSVG
                    });
                });
            });
        });

        sizeQueue.awaitAll(next);
    });
});

q.awaitAll((err, res) => {
    if (err) throw err;
    var merged = [].concat.apply([], res);
    module.exports.parsedSVGs = merged.reduce((total, current) => {
        total[current.name] = current.svg;
        return total;
    }, {});
});
