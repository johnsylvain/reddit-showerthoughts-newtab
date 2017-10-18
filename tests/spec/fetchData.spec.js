/* global describe, beforeEach, jasmine, spyOn, it, afterEach, expect, App*/
describe("This is a spec for testing the fetchData method of App module", function () {
  describe("Basic setup for fetchData method", function () {
      beforeEach(function() {
        this.app = new App();
        var url = 'https://www.xyz.com';
        spyOn(this.app, 'fetchData').and.callFake(function (fakeUrl) {
          // return a fake promise object.
          return new Promise(function (resolve, reject) {
            resolve(fakeUrl);
          });
        });
        this.returnedPromise = this.app.fetchData(url);
      });
      it('should pass an argument to fetchData', function () {
        expect(this.app.fetchData.calls.argsFor(0).length).not.toBe(0)
      });
      // TODO: implement custom matcher to check whether a url is passed or not.
      it('should return a promise object', function () {
        expect(this.returnedPromise).toEqual(jasmine.any(Promise));
      });
    });
    describe("Tests for handling fetchData promise", function () {
      beforeEach(function(done) {
        var vm = this;
        this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        // update current global timeout to 10 seconds
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        this.app = new App();
        var url = 'https://www.reddit.com/r/showerthoughts/hot.json?limit=300'
        spyOn(this.app, 'fetchData').and.callThrough();
        this.returnedPromise = this.app.fetchData(url);
        this.returnedPromise.then(function (res) {
          vm.response = res;
          done();
        })
        .catch(function (err) {
          vm.response = err;
          done();
        });
      });
      it('returned data is an array', function () {
        var isArray = (this.response instanceof Array);
        expect(isArray).toBe(true);
      })
      it('data contains desired keys', function () {
        function hasOwn(object, prop) {
          var result = false;
          if (object && prop) {
            result = object.hasOwnProperty(prop);
          }
          return result;
        }
        var sampleObject = this.response[0];
        var hasKeys = hasOwn(sampleObject, 'post') && hasOwn(sampleObject, 'permalink') && hasOwn(sampleObject, 'author');
        expect(hasKeys).toBe(true);
      })
      afterEach(function () {
        // reset global to default
        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
      });
    });
});
