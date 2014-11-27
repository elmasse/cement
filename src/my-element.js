'use strict';

var cement  = require('../lib/cement');

cement.mix({
    '@element'   : 'my-element',
    '@prototype' : HTMLElement,

    createdCallback: function () {
        var me = this;

        me.innerHTML = "<h1>Hello</h1>";
    }

});
