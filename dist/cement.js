require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var cocktail    = require('cocktail');
var advisable   = require('cocktail-trait-advisable');
var delegatable = require('../trait/delegatable');

cocktail.mix({
    '@annotation': 'delegates',
    '@exports': module,
    '@as': 'class',

    priority: cocktail.SEQUENCE.EXPORTS,

    setParameter: function (delegates) {
        this.parameter = delegates;
    },

    process: function (subject) {
        var delegates = this.parameter;

        cocktail.mix(subject, {
            '@traits': [delegatable, advisable],

            getDelegates: function() {
                return delegates;
            }
        });

        subject.prototype.after('createdCallback', subject.prototype.initDelegates);
    }
});
},{"../trait/delegatable":5,"cocktail":19,"cocktail-trait-advisable":6}],2:[function(require,module,exports){
'use strict';

var cocktail = require('cocktail');

cocktail.mix({
    '@annotation': 'element',
    '@exports': module,
    '@as': 'class',

    priority: cocktail.SEQUENCE.POST_EXPORTS,

    setParameter: function (tag) {
        this.parameter = tag;
    },

    process: function (subject) {
        var tagName = this.parameter;

        document.registerElement(tagName, {prototype: subject.prototype});
    }
});
},{"cocktail":19}],3:[function(require,module,exports){
'use strict';

var cocktail = require('cocktail');

cocktail.mix({
    '@annotation': 'prototype',
    '@exports': module,
    '@as': 'class',

    priority: cocktail.SEQUENCE.EXTENDS,

    setParameter: function (proto) {
        this.parameter = proto.prototype || proto;
    },

    process: function (subject) {
        var prototype = this.parameter;

        subject.prototype = Object.create(prototype);
    }
});

},{"cocktail":19}],4:[function(require,module,exports){
'use strict';

var cocktail  = require('cocktail');
var advisable = require('cocktail-trait-advisable');

cocktail.mix({
    '@annotation': 'stylesheet',
    '@exports': module,
    '@as': 'class',

    priority: cocktail.SEQUENCE.EXPORTS,

    setParameter: function (stylesheet) {
        this.parameter = stylesheet;
    },

    process: function (subject) {
        var stylesheet = this.parameter;

        cocktail.mix(subject, {
            '@traits': [advisable],

            appendStylesheet:function () {
                var style = document.createElement('style');

                style.innerHTML = stylesheet;
                this.appendChild(style);

            }
        });

        subject.prototype.before('createdCallback', subject.prototype.appendStylesheet);
                
    }
});
},{"cocktail":19,"cocktail-trait-advisable":6}],5:[function(require,module,exports){
'use strict';

var cocktail = require('cocktail');

cocktail.mix({
    '@exports' : module,
    '@as'      : 'class',

    '@requires': [
        'getDelegates',
        'querySelector'
    ],

    initDelegates: function () {
        var me = this,
            delegates = me.getDelegates(),
            key, element, listeners, evnt;

        for (key in delegates) {
            element = me.querySelector(key);
            listeners = delegates[key];
            if (element) {
                for (evnt in listeners) {
                    //TODO: this should be added on body instead of element
                    element.addEventListener(evnt, me[listeners[evnt]].bind(me));
                }
            }
        }

    }
});
},{"cocktail":19}],6:[function(require,module,exports){
'use strict';

var cocktail = require('cocktail');

cocktail.mix({
    '@exports': module,
    '@as'     : 'class',

    after: function (method, advice){
        var base = this[method];

        if (base) {
            this[method] = function _advicedAfter() {
                var ret = base.apply(this, arguments);
                advice.apply(this, arguments);
                return ret;
            };
        }
    },

    before: function (method, advice){
        var base = this[method];

        if (base) {
            this[method] = function _advicedBefore() {
                advice.apply(this, arguments);
                return base.apply(this, arguments);
            };
        }
    },

    around: function (method, advice){
        var base = this[method];

        if (base) {
            this[method] = function _advicedAround() {
                var args = [].concat(arguments);
                args.unshift(base.bind(this));
                return advice.apply(this, args);
            };
        }
    }

});

},{"cocktail":7}],7:[function(require,module,exports){
/*
 *
 * Copyright (c) 2013 - 2014 Maximiliano Fierro
 * Licensed under the MIT license.
 */
'use strict';

var sequence = require('./processor/sequence'),
    cocktail,
    ANNOTATION_REG_EXP = /^@/;


cocktail = {
    /**
     * @private
     * Stack of _queues
     */
    _qStack: [],
    /**
     * @private
     * The queue of processors instances for the given mix
     */
    _queue: [],

    /**
     *@private
     * Current processor list map
     */
    _processors: {},

    /**
     * @protected
     * Returns the processor list map
     */
    getProcessors : function(){
        return this._processors;
    },

    /**
     * @protected
     * sets the processor object list. It is an Object used as a map
     */
    setProcessors: function (processor) {
        this._processors = processor;
    },

    /**
     * @protected
     * returns the list of default processors
     */
    getDefaultProcessors: function () {
        return cocktail._DEFAULT_PROCESSORS;
    },

    /**
     * @protected
     * registers a processor definition
     * @param processorsConfig {Object} a key-value pair of processors
     */
    registerProcessors: function(processorsConfig){
        var processors = this.getProcessors(),
            key;
        for(key in processorsConfig){
            if(processorsConfig.hasOwnProperty(key)){
                processors[key] =  processorsConfig[key];
            }
        }
    },

    /**
     * @public
     */
    use: function(annotation){
        var name = annotation.name || (annotation.prototype && annotation.prototype.name),
            processor = {};

        if(name && annotation.prototype){
            processor[name] = annotation;
            this.registerProcessors(processor);
        }
    },

    /**
     * @private
     * returns a processor instance for the given key or a NoOp instance if it is not found.
     */
    _getProcessorFor: function(key){
        var processors = this.getProcessors(),
            P;
        P = (processors[key] || processors['no-op']);
        return new P();
    },

    /**
     * @private
     * applies default options to the given options parameter.
     * As of today, the only default option is the configuration for the merge annotation
     */
    _applyDefaultsOptions: function(options){
        if(options && !('@merge' in options) ){
            options['@merge'] = "single";
        }
    },

    /**
     * @private
     * iterates over options to find annotations and adds processors to the queue.
     */
    _configureProcessorsWith: function(options){
        var key, value, processor;

        this._cleanQueue();

        if(options){
            for(key in options){
                if(options.hasOwnProperty(key) && ANNOTATION_REG_EXP.test(key)){
                    value = options[key];
                    //get the processor instance for this annotation
                    processor = this._getProcessorFor(key);
                    //configure the annotation parameter
                    processor.setParameter(value);
                    //check if the annotation should be removed
                    if(!processor.retain){
                        delete options[key];
                    }
                    //add the processor to the queue
                    this._addProcessorToQueue(processor);
                }
            }
        }
    },

    /**
     * @private
     * stacks current queue
     */
    _pushQueue: function() {
        this._qStack.push(this._queue);
        this._queue = [];
    },

    /**
     * @private
     * restore current queue
     */
    _popQueue: function() {
        this._queue = this._qStack.pop();
    },


    /**
     * @private
     * Cleans the processor queue
     */
    _cleanQueue: function(){
        this._queue.length = 0;
    },

    /**
     * @private
     * Adds the given processor to the queue
     */
    _addProcessorToQueue: function(processor){
        if(processor && processor.priority !== -1){
            this._queue.push(processor);
        }
    },

    /**
     * @private
     * Sorts the queue by its processor's priorities
     */
    _sortQueueByPriority: function(){
        this._queue.sort(function(a, b){
            return a.priority - b.priority;
        });
    },

    /**
     * @private
     * Runs all the processors in the queue over the given subject
     */
    _executeProcessorsOn: function(subject, options){
        var processors = this._queue,
            l = processors.length,
            i;

        this._sortQueueByPriority();

        for(i = 0; i < l; i++){
            processors[i].process(subject, options);
        }

    },

    /**
     * @private
     * returns true if the given subject has a pseudo annotation `@as` with the given value.
     */
    _isSubjectDefinedAs: function (subject, asType) {
        return (subject && subject['@as'] && subject['@as'].toLowerCase() === asType);
    },

    /**
     * @private
     * returns true if the given subject is a class definition object.
     */
    _isClassDefition: function (subject) {
        var isClassDef = this._isSubjectDefinedAs(subject, 'class'),
            definitionProps = ['constructor', '@extends', '@traits', '@requires', '@annotation'],
            key;

        if (!isClassDef) {
            for (key in subject) {
                if(definitionProps.indexOf(key) > -1){
                    isClassDef = true;
                    break;
                }
            }
        }

        return isClassDef;
    },

    /**
     * @private
     * returns true if the given subject is a module definition object.
     */
    _isModuleDefinition: function (subject) {
        return this._isSubjectDefinedAs(subject, 'module');
    },

    /**
     * @private
     * If the subject has a property construtor returns it,
     * if no constructor on subject but it extends then return a function() calling super constructor,
     * or a function definition otherwise.
     */
    _getDefaultClassConstructor: function (subject) {
        var ctor, parent;

        if (this._isPropertyDefinedIn('constructor', subject)) {
            ctor = subject.constructor;
        } else if (this._isPropertyDefinedIn('@extends', subject)) {
            parent = subject['@extends'];
            ctor = function(){
                parent.prototype.constructor.apply(this, arguments);
            };
        } else {
            ctor = function(){};
        }

        return ctor;
    },

    /**
     * @private
     * checks if the given property is enumerable and defined in the obj
     */
    _isPropertyDefinedIn: function (property, obj) {
        var k;

        for (k in obj) {
            if(property === k) {
                return true;
            }
        }

        return false;
    },

    /**
     * @private
     * returns a call to mix() with the subject constructor and options
     */
    _processClassDefition: function(subject) {
        var defaultConstructor, options;

        defaultConstructor = this._getDefaultClassConstructor(subject);
        if(this._isPropertyDefinedIn('constructor', subject)) {
            delete subject.constructor;
        }
        options = subject;
        return this.mix(defaultConstructor, options);
    },

    /**
     * @private
     * @experimental 0.5.1
     * returns a call to mix() with the subject module and options
     */
    _processModuleDefinition: function (subject) {
        var options = subject;
        return this.mix(subject, options);
    },

    /**
     * @public
     */
    mix: function(subject, options){
        if(!options){
            if (this._isClassDefition(subject)) {
                return this._processClassDefition(subject);
            }
            if (this._isModuleDefinition(subject)) {
                return this._processModuleDefinition(subject);
            }
        }

        if(subject){
            this._pushQueue();
            this._applyDefaultsOptions(options);
            this._configureProcessorsWith(options);
            this._executeProcessorsOn(subject, options);
            this._popQueue();
        }

        return subject;
    }

};

//export module
module.exports = cocktail;

/**
 * @private
 * The processors class list.
 */
cocktail._DEFAULT_PROCESSORS = {
    'no-op'       : require('./processor/NoOp'),
    '@as'         : undefined, /*pseudo-processor*/
    '@merge'      : require('./processor/annotation/Merge'),
    '@extends'    : require('./processor/annotation/Extends'),
    '@properties' : require('./processor/annotation/Properties'),
    '@traits'     : require('./processor/annotation/Traits'),
    '@requires'   : require('./processor/annotation/Requires'),
    '@talents'    : require('./processor/annotation/Talents'),
    '@annotation' : require('./processor/annotation/Annotation'),
    '@exports'    : require('./processor/annotation/Exports'),
    '@static'     : require('./processor/annotation/Static'),
};

//register processors
cocktail.registerProcessors(cocktail._DEFAULT_PROCESSORS);

/**
 * @public
 * SEQUENCE is used to define an enumeration of priorities for annotations
 */
 cocktail.SEQUENCE = sequence;

},{"./processor/NoOp":8,"./processor/annotation/Annotation":9,"./processor/annotation/Exports":10,"./processor/annotation/Extends":11,"./processor/annotation/Merge":12,"./processor/annotation/Properties":13,"./processor/annotation/Requires":14,"./processor/annotation/Static":15,"./processor/annotation/Talents":16,"./processor/annotation/Traits":17,"./processor/sequence":18}],8:[function(require,module,exports){
/*
 *
 * Copyright (c) 2013 - 2014 Maximiliano Fierro
 * Licensed under the MIT license.
 */
'use strict';

var sequence = require('./sequence'),
    NoOp = function(){};

NoOp.prototype = {
    retain   : false,
    priority : sequence.NO_OP,
    name     : 'noOp',

    setParameter: function(){},
    getParameter: function(){}
};

module.exports = NoOp;
},{"./sequence":18}],9:[function(require,module,exports){
/*
 *
 * Copyright (c) 2013 - 2014 Maximiliano Fierro
 * Licensed under the MIT license.
 */
'use strict';


var sequence = require('../sequence'),
    Annotation = function(){};

Annotation.prototype = {
    retain   : false,
    priority : sequence.ANNOTATION,
    name     : '@annotation',

    _value: undefined,

    setParameter: function(value){
        this._value = value;
    },

    getParameter: function() {
        return this._value;
    },

    process: function(subject){
        var name = '@'+this.getParameter();

        subject.prototype.name = name;
    }

};

module.exports =  Annotation;

},{"../sequence":18}],10:[function(require,module,exports){
/*
 *
 * Copyright (c) 2013 - 2014 Maximiliano Fierro
 * Licensed under the MIT license.
 */
'use strict';


var sequence = require('../sequence'),
    Exports = function(){};

Exports.prototype = {
    retain   : false,
    priority : sequence.EXPORTS,
    name     : '@extends',

    _parameter: undefined,


    setParameter: function(value) {
        this._parameter = value;
    },

    getParameter: function() {
        return this._parameter;
    },

    process: function(subject /*, proto*/){
        var value = this.getParameter();
        
        if(value && typeof value === 'object'){
            value['exports'] = subject;    
        }
    }
};

module.exports = Exports;
},{"../sequence":18}],11:[function(require,module,exports){
/*
 *
 * Copyright (c) 2013 - 2014 Maximiliano Fierro
 * Licensed under the MIT license.
 */
'use strict';


var sequence = require('../sequence'),
    Extends = function(){};

Extends.prototype = {
    retain   : false,
    priority : sequence.EXTENDS,
    name     : '@extends',

    _parameter: undefined,

    setParameter: function(value){
        if(typeof value !== 'function'){
            throw new Error("Object cannot be extended");
        }
        this._parameter = value;
    },

    getParameter: function() {
        return this._parameter;
    },

    process: function(subject){
        var parent = this.getParameter(),
            sp;

        subject.prototype = sp = Object.create(parent.prototype);

        sp.$super = parent;

        sp.callSuper = function(methodName){
            var mthd = this.$super.prototype[methodName],
                mthdArgs = Array.prototype.slice.call(arguments, 1);
            if(!mthd){
               throw new Error("There is no method named " + mthd + " in parent class.");
            }
            return mthd.apply(this, mthdArgs);
        };
    }

};

module.exports = Extends;
},{"../sequence":18}],12:[function(require,module,exports){
/*
 *
 * Copyright (c) 2013 - 2014 Maximiliano Fierro
 * Licensed under the MIT license.
 */
'use strict';

var sequence = require('../sequence'),
    Merge;


/**
 * @constructor
 */
Merge = function(options) {
    var useProto;
    if(options) {
        useProto = options.usePrototypeWhenSubjectIsClass;
        this._usePrototypeWhenSubjectIsClass = (useProto === false) ? useProto : true;
    }
};

Merge.prototype = {
    retain   : false,
    priority : sequence.MERGE,
    name     : '@merge',

    _parameter   : undefined,

    _usePrototypeWhenSubjectIsClass: true,

    _strategies: {
        'single'     : '_mergeMine',
        'mine'       : '_mergeMine',
        'their'      : '_mergeTheir',
        'deep-mine'  : '_mergeDeepMine',
        'deep-their' : '_mergeDeepTheir'
    },

    setParameter: function(value){
        this._parameter = value;
    },

    getParameter: function() {
        return this._parameter;
    },

    /**
     * mine merge strategy: mine params over their. If params is already defined it gets overriden.
     */
    _mergeMine : function(mine, their){
        var key;

        for(key in their){
            if(their.hasOwnProperty(key)){
                mine[key] = their[key];
            }
        }

        return mine;
    },


     /**
     * deepMine merge strategy: mine params over their. 
     * If params is already defined and it is an object it is merged with strategy mine,
     * if params is already defined and it is an array it is concatenated,
     * otherwise it gets overriden with mine.
     */
     _mergeDeepMine : function(mine, their){
        return this._mergeDeep(mine, their, this._mergeMine);
    },

    /**
     * their merge strategy: their params over mine. If params is already defined it doesn't get overriden.
     */
    _mergeTheir : function(mine, their){
        var key;

        for(key in their){
            if(their.hasOwnProperty(key) && mine[key] === undefined ){
                mine[key] = their[key];
            }
        }

        return mine;        
    },


     /**
     * deepMine merge strategy: their params over mine. 
     * If params is already defined and it is an object it is merged with strategy their,
     * if params is already defined and it is an array it is concatenated,
     * otherwise it gets overriden with mine.
     */
     _mergeDeepTheir : function(mine, their){
        return this._mergeDeep(mine, their, this._mergeTheir);
    },    

    /**
     * runs the deep merge using the given strategy
     */
    _mergeDeep: function(mine, their, strategy){
        var key;

        for(key in their){
            if(their.hasOwnProperty(key)){
                if(typeof their[key] === "object"){
                    if(their[key] instanceof Array){
                        mine[key] = [].concat(mine[key], their[key]);
                    }else{
                        mine[key] = strategy(mine[key], their[key]);
                    }
                }else if(mine[key] === undefined ){
                    mine[key] = their[key];
                }
            }
        }
        return mine;
    },

    _shouldUsePrototypeWhenSubjectIsClass: function() {
        return this._usePrototypeWhenSubjectIsClass;
    },

    process: function(subject, options){
        var their = options,
            useProto = this._shouldUsePrototypeWhenSubjectIsClass(),
            mine = (useProto && subject.prototype) || subject,
            strategy = this._strategies[this.getParameter()];

        this[strategy](mine, their);
    }
};

module.exports = Merge;

},{"../sequence":18}],13:[function(require,module,exports){
/*
 *
 * Copyright (c) 2013 - 2014 Maximiliano Fierro
 * Licensed under the MIT license.
 */
'use strict';


var sequence = require('../sequence'),
    Properties = function(){};

Properties.prototype = {
    retain   : false,
    priority : sequence.PROPERTIES,
    name     : '@properties',

    _parameter: undefined,

    setParameter: function(value){
        if(Object.prototype.toString.call(value) !== '[object Object]'){
             throw new Error('@properties parameter should be an Object');
        }
        this._parameter = value;
    },

    getParameter: function() {
        return this._parameter;
    },

    _capitalizeName: function(name){
        return (name.charAt(0).toUpperCase() + name.slice(1));
    },

    _getterName: function(property, value){
        return (value !== false && value !== true ? 'get' : 'is') + this._capitalizeName(property);
    },

    _setterName: function(property){
        return 'set' + this._capitalizeName(property);
    },

    _createPropertyFor: function(subject, name, value, doNotOverride){

        if (typeof subject[name] === 'undefined' || doNotOverride !== true) {
            subject[name] = value;
        }
        subject[this._getterName(name, value)] = function(){
            return this[name];
        };
        subject[this._setterName(name)] = function(value){
            this[name] = value;
        };
    },

    process: function(subject){
        var properties = this.getParameter(),
            isObject = !(subject.prototype),
            key;

        for(key in properties){
            if(properties.hasOwnProperty(key)){
                this._createPropertyFor(subject.prototype || subject, key, properties[key], isObject);
            }
        }
    }

};

module.exports = Properties;

},{"../sequence":18}],14:[function(require,module,exports){
/*
 *
 * Copyright (c) 2013 - 2014 Maximiliano Fierro
 * Licensed under the MIT license.
 */
'use strict';


var sequence = require('../sequence'),
    Requires = function(){};

Requires.requiredMethod = function $$required$$(){ throw new Error('method is marked as required but it has not been defined');};

Requires.prototype = {
    retain   : false,
    priority : sequence.REQUIRES,
    name     : '@requires',

    _parameter: [],

    setParameter: function(value){
        //TODO: validate parameter
        this._parameter = [].concat(value);
    },

    getParameter: function() {
        return this._parameter;
    },

    process: function(subject){
        var reqs = this.getParameter(), // always an []
            l = reqs.length,
            i;

        for(i = 0; i < l; i++){
            this._createRequiredMethod(subject, reqs[i]);
        }
    },

    _createRequiredMethod: function(sub, methodName){
        var subject = (sub.prototype || sub);
        
        if(!subject[methodName]){
            subject[methodName] = Requires.requiredMethod;
        }
        
    }

};

module.exports = Requires;

},{"../sequence":18}],15:[function(require,module,exports){
/*
 *
 * Copyright (c) 2013 - 2014 Maximiliano Fierro
 * Licensed under the MIT license.
 */
'use strict';


var sequence = require('../sequence'),
    Merge    = require('./Merge'),
    Static   = function(){};

Static.prototype = {
    retain   : false,
    priority : sequence.POST_MERGE,
    name     : '@static',

    _parameter: undefined,

    setParameter: function(value){
        if(Object.prototype.toString.call(value) !== '[object Object]'){
             throw new Error('@static parameter should be an Object');
        }
        this._parameter = value;
    },

    getParameter: function() {
        return this._parameter;
    },

    process: function(subject){
        var statics = this.getParameter(),
            merger  = new Merge({usePrototypeWhenSubjectIsClass: false});

        merger.setParameter('mine');

        merger.process(subject, statics);

    }

};

module.exports = Static;

},{"../sequence":18,"./Merge":12}],16:[function(require,module,exports){
/*
*
* Copyright (c) 2013 - 2014 Maximiliano Fierro
* Licensed under the MIT license.
*/
'use strict';


var Traits = require('./Traits'),
	Talents;

Talents = function(){
	Traits.call(this);
};

Talents.prototype = Object.create(Traits.prototype);

Talents.prototype._applyTalentTo = Traits.prototype._applyTraitTo;

Talents.prototype.process = function(subject){
	var traits = this.getParameter(), // always an []
		l = traits.length,
		i;

	for(i = 0; i < l; i++){
		this._applyTalentTo(subject, traits[i]);
	}
};

module.exports = Talents;

},{"./Traits":17}],17:[function(require,module,exports){
/*
 *
 * Copyright (c) 2013 - 2014 Maximiliano Fierro
 * Licensed under the MIT license.
 */
'use strict';


var sequence = require('../sequence'),
    Requires = require('./Requires'),
    Traits = function(){};

Traits.prototype = {
    retain   : false,
    priority : sequence.TRAITS,
    name     : '@traits',

    _parameter: [],

    setParameter: function(value){
        //TODO: validate parameter
        this._parameter = [].concat(value);
    },

    getParameter: function() {
        return this._parameter;
    },

    process: function(subject){
        var traits = this.getParameter(), // always an []
            l = traits.length,
            i;

        for(i = 0; i < l; i++){
            this._applyTraitTo(subject.prototype || subject, traits[i]);
        }
    },

    _applyTraitTo: function(subject, options){
        var key, tp, excluded, aliases, alias,t;

        if(typeof options === 'function'){
           return this._applyTraitTo(subject, {trait: options});
        }

        excluded = [].concat(options.excludes);
        aliases = options.alias || {};
        t = options.trait || options.talent;
        tp = t.prototype;

        for(key in tp){

            this._raiseErrorIfItIsState(key, tp);
            
            if(excluded.indexOf(key) === -1){
                alias = aliases[key] || key;

                this._raiseErrorIfConflict(alias, subject, tp);
                
                if(!subject[alias] || subject[alias] === Requires.requiredMethod){
                    subject[alias] = tp[key]; 
                }
            }
        }
    },

    _raiseErrorIfItIsState: function(key, traitProto){
        if(typeof traitProto[key] !== 'function'){
            throw new Error('Trait MUST NOT contain any state. Found: ' + key + ' as state while processing trait');
        }
    },

    _raiseErrorIfConflict: function(methodName, subjectProto, traitProto){
        var requiredMethodName = Requires.requiredMethod.name,
            subjectMethod = subjectProto[methodName],
            traitMethod = traitProto[methodName],
            sameMethodName = (subjectMethod && traitMethod),
            methodsAreNotTheSame = sameMethodName && (subjectMethod !== traitMethod),
            traitMethodIsNotARequired = sameMethodName && (traitMethod.name !== requiredMethodName),
            subjecMethodIsNotARequired = sameMethodName && (subjectMethod.name !== requiredMethodName);


        if(sameMethodName && methodsAreNotTheSame && traitMethodIsNotARequired && subjecMethodIsNotARequired){
            throw new Error('Same method named: ' + methodName + ' is defined in trait and Class.' );
        }
    }
};

module.exports = Traits;
},{"../sequence":18,"./Requires":14}],18:[function(require,module,exports){
/*
 *
 * Copyright (c) 2013 - 2014 Maximiliano Fierro
 * Licensed under the MIT license.
 */
 "use strict";

/**
 * sequence list
  The processors will use one of the defined priorities in this list
 
  The priorities are organized in groups:

  [-1]      No Op. 
  [1..99)   Object/Class creation.
  [99..999) Merge - Traits and talents are considered merge stage since we copy the structure into the subject.
  [999..)   Miscelaneous - Annotation definition makes no changes over the Subject itself.
 
 */

module.exports = {
    NO_OP           : -1,

    PRE_EXTENDS     : 9,
    EXTENDS         : 10,
    POST_EXTENDS    : 11,

    PRE_PROPERTIES  : 19,
    PROPERTIES      : 20,
    POST_PROPERTIES : 21,

    PRE_REQUIRES    : 29,
    REQUIRES        : 30,
    POST_REQUIRES   : 31,    

    PRE_MERGE       : 99,
    MERGE           : 100,
    POST_MERGE      : 101,

    PRE_TRAITS      : 109,
    TRAITS          : 110,
    POST_TRAITS     : 111,

    PRE_ANNOTATION  : 999,
    ANNOTATION      : 1000,
    POST_ANNOTATION : 1001,

    PRE_EXPORTS     : 1009,
    EXPORTS         : 1010,
    POST_EXPORTS    : 1011

};


},{}],19:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"./processor/NoOp":20,"./processor/annotation/Annotation":21,"./processor/annotation/Exports":22,"./processor/annotation/Extends":23,"./processor/annotation/Merge":24,"./processor/annotation/Properties":25,"./processor/annotation/Requires":26,"./processor/annotation/Static":27,"./processor/annotation/Talents":28,"./processor/annotation/Traits":29,"./processor/sequence":30,"/Users/elmasse/Projects/node/cement/node_modules/cocktail-trait-advisable/node_modules/cocktail/lib/cocktail.js":7}],20:[function(require,module,exports){
module.exports=require(8)
},{"./sequence":30,"/Users/elmasse/Projects/node/cement/node_modules/cocktail-trait-advisable/node_modules/cocktail/lib/processor/NoOp.js":8}],21:[function(require,module,exports){
module.exports=require(9)
},{"../sequence":30,"/Users/elmasse/Projects/node/cement/node_modules/cocktail-trait-advisable/node_modules/cocktail/lib/processor/annotation/Annotation.js":9}],22:[function(require,module,exports){
module.exports=require(10)
},{"../sequence":30,"/Users/elmasse/Projects/node/cement/node_modules/cocktail-trait-advisable/node_modules/cocktail/lib/processor/annotation/Exports.js":10}],23:[function(require,module,exports){
module.exports=require(11)
},{"../sequence":30,"/Users/elmasse/Projects/node/cement/node_modules/cocktail-trait-advisable/node_modules/cocktail/lib/processor/annotation/Extends.js":11}],24:[function(require,module,exports){
/*
 *
 * Copyright (c) 2013 - 2014 Maximiliano Fierro
 * Licensed under the MIT license.
 */
'use strict';

var sequence = require('../sequence'),
    Merge;


/**
 * @constructor
 */
Merge = function(options) {
    var useProto;
    if(options) {
        useProto = options.usePrototypeWhenSubjectIsClass;
        this._usePrototypeWhenSubjectIsClass = (useProto === false) ? useProto : true;
    }
};

Merge.prototype = {
    retain   : false,
    priority : sequence.MERGE,
    name     : '@merge',

    _parameter   : undefined,

    _usePrototypeWhenSubjectIsClass: true,

    _strategies: {
        'single'     : '_mergeMine',
        'mine'       : '_mergeMine',
        'their'      : '_mergeTheir',
        'deep-mine'  : '_mergeDeepMine',
        'deep-their' : '_mergeDeepTheir',
        'properties' : '_mergeOnlyProperties'
    },

    setParameter: function(value){
        this._parameter = value;
    },

    getParameter: function() {
        return this._parameter;
    },

    /**
     * mine merge strategy: mine params over their. If params is already defined it gets overriden.
     */
    _mergeMine : function(mine, their){
        var key;

        for(key in their){
            if(their.hasOwnProperty(key)){
                mine[key] = their[key];
            }
        }

        return mine;
    },

    _mergeOnlyProperties : function (mine, their){
        var key;

        for(key in their){
            if(their.hasOwnProperty(key) && typeof their[key] !== "function"){
                mine[key] = their[key];
            }
        }

        return mine;
    },

     /**
     * deepMine merge strategy: mine params over their. 
     * If params is already defined and it is an object it is merged with strategy mine,
     * if params is already defined and it is an array it is concatenated,
     * otherwise it gets overriden with mine.
     */
     _mergeDeepMine : function(mine, their){
        return this._mergeDeep(mine, their, this._mergeMine);
    },

    /**
     * their merge strategy: their params over mine. If params is already defined it doesn't get overriden.
     */
    _mergeTheir : function(mine, their){
        var key;

        for(key in their){
            if(their.hasOwnProperty(key) && mine[key] === undefined ){
                mine[key] = their[key];
            }
        }

        return mine;        
    },


     /**
     * deepMine merge strategy: their params over mine. 
     * If params is already defined and it is an object it is merged with strategy their,
     * if params is already defined and it is an array it is concatenated,
     * otherwise it gets overriden with mine.
     */
     _mergeDeepTheir : function(mine, their){
        return this._mergeDeep(mine, their, this._mergeTheir);
    },    

    /**
     * runs the deep merge using the given strategy
     */
    _mergeDeep: function(mine, their, strategy){
        var key;

        for(key in their){
            if(their.hasOwnProperty(key)){
                if(typeof their[key] === "object"){
                    if(their[key] instanceof Array){
                        mine[key] = [].concat(mine[key], their[key]);
                    }else{
                        mine[key] = strategy(mine[key], their[key]);
                    }
                }else if(mine[key] === undefined ){
                    mine[key] = their[key];
                }
            }
        }
        return mine;
    },

    _shouldUsePrototypeWhenSubjectIsClass: function() {
        return this._usePrototypeWhenSubjectIsClass;
    },

    process: function(subject, options){
        var their = options,
            useProto = this._shouldUsePrototypeWhenSubjectIsClass(),
            mine = (useProto && subject.prototype) || subject,
            strategy = this._strategies[this.getParameter()];

        this[strategy](mine, their);
    }
};

module.exports = Merge;

},{"../sequence":30}],25:[function(require,module,exports){
module.exports=require(13)
},{"../sequence":30,"/Users/elmasse/Projects/node/cement/node_modules/cocktail-trait-advisable/node_modules/cocktail/lib/processor/annotation/Properties.js":13}],26:[function(require,module,exports){
module.exports=require(14)
},{"../sequence":30,"/Users/elmasse/Projects/node/cement/node_modules/cocktail-trait-advisable/node_modules/cocktail/lib/processor/annotation/Requires.js":14}],27:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"../sequence":30,"./Merge":24,"/Users/elmasse/Projects/node/cement/node_modules/cocktail-trait-advisable/node_modules/cocktail/lib/processor/annotation/Static.js":15}],28:[function(require,module,exports){
arguments[4][16][0].apply(exports,arguments)
},{"./Traits":29,"/Users/elmasse/Projects/node/cement/node_modules/cocktail-trait-advisable/node_modules/cocktail/lib/processor/annotation/Talents.js":16}],29:[function(require,module,exports){
/*
 *
 * Copyright (c) 2013 - 2014 Maximiliano Fierro
 * Licensed under the MIT license.
 */
'use strict';


var sequence = require('../sequence'),
    Requires = require('./Requires'),
    Traits = function(){};

Traits.prototype = {
    retain   : false,
    priority : sequence.TRAITS,
    name     : '@traits',

    _parameter: [],

    setParameter: function(value){
        //TODO: validate parameter
        this._parameter = [].concat(value);
    },

    getParameter: function() {
        return this._parameter;
    },

    process: function(subject){
        var traits = this.getParameter(), // always an []
            l = traits.length,
            i;

        for(i = 0; i < l; i++){
            this._applyTraitTo(subject.prototype || subject, traits[i]);
        }
    },

    _applyTraitTo: function(subject, options){
        var key, tp, excluded, aliases, alias,t;

        if(typeof options === 'function'){
           return this._applyTraitTo(subject, {trait: options});
        }

        excluded = [].concat(options.excludes);
        aliases = options.alias || {};
        t = options.trait || options.talent;
        tp = t.prototype;

        for(key in tp){

            this._raiseErrorIfItIsState(key, tp);
            
            if(excluded.indexOf(key) === -1){
                alias = aliases[key] || key;

                this._raiseErrorIfConflict(alias, subject, tp);
                
                if(!subject[alias] || subject[alias] === Requires.requiredMethod){
                    subject[alias] = tp[key]; 
                }
            }
        }
    },

    _raiseErrorIfItIsState: function(key, traitProto){
        if(typeof traitProto[key] !== 'function'){
            throw new Error('Trait MUST NOT contain any state. Found: ' + key + ' as state while processing trait');
        }
    },

    _raiseErrorIfConflict: function(methodName, subjectProto, traitProto){
        var requiredMethodName = Requires.requiredMethod.name,
            subjectMethod = subjectProto[methodName],
            traitMethod = traitProto[methodName],
            sameMethodName = (subjectMethod && traitMethod),
            methodsAreNotTheSame = sameMethodName && (subjectMethod.toString() !== traitMethod.toString()),
            traitMethodIsNotARequired = sameMethodName && (traitMethod.name !== requiredMethodName),
            subjecMethodIsNotARequired = sameMethodName && (subjectMethod.name !== requiredMethodName);


        if(sameMethodName && methodsAreNotTheSame && traitMethodIsNotARequired && subjecMethodIsNotARequired){
            throw new Error('Same method named: ' + methodName + ' is defined in trait and Class.' );
        }
    }
};

module.exports = Traits;
},{"../sequence":30,"./Requires":26}],30:[function(require,module,exports){
module.exports=require(18)
},{"/Users/elmasse/Projects/node/cement/node_modules/cocktail-trait-advisable/node_modules/cocktail/lib/processor/sequence.js":18}],"/lib/cement.js":[function(require,module,exports){
'use strict';

var cocktail = require('cocktail');

cocktail.use(require('./annotation/delegates'));
cocktail.use(require('./annotation/element'));
cocktail.use(require('./annotation/prototype'));
cocktail.use(require('./annotation/stylesheet'));

cocktail.mix(cocktail, {
    '@exports': module,
    // lets always define classes with cement
    _isClassDefition: function () {
        return true;
    }
});

},{"./annotation/delegates":1,"./annotation/element":2,"./annotation/prototype":3,"./annotation/stylesheet":4,"cocktail":19}]},{},[]);
