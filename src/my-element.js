'use strict';

var cement  = require('../lib/cement');

cement.mix({
    '@element'   : 'my-element',
    '@prototype' : HTMLElement,

    '@delegates' : {
        'h1': {
            click: 'onMessageClick'
        }
    },

    createdCallback: function () {
        var me = this;

        me.innerHTML = "<h1>Hello</h1>";
    },

    onMessageClick: function () {
        var h1 = this.querySelector('h1'),
            color = "#"+((1<<24)*Math.random()|0).toString(16);

        h1.style.backgroundColor = color;
        console.log('message click');
    }


});
