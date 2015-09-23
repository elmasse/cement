
import { component, template, onAttributeChange } from '../lib/cement';


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
        const root = this.shadowRoot;
        root.querySelector(`.prop`).innerHTML = newVal ;
    }

}

export default MyElement;
