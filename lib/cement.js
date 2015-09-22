
import { traits, requires } from 'traits-decorator';

import { TEMPLATE, ATTR_CHANGED_MAP } from './constants';


class AttachTemplateOnCreated {
    createdCallback () {
        const me        = this,
              template  = me[TEMPLATE] || function() {};

        me.createShadowRoot().innerHTML = me::template();
    }    
}

class AttachAttributeChanged {

    attributeChangedCallback (attrName, oldVal, newVal) {
        const me = this,
              handler = me[ATTR_CHANGED_MAP][attrName];
        if (handler && me[handler]) {
            me[handler](oldVal, newVal);
        }
    }
}


export function register (element) {
    return function (target) {
        document.registerElement(element, target);
    }
}

export function component (element) {
    return function(target) {
        
        traits(
            AttachTemplateOnCreated,
            AttachAttributeChanged
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
