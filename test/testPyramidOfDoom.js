var get = require('request').get,
    writeFile = require('fs').writeFile,
    helper = require('./helper')

function pyramidOfDoom(done) {
  get(helper.serviceURI, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      writeFile(helper.fileName, body, done)
    } else {
      done(error)
    }  
  })
}

helper.test(pyramidOfDoom)
