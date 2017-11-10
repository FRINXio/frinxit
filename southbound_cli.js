var request = require('superagent');
var cli = require('./frinxit.js');

var odl_ip = cli.odl_ip;
var odl_user = cli.odl_user;
var odl_pass = cli.odl_pass;


module.exports = function (vorpal) {
  vorpal
    .command('show cli translate-registry')
    .description('Display available translation units.')
    .action(function(args, callback) {
      var self = this;
      request
        .get('http://' + odl_ip + ':8181/restconf/operational/cli-translate-registry:available-cli-device-translations')

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

  vorpal
      .command('show cli operational [node_id]')
      .description('Display summary information from CLI topology from operational data store. \
Optionally specify a node ID for detailed information about that node.')
      .action(function(args, callback) {
        var self = this;
        var node_id = "";

        if (typeof args.node_id == 'undefined' ) {

          request
            .get('http://' + odl_ip + ':8181/restconf/operational/network-topology:network-topology/topology/cli/')

            .auth(odl_user, odl_pass)
            .accept('application/json')
            .set('Content-Type', 'application/json')

            .end(function (err, res) {

              if (err || !res.ok) {
                self.log('Error code: ' + err.status);
              } 

              if (res.status == 200) {
                self.log('Topology was found in data store. Status code: ' + res.status);
                var cli_nodes = JSON.parse(res.text);
                var node_item = '';

                self.log("Node ID" + "\t\t\t" + "Host IP" + "\t\t\t\t" + "Host Status");
                for (var i = 0; i < cli_nodes['topology'][0]['node'].length; i++) {
                  node_item = cli_nodes['topology'][0]['node'][i];
                  if (node_item['cli-topology:connection-status'] === "connected") {
                    self.log(node_item['node-id'] + "\t\t\t" + "\t"
                    + "\t\t\t" + node_item['cli-topology:connection-status'].green);
                  } else {
                    self.log(node_item['node-id'] + "\t\t\t" + "\t"
                    + "\t\t\t" + node_item['cli-topology:connection-status'].red);
                  }
                }

              }

//              self.log(JSON.stringify(JSON.parse(res.text), null, 2));

            });

        }
        
        else { 
          node_id = "node/" + args.node_id

          request
            .get('http://' + odl_ip + ':8181/restconf/operational/network-topology:network-topology/topology/cli/' + node_id)

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
        }



          callback();
      });

  vorpal
      .command('show cli config [node_id]')
      .description('Display CLI topology from config data store. Optionally specify a node ID to see a single node.')
      .action(function(args, callback) {
        var self = this;
        var node_id = "";

        if (typeof args.node_id == 'undefined' ) 
          { args.node_id = ""; }
        else
          { node_id = "node/" + args.node_id}

        request
          .get('http://' + odl_ip + ':8181/restconf/config/network-topology:network-topology/topology/cli/' + node_id)

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

vorpal
  .command('mount cli <node_id> <host_ip> <username> <password> <device_type> [device_version]')
  .description('Mount a CLI device via ssh transport layer. Default transport-type is ssh and default port is 22.')
  .option('-t, --telnet', 'Sets transport type from ssh (default) to telnet')
  .option('-p, --port <port>', 'Change default port from ssh = 22 or telnet = 23')
  .action(function(args, callback) {
    var self = this;
    var transport_type = 'ssh';
    
      //hack default settings
    if (typeof args.device_version == 'undefined' ) 
      { args.device_version = "*"; };


    if (typeof args.options.telnet == 'undefined' ) 
      { transport_type = 'ssh'; 
        port = args.options.port;
        if (typeof args.options.port == 'undefined' ) { port = '22'};
      };

    if ( args.options.telnet == true ) 
      { transport_type = 'telnet';
        port = args.options.port;
        if (typeof args.options.port == 'undefined' ) { port = '23'};

      };


    request
      .put('http://' + odl_ip + ':8181/restconf/config/network-topology:network-topology/topology/cli/node/' + args.node_id)

      .auth(odl_user, odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .send('{\
                "network-topology:node" :\
                {\
                    "network-topology:node-id" : "' + args.node_id + '",\
                    "cli-topology:host" : "' + args.host_ip + '",\
                    "cli-topology:port" : "' + port + '",\
                    "cli-topology:transport-type" : "' + transport_type+ '",\
                    "cli-topology:device-type" : "' + args.device_type + '",\
                    "cli-topology:device-version" : "' + args.device_version + '",\
                    "cli-topology:username" : "' + args.username + '",\
                    "cli-topology:password" : "' + args.password + '"\
                }\
              }')

      .end(function (err, res) {
              if (err || !res.ok) {
                self.log('Creation attempt was unsuccessful. Error code: ' + err.status);
              } 

              if (res.status == 200) {
                self.log('Node was successfully modified or overwritten in the data store. Status code: ' + res.status);
              }       

              if (res.status == 201) {
                self.log('Node was successfully created and mounted in the data store. Status code: ' + res.status);
              }

              if (res.text) {
                self.log(JSON.stringify(JSON.parse(res.text), null, 2));
              }

            });
            callback();
        });

vorpal
  .command('delete cli <node_id>')
  .description('Deletes a device from the cli topology.')

  .action(function(args, callback) {
    var self = this;
    //var node_id = args.node_id;
    request
      .delete('http://' + odl_ip + ':8181/restconf/config/network-topology:network-topology/topology/cli/node/' + args.node_id)
      .auth(odl_user, odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .end(function (err, res) {
        if (err || !res.ok) {
          self.log('Device was not found in the data store. Error code: ' + err.status);
        } 

        if (res.status == 200) {
          self.log('Device was successfully deleted from the data store. Status code: ' + res.status);
        }

        if (res.text) {
          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
        }

      });
      callback();
  });


  vorpal
      .command('exec cli show version <node_id>')
      .description('Executes show version command on device and Display structured data.')
      .action(function(args, callback) {
        var self = this;

        request
          .get('http://' + odl_ip + ':8181/restconf/operational/network-topology:network-topology/topology/cli/node/' 
            + args.node_id + '/yang-ext:mount/ios-essential:version')

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

  vorpal
      .command('exec cli show interfaces <node_id>')
      .description('Executes show interface command on device and Display structured data.')
      .action(function(args, callback) {
        var self = this;

        request
          .get('http://' + odl_ip + ':8181/restconf/operational/network-topology:network-topology/topology/cli/node/' 
            + args.node_id + '/yang-ext:mount/openconfig-interfaces:interfaces')

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

  vorpal
      .command('exec cli show vrfs <node_id>')
      .description('Executes show ip vrf command on device and Display structured data.')
      .action(function(args, callback) {
        var self = this;

        request
          .get('http://' + odl_ip + ':8181/restconf/operational/network-topology:network-topology/topology/cli/node/' 
            + args.node_id + '/yang-ext:mount/ios-essential:vrfs')

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


  vorpal
      .command('exec cli create vrf <node_id> <vrf_id> [description]')
      .description('Executes create vrf command on a mounted CLI device.')
      .action(function(args, callback) {
        var self = this;

        if (typeof args.description == 'undefined' ) 
          { args.description = "" };

      request
        .post('http://' + odl_ip + ':8181/restconf/config/network-topology:network-topology/topology/cli/node/' 
          + args.node_id+ '/yang-ext:mount/ios-essential:vrfs')

        .auth(odl_user, odl_pass)
        .accept('application/xml')
        .set('Content-Type', 'application/xml')

        .send('<vrf xmlns="urn:opendaylight:params:xml:ns:yang:ios:essential">\
                  <id>' + args.vrf_id + '</id>\
                  <description>' + args.description + '</description>\
              </vrf>')

        .end(function (err, res) {
          if (err || !res.ok) {
            self.log('Creation attempt was unsuccessful. Error code: ' + err.status);

            if (res.status == 409) {
              self.log('Configuration already exists on the device.');
            } else
            {
              self.log(err);
            }

          } 

          if (res.status == 204) {
            self.log('Configuration was successfully created on the device. Status code: ' + res.status);
          }

          if (res.text) {
            self.log(JSON.stringify(JSON.parse(res.text), null, 2));
          }

        });
        callback();

      }); 

vorpal
  .command('exec cli delete vrf <node_id> <vrf_id>')
  .description('Deletes a vrf on a node.')

  .action(function(args, callback) {
    var self = this;
    //var node_id = args.node_id;
    request
      .delete('http://' + odl_ip + ':8181/restconf/config/network-topology:network-topology/topology/cli/node/' 
        + args.node_id + '/yang-ext:mount/ios-essential:vrfs/vrf/' + args.vrf_id)
      .auth(odl_user, odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .end(function (err, res) {
        if (err || !res.ok) {
          self.log('VRF was not found on the device. Error code: ' + err.status);
        } 

        if (res.status == 200) {
          self.log('VRF was successfully deleted from the device. Status code: ' + res.status);
        }

        if (res.text) {
          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
        }

      });
      callback();
  });

vorpal
  .command('exec cli show bgp route <node_id>')
  .description('Display bgp route information of router node_id.')

  .action(function(args, callback) {
    var self = this;
    request
      .get('http://' + odl_ip + ':8181/restconf/operational/network-topology:network-topology/topology/cli/node/' +
        args.node_id + '/yang-ext:mount/openconfig-rib-bgp:bgp-rib')
      .auth(odl_user, odl_pass)
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
  .command('exec cli command <node_id>')
  .description('Execeutes an arbitray CLI command via the CLI plugin associated' + 
    ' with that device. Response is non-structured.')

  .action(function(args, callback) {
    var self = this;

    this.prompt([{
          type: 'input',
          name: 'command',
          message: 'command: '
        }
      ], function(answers) {

        request
          .post('http://' + odl_ip + ':8181/restconf/operations/network-topology:network-topology/topology/cli/node/' 
            + args.node_id + '/yang-ext:mount/cli-unit-generic:execute-and-read')

          .auth(odl_user, odl_pass)
          .accept('application/json')
          .set('Content-Type', 'application/json')

          .send({ "input" : { "ios-cli:command" : answers.command }})

          .end(function (err, res) {
            if (err || !res.ok) {
              self.log('CLI execution was unsuccessful. Error code: ' + err.status);
            } 

            if (res.status == 200) {
              self.log('CLI command was successfully executed on the device. Status code: ' + res.status);
            }       

            if (res.text) {
              var output = JSON.parse(res.text);
              self.log(output['output']['output']);
            }
          });

          callback();
      });

  });

}
