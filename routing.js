var request = require('superagent');
var frinxit = require('./frinxit.js');
const url = require('./URL_const');

const ODL_OC_UNIFIED_NETWORK_INSTANCES = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT +
                        url.ODL_RESTCONF_OPERATIONAL +
                        'network-topology:network-topology/topology/unified/node/';

module.exports = function (vorpal) {

vorpal
  .command('show bgp summary <node_id>')
  .description('Display bgp summary information of router node_id.')
  .action(function(args, callback) {
    var self = this;
    request
      .get(ODL_OC_UNIFIED_NETWORK_INSTANCES + args.node_id +
        '/yang-ext:mount/frinx-openconfig-network-instance:network-instances/network-instance/default/protocols/protocol/frinx-openconfig-policy-types:BGP/default/')
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));
      });
    callback();
  });


// deprecated
// TODO replace with new BGP model path

vorpal
  .command('show bgp route <node_id>')
  .description('Display bgp route information of router node_id.')
  .action(function(args, callback) {
    var self = this;
    request
      .get(ODL_OC_UNIFIED_NETWORK_INSTANCES + args.node_id + '/yang-ext:mount/frinx-openconfig-rib-bgp:bgp-rib')
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));
      });
    callback();
  });


vorpal
  .command('show static route <node_id>')
  .description('Display static route information of router node_id.')
  .action(function(args, callback) {
    var self = this;
    request
      .get(ODL_OC_UNIFIED_NETWORK_INSTANCES + args.node_id + '/yang-ext:mount/frinx-openconfig-network-instance:network-instances/network-instance/default/protocols/protocol/frinx-openconfig-policy-types:STATIC/default')
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));
      });
    callback();
  });


vorpal
  .command('show network-instances <node_id>')
  .description('Display protocol information of network instance of router node_id.')
  .action(function(args, callback) {
    var self = this;
    request
      .get(ODL_OC_UNIFIED_NETWORK_INSTANCES + args.node_id + '/yang-ext:mount/frinx-openconfig-network-instance:network-instances')
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));
      });
    callback();
  });
}
