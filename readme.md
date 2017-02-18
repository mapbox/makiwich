# Makiwich

Composites [Maki](https://mapbox.com/maki) icons with a map marker and returns an SVG.

<img src='https://cldup.com/Kx4BlRdfDs.png' height='34px' />

## Install

```
npm install makiwich --save
```

## Usage

```js
var makiwich = require('makiwich');
var mapnik = require('mapnik');

makiwich.generateMarker({
    tint: '#454545',
    symbol: 'zoo', // Valid Maki v2.1.0 icon
    size: 'l' // `s` or `l`
}, (err, svg) => {
    if (err) throw err;

    // Use mapnik to convert the SVG to a PNG and save it
    var s = new mapnik.Image.fromSVGBytesSync(new Buffer(svg), { scale: 2 });
    s.premultiplySync();
    s.saveSync(`zoo.png`);
});
```
