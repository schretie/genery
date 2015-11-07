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

