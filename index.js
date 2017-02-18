var maki = require('maki');
var fs = require('fs');
var xml2js = require('xml2js')
var parseString = xml2js.parseString;
var builder = new xml2js.Builder();
var queue = require('d3-queue').queue;
var q = new queue();
var tinycolor = require('tinycolor2');

var fileNames = maki.layouts.all.all;
var dirname = maki.dirname;
var parsedSVGs;
var sizes = [11, 15];

var smallMarker = fs.readFileSync('./sources/marker-small.svg', 'utf8');
var largelMarker = fs.readFileSync('./sources/marker-large.svg', 'utf8');
var smallParsedMarker;
var largeParsedMarker;

parseString(smallMarker, (err, res) => {
    if (err) throw err;
    smallParsedMarker = res;
});
parseString(largelMarker, (err, res) => {
    if (err) throw err;
    largeParsedMarker = res;
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
    parsedSVGs = merged.reduce((total, current) => {
        total[current.name] = current.svg;
        return total;
    }, {});
});

function generateMarker (options, callback) {
    if (!options.size) return callback('Option size s or l required');
    if (!options.symbol) return callback('Option symbol required');

    var backgroundMarkerSize = options.size === 's' ? smallParsedMarker : largeParsedMarker;
    var symbolSize = `${options.symbol}-${options.size === 's' ? '11' : '15'}`;

    if (!parsedSVGs[symbolSize]) return callback(`symbol ${options.symbol} not found`);

    backgroundMarkerSize.svg.g[0].g[1].g[0].path = parsedSVGs[symbolSize].svg.path;

    // change color of background
    if (options.tint) {
        var tint = options.tint;
        backgroundMarkerSize.svg.g[0].g[0].path[0].$.fill = tint;

        // If the background color is light, apply a light tint to the icon
        backgroundMarkerSize.svg.g[0].g[1].g[0].$.fill = tinycolor(tint).isLight() ? '#1A1A1A' : '#DDDDDD';
        backgroundMarkerSize.svg.g[0].g[0].path[1].$.fill = tinycolor(tint).isLight() ? '#fff' : '#000';
    }
    var xml = builder.buildObject(backgroundMarkerSize);

    return callback(null, xml);
}

module.exports = {};
module.exports.generateMarker = generateMarker;
