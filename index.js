var maki = require('maki');
var fs = require('fs');
var xml2js = require('xml2js')
var parseString = xml2js.parseString;
var builder = new xml2js.Builder();
var queue = require('d3-queue').queue;
var q = new queue();
var tinycolor = require('tinycolor2');
var constants = require('./lib/constants');

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
    if (options.size && (options.size !== 's' && options.size !== 'l')) return callback('Invlaid size');
    var size = options.size ? options.size : 'l';
    var backgroundMarkerSize = size === 's' ? Object.assign(smallParsedMarker) : Object.assign(largeParsedMarker);
    if (options.symbol) {
        var symbolSize = `${options.symbol}-${size === 's' ? '11' : '15'}`;
        if (!parsedSVGs[symbolSize]) return callback(`Symbol ${options.symbol} not found`);

        // Add the symbol to the base marker
        backgroundMarkerSize.svg.g[0].g[1].g[0] = parsedSVGs[symbolSize].svg;
    } else {
        delete backgroundMarkerSize.svg.g[0].g[1].g[0].path;
    }

    var tint = options.tint ? options.tint : constants.DEFAULT_DARK_COLOR;
    var tintIsLightInColor = tinycolor(tint).isLight();

    // Change the tint on the marker background
    backgroundMarkerSize.svg.g[0].g[0].path[0].$.fill = tint;

    // If the background color is light, apply a light tint to the icon to make it stand out more
    backgroundMarkerSize.svg.g[0].g[1].g[0].$.fill = tintIsLightInColor ? constants.DEFAULT_DARK_COLOR : constants.DEFAULT_LIGHT_COLOR;

    // There is a border around the marker
    // This attempts to make it more pronounced againt the tint
    backgroundMarkerSize.svg.g[0].g[0].path[1].$.fill = tintIsLightInColor ? constants.DEFAULT_LIGHT_COLOR : constants.DEFAULT_DARK_COLOR;

    var xml = builder.buildObject(backgroundMarkerSize);

    return callback(null, xml);
}

module.exports = generateMarker;
