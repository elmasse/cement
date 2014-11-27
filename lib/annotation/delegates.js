'use strict';

var cocktail    = require('cocktail');
var advisable   = require('cocktail-trait-advisable');
var delegatable = require('../trait/delegatable');

cocktail.mix({
    '@annotation': 'delegates',
    '@exports': module,
    '@as': 'class',

    priority: cocktail.SEQUENCE.EXPORTS,

    setParameter: function (delegates) {
        this.parameter = delegates;
    },

    process: function (subject) {
        var delegates = this.parameter;

        cocktail.mix(subject, {
            '@traits': [delegatable, advisable],

            getDelegates: function() {
                return delegates;
            }
        });

        subject.prototype.after('createdCallback', subject.prototype.initDelegates);
    }
});