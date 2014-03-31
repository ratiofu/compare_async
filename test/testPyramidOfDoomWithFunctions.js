var get = require('request').get,
    writeFile = require('fs').writeFile,
    helper = require('./helper')

function pyramidOfDoomWithFunctions(done) {
  step1(function(error, response, body) {
    if (businessLogic(error, response)) {
      step2(body, done)
    } else {
      done(error)
    }  
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

helper.test(pyramidOfDoomWithFunctions)
