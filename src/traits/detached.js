import { requires } from 'traits-decorator';
import { LISTENERS } from '../constants';

const detached = {

    @requires('Symbol(LISTENERS):{Function}')
    detachedCallback () {
        const me = this,
              listeners = me[LISTENERS];

        Object.keys(listeners).map( (event) => me.removeEventListener(event, me[listeners[event]]));

    }
}

export default detached;
