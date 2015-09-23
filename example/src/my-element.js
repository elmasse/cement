
import { component, template, onAttributeChange, select } from '../../src/cement';


@component('my-element')
class MyElement extends HTMLElement {

    @template render() {
        const prop = this.getAttribute('prop');

        return `
            <style>
                :host {
                    display: block;
                }
            </style>
            <div>
                MY ELEMENT FROM RENDER() <span class="prop">${prop}</span>
            </div>
        `;
    }

    @onAttributeChange('prop') updateProp(oldVal, newVal) {
        this::select(`.prop`).innerHTML = newVal ;
    }

}

export default MyElement;
