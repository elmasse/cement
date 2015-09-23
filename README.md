# CementJS

## WebComponent + ES{7|Next|Hopefully|Maybe} decorators helpers
This code uses Babel to transpile some *possible* features in ESNext aka decorators and bindings.

## Example code
> example/src/my-element.js

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

## Install

```
npm i -S https://github.com/elmasse/cement
```

## Cement API

### @register(elementName: {String})
> Class decorator

Registers the target class as a custom element using the `elementName`.

> Usage

```js
import { register } from 'cement';

@register('my-custom-element')
class MyCustomElement extends HTMLElement { 
    createdCallback() {
        this.createShadowRoot().innerHTML = `<div>Here!</div>`;
    }
}

```

### @component(elementName: {String})
> Class decorator

Registers the target class as a custom element using the `elementName` using `@register` decorator. It also defines `createdCallback` and `attributeChangedCallback` as traits to support `@template` and `@onAttributeChange` decorators.

> Usage

```js
import { component } from 'cement';

@component('my-custom-element')
class MyCustomElement extends HTMLElement { ... }

```

### @template
> Method decorator

Marks the decorated method as responsible to provide the template html for the custom element.
It **requires** the class to be decorated with `@component`

> Usage

```js
import { component, template } from 'cement';

@component('my-custom-element')
class MyCustomElement extends HTMLElement { 
    ...

    @template
    innerContent() { 
        return `<div>This is my content!</div>`;
    }
}
```

### @onAttributeChange(attrName: {String})
> Method decorator

Makes the decorated method to be called when the given attribute `attrName` is changed. `oldValue` and `newValue` are passed as parameters. 
It **requires** the class to be decorated with `@component`

> Usage

```js
import { component, attributeChange } from 'cement';

@component('my-custom-element')
class MyCustomElement extends HTMLElement { 
    ...

    @onAttributeChange('name')
    onNameChange (oldValue, newValue) { ... }
}
```

### select(selector: {String})
> Binding

It will execute the given `selector` on the `shadowRoot` element by executing `this.shadowRoot.querySelector()`;

> Usage

```js
import { register, select } from 'cement';

@register('my-custom-element')
class MyCustomElement extends HTMLElement { 

    createdCallback() {
        this.createShadowRoot().innerHTML = `<div class="container">Here!</div>`;
    }

    attributeChangedCallback (name, oldValue, newValue) {
        this::select('.container').innerHTML = `${name} changed: ${newValue}`;
    }
}

```
