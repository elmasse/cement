
import { traits } from 'traits-decorator';

import { ATTR_CHANGED_MAP, TEMPLATE, LISTENERS } from './constants';

import created  from './traits/created';
import attached from './traits/attached';
import detached from './traits/detached';
import attributeChanged from './traits/attributeChanged'; 


// --- DECORATORS ----

export function register (element, options = {}) {
    return function (target) {
        document.registerElement(element, Object.assign(options, {prototype: target.prototype}));
    }
}

export function component (element, options = {}) {
    return function(target) {
        traits(
            created,
            attached,
            detached,
            attributeChanged
        )(target);
        register(element, options)(target);
    };
}

export function template (target, name, descriptor) {
    Object.defineProperty(
        target, 
        TEMPLATE,
        {
            ...descriptor
        }
    );
};

export function onAttributeChange (attrName) {
    return function (target, name, descriptor) {
        let map = target[ATTR_CHANGED_MAP];
        if (!map) {
            Object.defineProperty(target, ATTR_CHANGED_MAP, {value: {}})
            map = target[ATTR_CHANGED_MAP];
        }
        map[attrName] = name;
    }
}

export function onEvent (eventName) {
    return function (target, name, descriptor) {
        let map = target[LISTENERS];
        if (!map) {
            Object.defineProperty(target, LISTENERS, {value: {}})
            map = target[LISTENERS];
        }
        map[eventName] = name;
    }
}

// ---

export function select (selector) {
    const root = this.shadowRoot;
    return root.querySelector(selector);
}

