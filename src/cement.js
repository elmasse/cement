
import { traits } from 'traits-decorator';

import { TEMPLATE, ATTR_CHANGED_MAP } from './constants';

import attributeChangedCallback from './traits/attributeChanged';
import createdCallback          from './traits/created';


// --- DECORATORS ----

export function register (element) {
    return function (target) {
        document.registerElement(element, target);
    }
}

export function component (element) {
    return function(target) {
        traits(
            createdCallback,
            attributeChangedCallback
        )(target);
        register(element)(target);
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

// ---

export function select (selector) {
    const root = this.shadowRoot;
    return root.querySelector(selector);
}

