var get = require('request').get,
    async = require('async'),
    writeFile = require('fs').writeFile,
    helper = require('./helper')

function asyncWaterfall(done) {
  async.waterfall([step1, wrapCallbackHandler(businessLogic), step2], done)
}

// get the time
function step1(next) {
  get(helper.serviceURI, next)
}

// business logic
function businessLogic(response, body) {
  if (response.statusCode === 200) {
    return body
  }
  throw new Error('response status code is not 200')  
}

// write the content
function step2(data, next) {
  writeFile(helper.fileName, data, next)
}

helper.test(asyncWaterfall)

/*  A generatore to wrap a fn that returns a simple value into one that sends
    return value to a callback provided as the last argument. The wrapped
    function fn is expected to throw an exception to signify an error condition.
    Originally, it was coded specifically for this use case:

      function decisionAdapter(response, body, next) {
        next(null, businessLogic(response, body))
      }

    Is this available in a library?
*/
function wrapCallbackHandler(fn) {
  return function() {
    // the last argument is the callback, if we get here, there's no error
    arguments[arguments.length - 1](null, fn.apply(null, arguments))
  }
}

