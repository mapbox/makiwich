var xml2js = require('xml2js')
var builder = new xml2js.Builder();
var tinycolor = require('tinycolor2');
var constants = require('./lib/constants');
var assets = require('./lib/loadAssets');
var errcode = require('err-code');
var allColors = [];
var numericSizes = {'s': 11, 'l': 15};
for (var i in tinycolor.names) {
    allColors.push(i);
}

function generateMarker (options, callback) {
    if (options.size && (options.size !== 's' && options.size !== 'l')) return callback(errcode('Invlaid size', 'EINVALID'));
    var size = options.size ? options.size : 'l';
    var b = size === 's' ? assets.smallParsedMarker : assets.largeParsedMarker;

    // Create clone from original
    var backgroundMarkerSize = JSON.parse(JSON.stringify(b));
    var basePaths = backgroundMarkerSize.svg.g[0].g[0].g;

    if (options.symbol) {
        const isMaki = (symb) => symb.length > 2;

        const symbolName = (isMaki(options.symbol))
            ? options.symbol
            : `${options.symbol}-${numericSizes[size]}`;

        if (!assets.parsedSVGs[symbolName]) {
            return callback(errcode(`Symbol ${options.symbol} not valid`, 'EINVALID'));
        }

        // because maki@7.0.0 removed small SVGs, we need to update our small-marker SVG
        // to reduce the size of the maki icon it renders by the appropriate ratio
        if (isMaki(options.symbol) && size === 's') {
            basePaths[3]['$'].transform += ' scale(0.733, 0.733)';
        }

        // Add the symbol to the base marker
        basePaths[3].path = assets.parsedSVGs[symbolName].svg.path;
        delete basePaths[4];

        // If there is only 1 character, shift it to the center
        if (options.symbol.length === 1) {
            if (size === 's') {
                basePaths[3].$.transform = 'translate(9, 7)';
            } else {
                basePaths[3].$.transform = 'translate(10, 8)';
            }
        }
    }

    var tint = options.tint ? options.tint : constants.DEFAULT_BLACK;
    // test the generate marker function with tint = f58220
    // tintIsLightInColor should be false
    var tinyTint = tinycolor(tint);

    if (!tinyTint.isValid()) return callback(errcode('Invalid color', 'EINVALID'));

    // if the brightness it more than 160, set tintisLightiCcolor to true. This way broader spectrum of
    // colors would have white fill.
    var tintIsLightInColor = (tinyTint.getBrightness() > 160);

    // Change the tint on the marker background
    basePaths[1].$.fill = tinyTint.toHexString();

    // Swap the border color if the tint is light and there is a symbol
    basePaths[2].$.fill = tinycolor.mostReadable(tint, allColors).toHexString();

    // Some Maki icons have different SVG makeups. This attempts to apply the tint to the correct path
    if (basePaths[3].path) {
        // If the background color is light, apply a light tint to the icon or text to make it stand out more
        basePaths[3].path[0].$.style = tintIsLightInColor ? `fill:${constants.DEFAULT_BLACK}` : `fill:${constants.DEFAULT_WHITE}`;
    } else {
        basePaths[3].$.fill = tintIsLightInColor ? constants.DEFAULT_BLACK : constants.DEFAULT_WHITE;
    }

    var xml = builder.buildObject(backgroundMarkerSize);

    return callback(null, xml);
}

module.exports = generateMarker;
