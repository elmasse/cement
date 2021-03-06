'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _createDecoratedObject(descriptors) { var target = {}; for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = true; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } } if (descriptor.initializer) { descriptor.value = descriptor.initializer.call(target); } Object.defineProperty(target, key, descriptor); } return target; }

var _traitsDecorator = require('traits-decorator');

var _constants = require('../constants');

var detached = _createDecoratedObject([{
    key: 'detachedCallback',
    decorators: [(0, _traitsDecorator.requires)('Symbol(LISTENERS):{Function}')],
    value: function detachedCallback() {
        var me = this,
            listeners = me[_constants.LISTENERS];

        Object.keys(listeners).map(function (event) {
            return me.removeEventListener(event, me[listeners[event]]);
        });
    }
}]);

exports['default'] = detached;
module.exports = exports['default'];