var get = require('request').get,
    writeFile = require('fs').writeFile,
    helper = require('./helper')

// chaining callbacks using a factory for scope capture
// this could perhaps be refactored into a reusable pattern,
// but that would get us close to what async does

function makeResponseHandler(next, done) {
  return function(error, response, body) {
    if (businessLogic(error, response)) {
      next(body, done)
    } else {
      done(error)
    }
  }
}

function condensedComposition(done) {
  step1(makeResponseHandler(step2, done))
}

// get the time
function step1(next) {
  get(helper.serviceURI, next)
}

// a decision function
function businessLogic(error, response) {
  return !error && response.statusCode === 200
}

function businessLogic2(response) {
  return response.statusCode === 200 ? null : 'response status code is not 200'
}

// write the content
function step2(data, next) {
  writeFile(helper.fileName, data, next)
}

// helper.test(condensedComposition)