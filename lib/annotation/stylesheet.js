'use strict';

var cocktail  = require('cocktail');
var advisable = require('cocktail-trait-advisable');

cocktail.mix({
    '@annotation': 'stylesheet',
    '@exports': module,
    '@as': 'class',

    priority: cocktail.SEQUENCE.EXPORTS,

    setParameter: function (stylesheet) {
        this.parameter = stylesheet;
    },

    process: function (subject) {
        var stylesheet = this.parameter;

        cocktail.mix(subject, {
            '@traits': [advisable],

            appendStylesheet:function () {
                var style = document.createElement('style');

                style.innerHTML = stylesheet;
                this.appendChild(style);

            }
        });

        subject.prototype.before('createdCallback', subject.prototype.appendStylesheet);
                
    }
});