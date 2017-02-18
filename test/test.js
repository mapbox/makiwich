var tape = require('tape');
var makiwich = require('../');
var mapnik = require('mapnik');
var maki = require('maki');

maki.layouts.all.all.forEach((name) => {
    var key = `${name}-s-@2x`;
    tape(key, (t) => {
        makiwich.generateMarker({
            symbol: name,
            size: 's'
        }, (err, svg) => {
            t.ifError(err);
            var s = new mapnik.Image.fromSVGBytesSync(new Buffer(svg), { scale: 2 });
            s.premultiplySync();
            s.saveSync(`${__dirname}/fixtures/expected/${key}.png`);
            t.end();
        });
    });
});

maki.layouts.all.all.forEach((name) => {
    var key = `${name}-l-@2x-#454545`;
    tape(key, (t) => {
        makiwich.generateMarker({
            tint: '#454545',
            symbol: name,
            size: 'l'
        }, (err, svg) => {
            t.ifError(err);
            var s = new mapnik.Image.fromSVGBytesSync(new Buffer(svg), { scale: 2 });
            s.premultiplySync();
            s.saveSync(`${__dirname}/fixtures/expected/${key}.png`);
            t.end();
        });
    });
});
