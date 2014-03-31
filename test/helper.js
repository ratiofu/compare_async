var fs = require('fs'),
    should = require('should'),
    fileName = '.timestamp',
    serviceURI = 'http://www.timeapi.org/utc/now'

function before() {
  this.timeout(5000)
  try {
    fs.unlinkSync(fileName)
  } catch (e) {}
}

function fileShouldBeThereWithContent(done) {
  return function(err) {
    if (err) {
      done(err)
      return
    }
    fs.existsSync(fileName).should.be.true
    fs.readFileSync(fileName, { encoding: 'utf8' })
      .should.a.String.and.endWith('+00:00')
    done()
  }
}

module.exports = exports = {

  fileName: fileName,

  serviceURI: serviceURI,

  test: function (runner) {
    describe('run an implement strategy', function() {
      beforeEach(before)
      it('stores the current timestamp pulled from a webserver in a local file', function(done) {
        runner(fileShouldBeThereWithContent(done))
      })
    })    
  }

}