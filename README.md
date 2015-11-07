# genery

Generator async engine for promise

To install genery

```
npm install genery
```

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

