# CementJS

## WebComponent + ES{7|Next|Hopefully|Maybe} decorators helpers
This code uses Babel to transpile some *possible* features in ESNext aka decorators and bindings.

## Example code
> exmaple/src/my-element.js

```js

import { component, template, onAttributeChange, select } from '../lib/cement';


@component('my-element') // register the component
class MyElement extends HTMLElement {

    @template // make render() to return the template
    render() {
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

    @onAttributeChange('prop') // handler for 'prop' attribute change
    updateProp(oldVal, newVal) {
        //const root = this.shadowRoot;
        //root.querySelector(`.prop`).innerHTML = newVal ;
        this::select(`.prop`).innerHTML = newVal ; // select binding
    }

}
```


## Run Example

```
$ npm install
$ npm run example
$ open example/index.html
```

## WebComponents
This library runs on top of `webcomponents.js`. That means that browser support is tied to it.
