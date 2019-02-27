var request = require('superagent');
const url = require('./URL_const');
var frinxit = require('./frinxit.js');


const ODL_NETCONF_OPERATIONAL = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() +
                        url.ODL_PORT + 
                        url.ODL_RESTCONF_OPERATIONAL + 
                        'network-topology:network-topology/topology/topology-netconf/';

const ODL_NETCONF_CONFIG = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() +
                        url.ODL_PORT +
                        url.ODL_RESTCONF_CONFIG +
                        'network-topology:network-topology/topology/topology-netconf/';

const ODL_RESTCONF_TEST = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT +
                        'restconf/'


module.exports = function (vorpal) {
	
vorpal
  .command('delete netconf <node_id>')
  .description('Deletes a netconf node in ODL. Requires node-id of the netconf device.')
  .action(function(args, callback) {
    var self = this;
    request
      .delete(ODL_NETCONF_CONFIG + 'node/' + args.node_id)
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));
      });
    callback();
  });


vorpal
  .command('mount netconf <node_id> <host> <port> <username> <password>')
  .option('-t, --tcp_only', 'tcp-only option')
  .option('-k, --keepalive_delay <keepalive-delay>', 'keepalive-delay')
  .description('Mounts a new netconf node in ODL. Requires node-id, port, ' + 
    'username and password of the netconf device, tcp-only and keepalive ' +
    'options can be set via options.')
  .action(function(args, callback) {
    var self = this;
    var tcp_only = false;
    var keepalive_delay = 0;
    
    //hack default settings for options
    if (typeof args.options.tcp_only == 'undefined' ) { 
      tcp_only = false;
    } 
    else { 
      tcp_only = true; 
    }

    if (typeof args.options.keepalive_delay == 'undefined' ) { 
      keepalive_delay = 0 
    } 
    else { 
      keepalive_delay = args.options.keepalive_delay; 
    }

    request
      .put(ODL_NETCONF_CONFIG + 'node/' + args.node_id)
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/xml')
      .set('Content-Type', 'application/xml')
      .send('<node xmlns="urn:TBD:params:xml:ns:yang:network-topology"><node-id>' + args.node_id + '</node-id>' +
        '<host xmlns="urn:opendaylight:netconf-node-topology">' + args.host + '</host>' + 
        '<port xmlns="urn:opendaylight:netconf-node-topology">' + args.port + '</port>' +
        '<username xmlns="urn:opendaylight:netconf-node-topology">' + args.username + '</username>' +
        '<password xmlns="urn:opendaylight:netconf-node-topology">' + args.password + '</password>' + 
        '<tcp-only xmlns="urn:opendaylight:netconf-node-topology">' + tcp_only+ '</tcp-only>' + 
        '<keepalive-delay xmlns="urn:opendaylight:netconf-node-topology">' + keepalive_delay + '</keepalive-delay></node>')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));
      });
    callback();
  });


vorpal
  .command('show netconf config [node_id]')
  .description('Display information about NETCONF nodes in ODL data store. Optionally specify node-id.')
  .action(function(args, callback) {
    var self = this;
    var node_id = args.node_id;

    if (args.node_id) {
      var node_string = "node/" + args.node_id;

    } else {
      node_string = "";
    }

    request
      .get(ODL_NETCONF_CONFIG + node_string)
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));
      });
      callback();
  });


vorpal
  .command('show netconf operational [node_id]')
  .description('Display information about a netconf nodes operational state in ODL. Optionally specify node-id.')
  .action(function(args, callback) {
    var self = this;
    var node_id = args.node_id;

    if (args.node_id) {
      request
        .get(ODL_NETCONF_OPERATIONAL + 'node/' + args.node_id)
        .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
        .accept('application/json')
        .set('Content-Type', 'application/json')
        .end(function (err, res) {
          self.log(frinxit.responsecodehandler(err, res, true));
        });

    } else {
      request
        .get(ODL_NETCONF_OPERATIONAL)
        .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
        .accept('application/json')
        .set('Content-Type', 'application/json')
        .end(function (err, res) {
          self.log(frinxit.responsecodehandler(err, res, false));

          if (res.status == 200) {
            self.log('Topology was found in data store. Status code: ' + res.status);
            var nc_nodes = JSON.parse(res.text);
            var node_item = '';
            self.log("Node ID".rpad(20) + "Host IP".rpad(20) + "Host Status".rpad(20));

            try {
              for (var i = 0; i < nc_nodes['topology'][0]['node'].length; i++) {
                node_item = nc_nodes['topology'][0]['node'][i];

                if (node_item['netconf-node-topology:connection-status'] === "connected") {
                  self.log(node_item['node-id'].rpad(20) + node_item['netconf-node-topology:host'].rpad(20) + 
                    node_item['netconf-node-topology:connection-status'].green.rpad(20));
                } else {
                  self.log(node_item['node-id'].rpad(20) + node_item['netconf-node-topology:host'].rpad(20) +
                    node_item['netconf-node-topology:connection-status'].red.rpad(20));
                }
              }
            }
            catch (err) {
              self.log(frinxit.responsecodehandler(err, res, true));
            }

          }
        });
    }
      callback();
    });


  
}