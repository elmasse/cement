import { requires } from 'traits-decorator';
import {TEMPLATE} from '../constants';

const createdCallback = {
    
    @requires('Symbol(TEMPLATE):{Function}')
    createdCallback () {
        const me        = this,
              template  = me[TEMPLATE] || function() {};

        me.createShadowRoot().innerHTML = me::template();
    }    
}

export default createdCallback;