var maki = require('@mapbox/maki');
var fs = require('fs');
var xml2js = require('xml2js')
var TextToSVG = require('text-to-svg');
var path = require('path');
var pathToMaki = require.resolve('@mapbox/maki');
var determineTextSymbolOffset = require('./determine-text-symbol-offset.js');
var textToSVG = TextToSVG.loadSync(path.join(__dirname, '../', 'sources', 'fonts', 'DINOffcPro-Bold.ttf'));
var parseString = xml2js.parseString;
var queue = require('d3-queue').queue;
var q = new queue();

var fileNames = maki.layouts;
var sizes = [11, 15];

var smallMarker = fs.readFileSync(path.join(__dirname, '../', 'sources', 'marker-small.svg'), 'utf8');
var largelMarker = fs.readFileSync(path.join(__dirname, '../', 'sources', 'marker-large.svg'), 'utf8');

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
        var p = path.join(pathToMaki, '../', 'icons', `${name}.svg`);
        parseString(fs.readFileSync(p, 'utf8'), (err, parsedSVG) => {
            if (err) return next(err);
            return next(null, {
                name,
                svg: parsedSVG
            });
        });
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
    anchor: 'top left',
    attributes: {
        fill: '#000'
    }
};

abc.split('').forEach((letter) => {
    sizes.forEach((fontSize) => {
        options.fontSize = fontSize;
        Object.assign(options, determineTextSymbolOffset(letter, fontSize));
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
        Object.assign(options, determineTextSymbolOffset(i, fontSize));
        var svg = textToSVG.getSVG(`${i}`, options);
        parseString(svg, (err, res) => {
            if (err) throw err;
            module.exports.parsedSVGs[`${i}-${fontSize}`] = res;
        });
    });
}
