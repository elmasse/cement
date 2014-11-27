'use strict';

var cocktail = require('cocktail');

cocktail.mix({
    '@exports' : module,
    '@as'      : 'class',

    '@requires': [
        'getDelegates',
        'querySelector'
    ],

    initDelegates: function () {
        var me = this,
            delegates = me.getDelegates(),
            key, element, listeners, evnt;

        for (key in delegates) {
            element = me.querySelector(key);
            listeners = delegates[key];
            if (element) {
                for (evnt in listeners) {
                    //TODO: this should be added on body instead of element
                    element.addEventListener(evnt, me[listeners[evnt]].bind(me));
                }
            }
        }

    }
});