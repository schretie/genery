# genery

Generator async engine for promise

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

To install genery

```
npm install genery
```
