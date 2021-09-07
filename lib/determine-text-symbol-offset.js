'use strict';

const defaultSmallOffset = { x: -1, y: -2 };
const defaultLargeOffset = { x: -1, y: -3 };

// Because of inconsistent letter widths in the DIN Offc Pro Bold font.
// Ref. https://github.com/mapbox/api-markers/issues/27
module.exports = (symbol, fontSize) => {
    if (!'imw'.includes(symbol)) {
        return (fontSize === 11) ? defaultSmallOffset : defaultLargeOffset;
    }

    if (symbol === 'i') {
        return (fontSize === 11) ? { x: 1, y: -2 } : { x: 1, y: -3 };
    }

    if (symbol === 'm') {
        return (fontSize === 11) ? { x: -2, y: -2 } : { x: -2.5, y: -3 };
    }

    if (symbol === 'w') {
        return (fontSize === 11) ? { x: -2.5, y: -2 } : { x: -3.25, y: -3 };
    }
};
