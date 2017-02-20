var maki = require('maki');
var fs = require('fs');
var xml2js = require('xml2js')
var TextToSVG = require('text-to-svg');
var textToSVG = TextToSVG.loadSync(`${__dirname}/../sources/fonts/DinOffcPro-Bold.ttf`);
var parseString = xml2js.parseString;
var queue = require('d3-queue').queue;
var q = new queue();

var fileNames = maki.layouts.all.all;
var dirname = maki.dirname;
var sizes = [11, 15];

var smallMarker = fs.readFileSync(`${__dirname}/../sources/marker-small.svg`, 'utf8');
var largelMarker = fs.readFileSync(`${__dirname}/../sources/marker-large.svg`, 'utf8');

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
    anchor: 'top left',
    attributes: {
        fill: '#000'
    }
};

var xyLarge = {
    x: -1,
    y: -3
}

var xySmall = {
    x: -1,
    y: -2
}

abc.split('').forEach((letter) => {
    sizes.forEach((fontSize) => {
        options.fontSize = fontSize;
        Object.assign(options, fontSize === 11 ? xySmall : xyLarge);
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
        Object.assign(options, fontSize === 11 ? xySmall : xyLarge);
        var svg = textToSVG.getSVG(`${i}`, options);
        parseString(svg, (err, res) => {
            if (err) throw err;
            module.exports.parsedSVGs[`${i}-${fontSize}`] = res;
        });
    });
}