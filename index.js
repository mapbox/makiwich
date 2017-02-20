var xml2js = require('xml2js')
var builder = new xml2js.Builder();
var tinycolor = require('tinycolor2');
var constants = require('./lib/constants');
var assets = require('./lib/loadAssets');
var allColors = [];
for (var i in tinycolor.names) {
    allColors.push(i);
}

function generateMarker (options, callback) {
    if (options.size && (options.size !== 's' && options.size !== 'l')) return callback('Invlaid size');
    var size = options.size ? options.size : 'l';
    var b = size === 's' ? assets.smallParsedMarker : assets.largeParsedMarker;

    // Create clone from original
    var backgroundMarkerSize = JSON.parse(JSON.stringify(b));

    if (options.symbol) {
        var symbolSize = `${options.symbol}-${size === 's' ? '11' : '15'}`;
        if (!assets.parsedSVGs[symbolSize] && !/^[1-9a-z]\d{0,1}$/.test(options.symbol)) return callback(`Symbol ${options.symbol} not valid`);

        // Add the symbol to the base marker
        backgroundMarkerSize.svg.g[0].g[1].g[0] = assets.parsedSVGs[symbolSize].svg;

        // If there is only 1 character, shift it to the center
        if (options.symbol.length === 1) {
            if (size === 's') {
                backgroundMarkerSize.svg.g[0].g[1].$.transform = 'translate(9, 6)';
            } else {
                backgroundMarkerSize.svg.g[0].g[1].$.transform = 'translate(10, 7)';
            }
        }
    }

    var tint = options.tint ? options.tint : constants.DEFAULT_BLACK;
    var tinyTint = tinycolor(tint);

    if (!tinyTint.isValid()) return callback('Invalid color');
    var tintIsLightInColor = tinyTint.isLight();

    var markerPaths = backgroundMarkerSize.svg.g[0].g[0].path;
    // Change the tint on the marker background
    markerPaths[markerPaths.length - 2].$.fill = tinyTint.toHexString();

    // Swap the border color if the tint is light and there is a symbol
    markerPaths[markerPaths.length - 1].$.fill = tinycolor.mostReadable(tint, allColors).toHexString();

    // Some Maki icons have different SVG makeups. This attempts to apply the tint to the correct path
    if (backgroundMarkerSize.svg.g[0].g[1].g[0].path) {
        // If the background color is light, apply a light tint to the icon or text to make it stand out more
        backgroundMarkerSize.svg.g[0].g[1].g[0].path[0].$.style = tintIsLightInColor ? `fill:${constants.DEFAULT_BLACK}` : `fill:${constants.DEFAULT_WHITE}`;
    } else {
        backgroundMarkerSize.svg.g[0].g[1].g[0].$.fill = tintIsLightInColor ? constants.DEFAULT_BLACK : constants.DEFAULT_WHITE;
    }

    var xml = builder.buildObject(backgroundMarkerSize);

    return callback(null, xml);
}

module.exports = generateMarker;
