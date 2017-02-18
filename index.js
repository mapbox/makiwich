var xml2js = require('xml2js')
var builder = new xml2js.Builder();
var tinycolor = require('tinycolor2');
var constants = require('./lib/constants');
var assets = require('./lib/loadAssets');

function generateMarker (options, callback) {
    if (options.size && (options.size !== 's' && options.size !== 'l')) return callback('Invlaid size');
    var size = options.size ? options.size : 'l';
    var backgroundMarkerSize = size === 's' ? assets.smallParsedMarker : assets.largeParsedMarker;

    delete backgroundMarkerSize.svg.g[0].g[1].g[0].path;

    if (options.symbol) {
        var symbolSize = `${options.symbol}-${size === 's' ? '11' : '15'}`;

        if (assets.parsedSVGs[symbolSize]) {
            // Add the symbol to the base marker
            backgroundMarkerSize.svg.g[0].g[1].g[0] = assets.parsedSVGs[symbolSize].svg;
        } else if (options.symbol.length < 3) {
            var text = size === 's' ? assets.textSmallPlaceholder : assets.textLargePlaceholder;

            // Set characters
            text.tspan._ = options.symbol;
            backgroundMarkerSize.svg.g[0].text[0].tspan = text.tspan;
        } else {
            return callback(`Symbol ${options.symbol} not valid`);
        }
    }

    var tint = options.tint ? options.tint : constants.DEFAULT_DARK_COLOR;
    var tintIsLightInColor = tinycolor(tint).isLight();

    // Change the tint on the marker background
    backgroundMarkerSize.svg.g[0].g[0].path[0].$.fill = tint;

    // If the background color is light, apply a light tint to the icon or text to make it stand out more
    backgroundMarkerSize.svg.g[0].g[1].g[0].$.fill = tintIsLightInColor ? constants.DEFAULT_DARK_COLOR : constants.DEFAULT_LIGHT_COLOR;
    backgroundMarkerSize.svg.g[0].text[0].$.fill = tintIsLightInColor ? constants.DEFAULT_DARK_COLOR : constants.DEFAULT_LIGHT_COLOR;

    // There is a border around the marker
    // This attempts to make it more pronounced againt the tint
    backgroundMarkerSize.svg.g[0].g[0].path[1].$.fill = tintIsLightInColor ? constants.DEFAULT_BLACK : constants.DEFAULT_WHITE;

    var xml = builder.buildObject(backgroundMarkerSize);

    return callback(null, xml);
}

module.exports = generateMarker;
