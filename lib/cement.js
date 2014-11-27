'use strict';

var cocktail = require('cocktail');

cocktail.use(require('./annotation/delegates'));
cocktail.use(require('./annotation/element'));
cocktail.use(require('./annotation/prototype'));
cocktail.use(require('./annotation/stylesheet'));

cocktail.mix(cocktail, {
    '@exports': module,
    // lets always define classes with cement
    _isClassDefition: function () {
        return true;
    }
});
