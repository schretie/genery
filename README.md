# genery

ES6 Generator flow engine, goodies, express and mocha generator wrapper

## Description

Genery rely on Generator and Promise introduced by ES6 and available in nodeJs from version 0.12  

Genery provides a generator flow engine that aims to execute a generator function, where yielded functions are Promised  
```js
var myGenerator = function *(){
  yield aFirstPromiseFct();

  yield aSecondPromiseFct();

  // etc...
    
}

genery(myGenerator);
```

Genery return a Promise from the generator (that can be yielded again,...):
```js
var promiseOfMyGenerator = genery(myGenerator);
promiseOfMyGenerator
    .then(function(){
        console.log('executing done');
    })
    .catch(function(err){
        console.log('some error occurs: '+err);
    });
```

In addition, genery provides some goodies to run your generator:

* Support of Continuation Local Storage
* Generator based all, map, reduce and filter
* Express generator wrapper, allow usage of generator instead of express callback
* Mocha generator wrapper, allow usage of generator and yield in unit testing

## Installation

```
npm install genery
```
## Before Starting
All the example bellow are available in the folder test/doc.js in Git

## Getting Started
The gerery API must be used as follow to execute a generator that yield promise:

```js

var g = require('genery')

// A dummy promise to execute
var promiseFunction = function(param) {
    return new Promise(function(resolve, reject) {
        resolve(param);
    });
};

// now execute a generator that use the Promise
g(function* () {
  var result1 = yield promiseFunction('hello');

  var result2 = yield promiseFunction(' genery');

  return result1+result2;
}).then(function (value) {
  // log 'hello genery'
  console.log(value);
});
```

the 'g' function take a generator function in input and will 'orchestrate' the execution of the generator function for you and return back a promise.


## How to pass arguments to the generator
It is usefull to pass some arguments to the generator function to executem to do such genery allow to pass arguments that will be used to execute the generator function.
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
### API
var promise = g(function *, [arg1, ...])

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

### API
var promise = g.all(Array of function *)

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

### API
var promise = g.map(Array to map, mapper function *)

var promise = g.reduce(Array of result to reduce, reducer function *)


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
var promise = g.map(Array to filter, filter function *)

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

### API
var promise = g.call(context, function *, [arg1, ...])

## context management / Continuation Local Storage
The drawback with yield * is the 'this' of the caller is lost.  
To overcome this limitation, genery  manage a global context.  
Once the g() or g.call() is invoke, genery 'save' the this and assign it to a global variable before each call to the next() function of the generator.  
The global context can be access using g.currentContext  
To explain it simply, it provides a 'Continuation Local Storage' (also known as Thread Local in Java: https://en.wikipedia.org/wiki/Thread-local_storage)  

Main usage of this functionality is to handle context information for logging accross inner call

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
        sessionId: 2354,
        event: 'PROCESS'
    }
}

yield g.call(context, generator);

will output:
[INFO] {"sessionId":2354,"event":"PROCESS"} call sub generator 1
[INFO] {"sessionId":2354,"event":"PROCESS"} call sub-sub generator 
[INFO] {"sessionId":2354,"event":"PROCESS"} call process
[INFO] {"sessionId":2354,"event":"PROCESS"} process
[INFO] {"sessionId":2354,"event":"PROCESS"} process
[INFO] {"sessionId":2354,"event":"PROCESS"} call sub generator 2
[INFO] {"sessionId":2354,"event":"PROCESS"} call sub-sub generator 
[INFO] {"sessionId":2354,"event":"PROCESS"} call process
[INFO] {"sessionId":2354,"event":"PROCESS"} process


```
### API
var context = g.currentContext

## Express wrapper

You can ask genery to wrapp express to allow the use of generator as follow:
```js
var app = express();
var g_app = g.express(app)
```

now we can use the wrapper as follow

```js
server = yield g_app.listen(3000);

app.get('/test1', function * (req, res) {
    var response = yield promiseFunction(req.query.value);

    res.send(response);
});

// etc...
```

here is the list of express API that support generator:
### API
app.METHOD(path, function * [, function * ...])

Method supported:

* checkout
* connect
* copy
* delete
* get
* head
* lock
* merge
* mkactivity
* mkcol
* move
* m-search
* notify
* options
* patch
* post
* propfind
* proppatch
* purge
* put
* report
* search
* subscribe
* trace
* unlock
* unsubscribe

in addition:  
app.use([path,] function * [, function *...])  
app.engine(ext, callback)

## mocha

Genery provides a wrapping of mocha to use generator in unit test.

```js
var g = require('genery');
var mocha = g.mocha;
describe('myTest', function() {
    mocha.before(function * (done) {
        console.log('start')
        
        yield aPromise();

        done();
    });
    
    mocha.it('a test', function * (done) {
        yield thePromise();

        done()
    });
    
    mocha.after(function * (done) {
        yield anOtherPromise();
        
        done()
    });
});
```
