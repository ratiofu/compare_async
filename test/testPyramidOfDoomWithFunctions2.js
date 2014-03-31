var get = require('request').get,
    writeFile = require('fs').writeFile,
    helper = require('./helper')

// chaining callbacks, with actual functions and a combined 'result processor'

function combinedLogicAndStep2CallbackPattern(error, response, body, next) {
  if (businessLogic(error, response)) {
    step2(body, next)
  } else {
    next(error)
  }  
}

function pyramidOfDoomWithFunctions2(done) {
  step1(function(error, response, body) {
    combinedLogicAndStep2CallbackPattern(error, response, body, done)  
  })
}

// get the time
function step1(next) {
  get(helper.serviceURI, next)
}

// a decision function
function businessLogic(error, response) {
  return !error && response.statusCode === 200
}

// write the content
function step2(data, next) {
  writeFile(helper.fileName, data, next)
}

helper.test(pyramidOfDoomWithFunctions2)
