var request = require('superagent');
var l3vpn = require('./frinxit.js');

var odl_ip = l3vpn.odl_ip;
var odl_user = l3vpn.odl_user;
var odl_pass = l3vpn.odl_pass;


module.exports = function (vorpal) {
  vorpal
  .command('show cluster configuration')
  .description('Displays cluster information from the config data store.')
  .hidden()

  .action(function(args, callback) {
    var self = this;
    request
      .get('http://' + odl_ip + ':8181/jolokia/read/org.opendaylight.controller:Category=Shards,name=member-1-shard-inventory-config,type=DistributedConfigDatastore')

      .auth(odl_user, odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .end(function (err, res) {

        if (err || !res.ok) {
          self.log('Error code: ' + err.status);
        } 

        if (res.status == 200) {
          self.log('Status code: ' + res.status);
        }

        self.log(JSON.stringify(JSON.parse(res.text), null, 2));

      });
      callback();
  });
}
