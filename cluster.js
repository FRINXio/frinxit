var request = require('superagent');
var l3vpn = require('./frinxit.js');
var colors = require('colors');


module.exports = function (vorpal) {
  vorpal
  .command('show colors')
  .description('Displays cluster information from the config data store.')
  .hidden()

  .action(function(args, callback) {
    var self = this;

    self.log('hello'.green); // outputs green text
    self.log('i like cake and pies'.underline.red) // outputs red underlined text
    self.log('inverse the color'.inverse); // inverses the color
    self.log('OMG Rainbows!'.rainbow); // rainbow
    self.log('Run the trap'.trap); // Drops the bass

    callback();
  });


  vorpal
    .command('show cluster')
    .description('Display cluster related information.')
    .action(function(args, callback) {
      var self = this;
      request
        .get('http://' + global.odl_ip + ':8181/jolokia/read/org.opendaylight.controller:Category=Shards,name=member-1-shard-inventory-config,type=DistributedConfigDatastore')
        .auth(global.odl_user, global.odl_pass)
        .accept('application/json')
        .set('Content-Type', 'application/json')
        .end(function (err, res) {

          if (err || !res.ok) {
            self.log('Error code: ' + err.status);
          } 

          if (res.status == 200) {
            self.log('Status code: ' + res.status);
          }

          self.log(res.text);

        });
        callback();
    });

}
