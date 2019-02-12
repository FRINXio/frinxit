var request = require('superagent');
var bgp = require('./frinxit.js');


module.exports = function (vorpal) {

vorpal
  .command('show bgp summary <node_id>')
  .description('Display bgp summary information of router node_id.')

  .action(function(args, callback) {
    var self = this;
    request
      .get('http://' + global.odl_ip + ':8181/restconf/operational/network-topology:network-topology/topology/unified/node/' +
        args.node_id + '/yang-ext:mount/frinx-openconfig-network-instance:network-instances/network-instance/default/protocols/protocol/frinx-openconfig-policy-types:BGP/default/')
      .auth(global.odl_user, global.odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .end(function (err, res) {
        if (err || !res.ok) {
          self.log('BGP information was not found on the device. Error code: ' + err.status);
        } 

        if (res.status == 200) {
          self.log('BGP information retrieved. Status code: ' + res.status);
        }

        if (res.text) {
          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
        }

      });
      callback();
  });


// deprecated


vorpal
  .command('show bgp route <node_id>')
  .description('Display bgp route information of router node_id.')

  .action(function(args, callback) {
    var self = this;
    request
      .get('http://' + global.odl_ip + ':8181/restconf/operational/network-topology:network-topology/topology/cli/node/' +
        args.node_id + '/yang-ext:mount/frinx-openconfig-rib-bgp:bgp-rib')
      .auth(global.odl_user, global.odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .end(function (err, res) {
        if (err || !res.ok) {
          self.log('BGP information was not found on the device. Error code: ' + err.status);
        } 

        if (res.status == 200) {
          self.log('BGP information retrieved. Status code: ' + res.status);
        }

        if (res.text) {
          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
        }

      });
      callback();
  });



vorpal
  .command('show static route <node_id>')
  .description('Display static route information of router node_id.')

  .action(function(args, callback) {
    var self = this;
    request
      .get('http://' + global.odl_ip + ':8181/restconf/operational/network-topology:network-topology/topology/cli/node/' +
        args.node_id + '/yang-ext:mount/frinx-openconfig-network-instance:network-instances/network-instance/default/protocols/protocol/frinx-openconfig-policy-types:STATIC/default')
      .auth(global.odl_user, global.odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .end(function (err, res) {
        if (err || !res.ok) {
          self.log('BGP information was not found on the device. Error code: ' + err.status);
        } 

        if (res.status == 200) {
          self.log('BGP information retrieved. Status code: ' + res.status);
        }

        if (res.text) {
          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
        }

      });
      callback();
  });


vorpal
  .command('show network-instances <node_id>')
  .description('Display protocol information of network instance of router node_id.')

  .action(function(args, callback) {
    var self = this;
    request
      .get('http://' + global.odl_ip + ':8181/restconf/operational/network-topology:network-topology/topology/cli/node/' +
        args.node_id + '/yang-ext:mount/frinx-openconfig-network-instance:network-instances')
      .auth(global.odl_user, global.odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .end(function (err, res) {
        if (err || !res.ok) {
          self.log('BGP information was not found on the device. Error code: ' + err.status);
        } 

        if (res.status == 200) {
          self.log('BGP information retrieved. Status code: ' + res.status);
        }

        if (res.text) {
          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
        }

      });
      callback();
  });

}
