Compare Asynchronous Programming Patterns in JavaScript/NodeJS
==============================================================

[Wat?]
------

Asynchronous programming can quickly devolve into a *mess*, often referred to as the [pyramid of doom], where

> code marches to the right faster than it marches forward.
<sup>[1]</sup>

To explore patterns of asynchronous programming in JavaScript, the following "tool" is coded using several different styles:

 1. The aformentioned [pyramid of doom]
 2. A cleaned-up version of it breaking steps up into functions
 3. A further refactoring that nests refactored functions
 4. the [async] library
 5. the [q] library, including the necessary refactorings

The tool simply

 1. [request]s the current time from a [time service] and
 2. [writes the response] to the local file system

Both of these are asynchronous operations and the provided implementions of each follow the [node.js] convention of expecting callbacks of the form:

```JavaScript
callback(err[, data[, ...]])
```

An important aspect of this test setup is that the first step–the [request]–returns 2 arguments, a response and body, which need to be passed correctly to a synchronous function that performs some 'logic' on it. All implementations below are wrapped in an appropriately named function that takes a single `done` callback so it can be executed as an asynchronous test in [Mocha].

Note that there's no actual module code here, just a bunch of tests in the `test` folder.

Observations
------------

Before going into detail about each approach, a couple observations up front:
1. Break every step or operation into as small of a function as possible and reasonable; it will make recomposition much easier.
2. **DRY, I mean really don't repeat yourself.** The moment you find yourself copying and pasting *anything* or typing the same thing twice, refactor it into a function (see above), object, or variable.
3. Use closure factories and other functional programming features to compose functionality.
4. Specifically, package synchronous business logic into associated asynchronous functions or wrap it to make it pseudo-asynchronous, i.e. making it follow the aformentioned node callback style.

Plain Chained (or nested) Callbacks
-----------------------------------

The trivial implementation is relatively straight-forward and still somewhat remotely readable:

```JavaScript
function pyramidOfDoom(done) {
  get(helper.serviceURI, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      writeFile(helper.fileName, body, done)
    } else {
      done(error)
    }  
  })
}
```
The drawbacks of using this approach in general can already be observed here:

 1. This will be difficult to test each execution branch of this code. There's no way to stub out the request or the writing of the file from outside the module (unless the associated methods where made exports, which is a really bad idea).
 2. Each 'step' in this function is essentially a 1-liner. If these were more complex steps to get the result, apply some business logic, or publish the result somewhere, to code would quickly become a lot less readable. 

 A possible workaround for this is shown in the second version using chained callbacks:

```JavaScript
function pyramidOfDoomWithFunctions(done) {
  step1(function(error, response, body) {
    if (businessLogic(error, response)) {
      step2(body, done)
    } else {
      done(error)
    }  
  })
ß}
```

Here, some of the functionality has been refactored into separate functions that have been reduced to taking the callbacks. Those functions could be provided by objects that are parameterized appropriately, but it's not clear that this is really improving readability. In addition, because the `businessLogic` method does not take a callback, an anonymous function to propagate the chain has to be used, which results in code that is not really any more comprehensible/traceable than the first version. Refactoring out this method, too, improves things a little bit

```JavaScript
function pyramidOfDoomWithFunctions2(done) {
  step1(function(error, response, body) {
    combinedLogicAndStep2CallbackPattern(error, response, body, done)  
  })
}
```

but we're really just shifting verbose code from one place in the source to another.

async module
------------

Let's see how (whether) the async library can help with this spaghetti code, using the method [async.waterfall]. The first thing to understand is that error conditions are handled automatically and passed to the ultimate error handler–if one is provided–in the standard `callback(err, result)` format. That means the `businessLogic` method doesn't have to check for the error condition anymore and can be simplified to deal with the *actual business* of validating the response:

```JavaScript
function businessLogic(response, body) {
  if (response.statusCode === 200) {
    return body
  }
  throw new Error('response status code is not 200')  
}
```

This is arguably a clearer implementation, only dependent on information that actually matters for this piece of code. The problem with this, as with the previous approaches, is that this implementation doesn't actually handle callbacks. A general wrapping function is provided to solve this, which could also be used by the previous examples:

```JavaScript
function wrapCallbackHandler(fn) {
  return function() {
    // the last argument is the callback, if we get here, there's no error
    arguments[arguments.length - 1](null, fn.apply(null, arguments))
  }
}
```

It turns the provided function into one that sends the results of it being invoked in the common invocation style to the last argument.

q module
--------

is just one of several libraries adding Promise support to Node. Be aware of [Promise anti-patterns]! The key concept here is how to [convert Node.js-style callbacks into Promises]. Wrapping synchronous code is handled automatically by the library, but multiple arguments are always provided as arrays to the callee and not flattened back out into positional arguments. In the code provided, the business logic method was refactored to use an array. A helper function to flatten the argument array would be trivial. The asynchronous methods had to be converted to returning a promise, using the helper function [nfcall] provided by Q:

```JavaScript
function step1() {
  return Q.nfcall(get, helper.serviceURI)
}
```

Handling Business Logic
-----------------------

Arguably, the issue contributing to complexity in the asynchronous flow control the most–at least in this example–is the incorporation of synchronous business logic. In all cases but the initial, trivial, nested code, the business logic will have to be transformed into a style that fits the particular approach to handling asynchronicity. For the callback-based approaches, a simple wrapper method is provided that helps a bit, and the argument could be made that such a method should be part of the library being used. For Q, a method with a similar goal actually exists, but it is deprecated, doesn't convert the arguments array usually passed around in Q for multiple arguments back into positional arguments, and what it does appears to be done automatically when passing a synchronous value function to `.then()` anyway: [promise.bind].

Ultimately, it is questionable how often synchronous decision logic is actually going to be in a function seperate from all the other asynchronous logic. Several alternatives for composition exist. Concerns of testability and clarity should take priority when making design decisions.

Conclusion
----------

The most popular node modules generally seem to adhere to node's standard callback-passing style. By properly composing custom functions to follow this model, asynchronous helper libraries like [async] can greatly improve readability and robustness of asynchronous code. While ultimately the compositional power using Promises is even greater, they come at the expense of having to translate existing functions into that pattern.

License
-------
WTFPL

[q]:https://github.com/kriskowal/q
[nfcall]:https://github.com/kriskowal/q/wiki/API-Reference#qnfcallfunc-args
[promise.bind]:https://github.com/kriskowal/q/wiki/API-Reference#promisefbindargs-deprecated
[Promise anti-patterns]:https://github.com/petkaantonov/bluebird/wiki/Promise-anti-patterns
[convert Node.js-style callbacks into Promises]:https://github.com/kriskowal/q/wiki/API-Reference#interfacing-with-nodejs-callbacks
[async]:https://github.com/caolan/async
[async.waterfall]:https://github.com/caolan/async#waterfall
[request]:https://github.com/mikeal/request#requestoptions-callback
[time service]:http://www.timeapi.org/utc/now
[writes the response]:http://nodejs.org/api/fs.html#fs_fs_writefile_filename_data_options_callback
[node.js]:http://nodejs.org
[slideshare]:http://www.slideshare.net/domenicdenicola/callbacks-promises-and-coroutines-oh-my-the-evolution-of-asynchronicity-in-javascript
[pyramid of doom]:http://javascriptjabber.com/001-jsj-asynchronous-programming/
[1]:https://github.com/kriskowal/q#readme
[Wat?]:https://www.destroyallsoftware.com/talks/wat
[Mocha]:http://visionmedia.github.io/mocha/