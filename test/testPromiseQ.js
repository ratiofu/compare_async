var get = require('request').get,
    Q = require('q'),
    writeFile = require('fs').writeFile,
    helper = require('./helper')

function promisesWithQ(done) {
  step1()
    .then(businessLogic)
    .then(step2)
    .done(done)
}

// get the time
function step1() {
  return Q.nfcall(get, helper.serviceURI)
}

// business logic
function businessLogic(response) {
  if (response[0].statusCode === 200) {
    return response[1]
  }
  throw new Error('response status code is not 200')
}

// write the content
function step2(data) {
  return Q.nfcall(writeFile, helper.fileName, data)
}

helper.test(promisesWithQ)
