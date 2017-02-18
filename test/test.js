var tape = require('tape');
var makiwich = require('../');
var maki = require('maki');
var util = require('./util');

// Don't tolerate any difference in text fixtures compared to images rendered during tests
var maxDifference = 0;

maki.layouts.all.all.forEach((name) => {
    var key = `${name}-s-@2x.png`;
    tape(key, (t) => {
        makiwich({
            symbol: name,
            size: 's'
        }, (err, svg) => {
            t.ifError(err);
            util.writeToDisk(key, svg);
            var difference = util.compare(key);
            t.ok(difference <= maxDifference, `Pixel difference is ${difference}`);
            t.end();
        });
    });
});

maki.layouts.all.all.forEach((name) => {
    var key = `${name}-l-@2x-#454545.png`;
    tape(key, (t) => {
        makiwich({
            tint: '#454545',
            symbol: name,
            size: 'l'
        }, (err, svg) => {
            t.ifError(err, 'No error');
            util.writeToDisk(key, svg);
            var difference = util.compare(key);
            t.ok(difference <= maxDifference, `Pixel difference is ${difference}`);
            t.end();
        });
    });
});

tape('default marker', (t) => {
    var key = 'default.png';
    makiwich({}, (err, svg) => {
        t.ifError(err, 'No error');
        util.writeToDisk(key, svg);
        var difference = util.compare(key);
        t.ok(difference <= maxDifference, `Pixel difference is ${difference}`);
        t.end();
    });
});

tape('invalid size', (t) => {
    makiwich({
        size: 'foo'
    }, (err, svg) => {
        t.equal(err, 'Invlaid size');
        t.equal(svg, undefined);
        t.end();
    });
});
