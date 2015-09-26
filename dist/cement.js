'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.register = register;
exports.component = component;
exports.template = template;
exports.onAttributeChange = onAttributeChange;
exports.select = select;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _traitsDecorator = require('traits-decorator');

var _constants = require('./constants');

var _traitsAttributeChanged = require('./traits/attributeChanged');

var _traitsAttributeChanged2 = _interopRequireDefault(_traitsAttributeChanged);

var _traitsCreated = require('./traits/created');

var _traitsCreated2 = _interopRequireDefault(_traitsCreated);

// --- DECORATORS ----

function register(element) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return function (target) {
        document.registerElement(element, Object.assign(options, { prototype: target.prototype }));
    };
}

function component(options) {
    return function (target) {
        (0, _traitsDecorator.traits)(_traitsCreated2['default'], _traitsAttributeChanged2['default'])(target);
        register.apply(undefined, _toConsumableArray(options))(target);
    };
}

function template(target, name, descriptor) {
    Object.defineProperty(target, _constants.TEMPLATE, _extends({}, descriptor));
}

;

function onAttributeChange(attrName) {
    return function (target, name, descriptor) {
        var map = target[_constants.ATTR_CHANGED_MAP];
        if (!map) {
            Object.defineProperty(target, _constants.ATTR_CHANGED_MAP, { value: {} });
            map = target[_constants.ATTR_CHANGED_MAP];
        }
        map[attrName] = name;
    };
}

// ---

function select(selector) {
    var root = this.shadowRoot;
    return root.querySelector(selector);
}