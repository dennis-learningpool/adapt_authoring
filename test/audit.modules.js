var nodezoo = require('nodezoo'),
    async = require('async'),
    configuration = require('../lib/configuration');

describe('security audit', function() {

  it('should verify that our module selection scores better than x with node zoo', function(done) {
    this.timeout(60000); // timeout of 60 seconds might be waaaay too much
    var package = require('../package.json');
    var zoo = nodezoo();
    async.eachSeries(
      Object.keys(package.dependencies),
      function (moduleName, cb) {
        zoo.query({q:moduleName}, function (err, result) {
          var found = false;
          if (err) {
            return cb(err);
          }

          // if we have results, iterate until we find the module we're looking for
          result && result.items && result.items.some(function (item) {
            if (item.name === moduleName) {
              found = item;
              return true;
            }
          });

          if (found) {
            // @TODO nodezoo package currently returns all packages with rank set as "1"
            // documentation at https://github.com/rjrodger/nodezoo is pretty light, not sure
            // if the feature is available for the npm package yet :-\
            // console.log("found %s:", moduleName, found);
            cb();
          } else {
            cb(new Error("Could not find module: " + moduleName));
          }
        });
      },
      done);
  });

});
