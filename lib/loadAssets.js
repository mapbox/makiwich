var maki = require('maki');
var fs = require('fs');
var xml2js = require('xml2js')
var TextToSVG = require('text-to-svg');
var textToSVG = TextToSVG.loadSync('./sources/fonts/OpenSans-Regular.ttf');
var parseString = xml2js.parseString;
var queue = require('d3-queue').queue;
var q = new queue();

var fileNames = maki.layouts.all.all;
var dirname = maki.dirname;
var sizes = [11, 15];

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

// Create SVG from text
var abc = 'abcdefghijklmnopqrstuvwxyz';
var options = {
    x: -1,
    y: -4,
    anchor: 'top left',
    attributes: {
        fill: '#000',
        stroke: '#999',
        'stroke-width': 0.5
    }
};

abc.split('').forEach((letter) => {
    sizes.forEach((fontSize) => {
        options.fontSize = fontSize;
        var svg = textToSVG.getSVG(letter.toUpperCase(), options);
        parseString(svg, (err, res) => {
            if (err) throw err;
            module.exports.parsedSVGs[`${letter}-${fontSize}`] = res;
        });
    });
});

for (var i = 0; i < 100; i++) {
    sizes.forEach((fontSize) => {
        options.fontSize = fontSize;
        var svg = textToSVG.getSVG(`${i}`, options);
        parseString(svg, (err, res) => {
            if (err) throw err;
            module.exports.parsedSVGs[`${i}-${fontSize}`] = res;
        });
    });
}
