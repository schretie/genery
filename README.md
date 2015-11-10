# genery

Generator async engine for promise

To install genery

```
npm install genery
```
## Before Starting
All the example bellow are available in the folder test/doc.js in Git

## Getting Started
The gerery API must be used as follow to execute a generator that yield promise:

```js

var g = require('genery')

// dummy promise
var promiseFunction = function(param) {
    return new Promise(function(resolve, reject) {
        resolve(param);
    });
};

g(function* () {
  var result1 = yield promiseFunction('hello');

var result2 = yield promiseFunction(' genery');

  return result1+result2;
}).then(function (value) {
  // log 'hello genery'
  console.log(value);
});
```

## How to pass argument to the generator

```js

var generatorFct = function* (arg1,arg2) {
  var result1 = yield promiseFunction(arg1);

  var result2 = yield promiseFunction(arg2);

  return result1+' '+result2;
};

g(generatorFct,'hello','genery')
.then(function (value) {
  // log 'hello genery'
  console.log(value);
});
```

it is equivalent to:

```js

var generatorFct = function* (arg1,arg2) {
  var result1 = yield promiseFunction(arg1);

  var result2 = yield promiseFunction(arg2);

  return result1+' '+result2;
};

g(function *(){
	var value = yield * generatorFct('hello','genery');
	// log 'hello genery'
	console.log(value);
})

```

## how to execute generator function in parallel

Genery provides a function 'all' that takes in parameter a list of generator function
Genery will run them in parralel, and return a promise
Once this promise executed, it return an array containing the execution result of each generator function


```js

var generatorFct1 = function* () {
  var result = yield promiseFunction('hello');

  return result;
};

var generatorFct2 = function* () {
  var result = yield promiseFunction('genery');

  return result;
};

g(function *(){
	var value = yield g.all([generatorFct1,generatorFct2]);
	// log 'hello genery'
	console.log(value[0]+' '+value[1]);
})

// or
g.all([generatorFct1, generatorFct2])
.then(function(value){
	// log 'hello genery'
	console.log(value[0]+' '+value[1]);
});

```
## how to use map/reduce

```js

var mapper = function *(value){
  var result = yield promiseFunction(value);
  return result;
};

var reducer = function *(currentResult,value){
  var result = yield otherPromiseFunction(currentResult,value);
}

g(function * () {
            var mapResult = yield g.map([1, 2, 3, 4, 5, 6, 7, 8, 9], mapper);
            var initialValue = 0;
            var result = yield g.reduce(mapResult, reducer,initialValue);
            console.log('result: '+result);
})

```
## how to use filter
The filter() method filter array value using a generator function

```js
var filterPromise = function(param) {
  return new Promise(function(resolve, reject) {
      if (param > 4) resolve(true);
      else resolve(false);
  });
};

var filter = function * (value) {
  var result = yield filterPromise(value);
  return result;
};

g.filter([10, 2, 13, 14, 3, 16, 7, 0, 9], filter)
// output [10, 13, 14, 16, 7, 9]
.then(console.log)

```

## how to use call
The call() method calls a generator function with a given this value and arguments provided individually.

```js
var context = {
    param1: 'hello',
    param2: ' genery'
}

g.call(context, function * () {
    var result1 = yield promiseFunction(this.param1);

    var result2 = yield promiseFunction(this.param2);

    return result1 + result2;
}).then(function(value) {
    // log 'hello genery'
    console.log(value);
})
```

## context management
The drawback with yield * is the 'this' of the caller is lost.
To overcome this limitation, genery  manage a global context.
Once the g() or g.call() is invoke, genery 'save' the this and assign it to a global variable before each call to the next() function of the generator.
The global context can be access using g.currentContext
To explaim it simply, it provides a 'Continuation Local Storage' (also known as Thread Local in Java: https://en.wikipedia.org/wiki/Thread-local_storage)

On usage of this functionality could be to handle context information for logging

```js
var logger = {
    info: function(message) {
        console.log('[INFO] ' + JSON.stringify(g.currentContext.logInfo) + ' ' + message);
    }
};

// a dumy promise that log using the context
var process = function() {
    logger.info('process');
    return new Promise(function(resolve, reject) {
        resolve();
    });
};

var generator = function * () {
    logger.info('call sub generator 1');
    yield * subGenerator();
    yield process();
    logger.info('call sub generator 2');
    yield * subGenerator();
};

var subGenerator = function * () {
    logger.info('call sub-sub generator ');
    yield * subSubGenerator();
};

var subSubGenerator = function * () {
    logger.info('call process');
    yield process();
};

let context = {
    logInfo: {
        sessionId: index,
        event: 'PROCESS'
    }
}

yield g.call(context, generator);

```


