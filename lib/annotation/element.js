'use strict';

var cocktail = require('cocktail');

cocktail.mix({
    '@annotation': 'element',
    '@exports': module,
    '@as': 'class',

    priority: cocktail.SEQUENCE.POST_EXPORTS,

    setParameter: function (tag) {
        this.parameter = tag;
    },

    process: function (subject) {
        var tagName = this.parameter;

        document.registerElement(tagName, {prototype: subject.prototype});
    }
});