import { requires } from 'traits-decorator';
import { LISTENERS } from '../constants';

const attached = {

    @requires('Symbol(LISTENERS):{Function}')
    attachedCallback () {
        const me = this,
              listeners = me[LISTENERS];

        Object.keys(listeners).map( (event) => me.addEventListener(event, me[listeners[event]]));

    }
}

export default attached;
