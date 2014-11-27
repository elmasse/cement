'use strict';

var cocktail = require('cocktail');

cocktail.mix({
    '@annotation': 'prototype',
    '@exports': module,
    '@as': 'class',

    priority: cocktail.SEQUENCE.EXTENDS,

    setParameter: function (proto) {
        this.parameter = proto.prototype || proto;
    },

    process: function (subject) {
        var prototype = this.parameter;

        subject.prototype = Object.create(prototype);
    }
});
