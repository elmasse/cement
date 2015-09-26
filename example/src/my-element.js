
import { component, template, onAttributeChange, select, onEvent } from '../../src/cement';


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

    @onEvent('click')
    changeSpanBackgroundColor () {
        const color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
        this::select('.prop').style.backgroundColor = color;
    }

}

export default MyElement;
