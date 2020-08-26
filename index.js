var xml2js = require('xml2js')
var builder = new xml2js.Builder();
var tinycolor = require('tinycolor2');
var constants = require('./lib/constants');
var assets = require('./lib/loadAssets');
var errcode = require('err-code');
var allColors = [];
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
        var symbolSize = `${options.symbol}-${size === 's' ? '11' : '15'}`;
        if (!assets.parsedSVGs[symbolSize] && !/^[1-9a-z]\d{0,1}$/.test(options.symbol)) return callback(errcode(`Symbol ${options.symbol} not valid`, 'EINVALID'));

        // Add the symbol to the base marker
        basePaths[3].path = assets.parsedSVGs[symbolSize].svg.path;
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
    var tinyTint = tinycolor(tint);

    if (!tinyTint.isValid()) return callback(errcode('Invalid color', 'EINVALID'));
    // get the brightness value 
    // create a variable that defines brightness threshhold 
    // check to see if the brightness value is less than the threshhold 
    // if is it more than threshhold of 160, set tintisLightiCcolor to true. 
    var tintIsLightInColor = (tinyTint.getBrightness() > 160)

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
