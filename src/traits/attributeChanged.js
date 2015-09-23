import { requires } from 'traits-decorator';
import {ATTR_CHANGED_MAP} from '../constants';

const attributeChangedCallback = {
    
    @requires('Symbol(ATTR_CHANGED_MAP):{Function}')
    attributeChangedCallback (attrName, oldVal, newVal) {
        const me = this,
              handler = me[ATTR_CHANGED_MAP][attrName];
        if (handler && me[handler]) {
            me[handler](oldVal, newVal);
        }
    }
}

export default attributeChangedCallback;