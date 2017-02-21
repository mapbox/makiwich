var tape = require('tape');
var makiwich = require('../');
var maki = require('maki');
var util = require('./util');

// Don't tolerate any difference in text fixtures compared to images rendered during tests
var maxDifference = 0;
var abc = 'abcdefghijklmnopqrstuvwxyz';

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
            t.ifError(err);
            util.writeToDisk(key, svg);
            var difference = util.compare(key);
            t.ok(difference <= maxDifference, `Pixel difference is ${difference}`);
            t.end();
        });
    });
});

abc.split('').forEach((letter) => {
    var key = `${letter}-323de4@2x.png`;
    tape(key, (t) => {
        makiwich({
            symbol: letter,
            tint: '#323de4'
        }, (err, svg) => {
            t.ifError(err);
            util.writeToDisk(key, svg);
            var difference = util.compare(key);
            t.ok(difference <= maxDifference, `Pixel difference is ${difference}`);
            t.end();
        });
    });
});

abc.split('').forEach((letter) => {
    var key = `${letter}-ddd-s@2x.png`;
    tape(key, (t) => {
        makiwich({
            symbol: letter,
            tint: '#ddd',
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

tape('test numbers', (t) => {
    for (var i = 0; i < 99; i++) {
        var key = `${i}-ff0000@2x.png`;
        makiwich({
            symbol: i + '',
            tint: '#ff0000'
        }, (err, svg) => {
            t.ifError(err);
            util.writeToDisk(key, svg);
            var difference = util.compare(key);
            t.ok(difference <= maxDifference, `Pixel difference for number ${i} is: ${difference}`);
        });
    }
    t.end();
});

tape('test numbers small', (t) => {
    for (var i = 0; i < 99; i++) {
        var key = `${i}-41d691-s@2x.png`;
        makiwich({
            symbol: i + '',
            tint: '#41d691',
            size: 's'
        }, (err, svg) => {
            t.ifError(err);
            util.writeToDisk(key, svg);
            var difference = util.compare(key);
            t.ok(difference <= maxDifference, `Pixel difference for ${key} is: ${difference}`);
        });
    }
    t.end();
});

tape('default marker', (t) => {
    var key = 'default@2x.png';
    makiwich({}, (err, svg) => {
        t.ifError(err);
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
        t.equal(err.message, 'Invlaid size');
        t.equal(svg, undefined);
        t.end();
    });
});

tape('invalid symbol', (t) => {
    makiwich({
        symbol: 'foobar'
    }, (err, svg) => {
        t.equal(err.message, 'Symbol foobar not valid');
        t.equal(svg, undefined);
        t.end();
    });
});

tape('invalid symbol', (t) => {
    makiwich({
        symbol: '333'
    }, (err, svg) => {
        t.equal(err.message, 'Symbol 333 not valid');
        t.equal(svg, undefined);
        t.end();
    });
});

tape('invalid tint', (t) => {
    makiwich({
        tint: '/'
    }, (err, svg) => {
        t.equal(err.message, 'Invalid color');
        t.equal(svg, undefined);
        t.end();
    });
});
