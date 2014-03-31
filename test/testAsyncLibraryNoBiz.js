var get = require('request').get,
    async = require('async'),
    writeFile = require('fs').writeFile,
    helper = require('./helper')

function asyncWaterfall(done) {
  async.waterfall([step1, step2], done)
}

// get the time
function step1(next) {
  get(helper.serviceURI, next)
}

// business logic
function filter(response, body) {
  if (response.statusCode === 200) {
    return body
  }
  throw new Error('response status code is not 200')  
}

// write the content
function step2(response, body, next) {
  writeFile(helper.fileName, filter(response, body), next)
}

helper.test(asyncWaterfall)
