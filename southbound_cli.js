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

                self.log("Node ID".rpad(20) + "Host IP".rpad(20) + "Host Status".rpad(20));

                try {
                  for (var i = 0; i < cli_nodes['topology'][0]['node'].length; i++) {
                    node_item = cli_nodes['topology'][0]['node'][i];
                    if (node_item['cli-topology:connection-status'] === "connected") {
                      self.log(node_item['node-id'].rpad(20) + node_item['cli-topology:host'].rpad(20) + 
                        node_item['cli-topology:connection-status'].green.rpad(20));
                    } else {
                      self.log(node_item['node-id'].rpad(40) +
                        node_item['cli-topology:connection-status'].red.rpad(20));
                    }
                  }
                }
                catch (err) {
                  self.log(JSON.stringify(JSON.parse(res.text), null, 2));
                }
              }
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
  .option('-d, --dry-run <dr_journal_size>', 'set journal size for dry-run')
  .option('-j, --journal <journal_size>', 'set journal size')
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

    if ( args.options.dr_journal_size == 'undefined' ) 
      { args.options.dr_journal_size = '180' };

    if ( args.options.journal_size == 'undefined' ) 
      { args.options.journal_size = '150' };


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
                    "cli-topology:password" : "' + args.password + '",\
                    "cli-topology:journal-size": "150",\
                    "cli-topology:dry-run-journal-size": "180"\
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
      .command('exec cli show interfaces <node_id> [status]')
      .description('Execute show interface command on device <node-id> and display structured data. Operational [status] can be \"up\", \"down\", \"sum\" for summary or \"ipv4\".')
      .action(function(args, callback) {
        var self = this;

        request
          .get('http://' + odl_ip + ':8181/restconf/operational/network-topology:network-topology/topology/cli/node/' 
            + args.node_id + '/yang-ext:mount/openconfig-interfaces:interfaces')

          .auth(odl_user, odl_pass)
          .accept('application/json')
          .set('Content-Type', 'application/json')

          .end(function (err, res) {

            if (!args.status) {
              if (err || !res.ok) {
              self.log('Error code: ' + err.status);
              } 

              if (res.status == 200) {
              self.log('Status code: ' + res.status);
              }

              self.log(JSON.stringify(JSON.parse(res.text), null, 2));

            } else {
              switch (args.status) {
                case 'up':
                  self.log("Interfaces in \"up\" state:");
                  var interfaces = JSON.parse(res.text);
                  var interface_item = '';
                  var interface_list = {};

                  for (var i = 0; i < interfaces['interfaces']['interface'].length; i++) {
                    interface_item = interfaces['interfaces']['interface'][i];

                    if (interface_item['state']['oper-status'] == "UP") {
                      interface_list[interface_item['name']] = interface_item['state']['oper-status'];
                    }
                  }

                  self.log("Interface Name".rpad(30) + "Operational Status");
                  var keys = Object.keys(interface_list);
                  keys.sort();

                  for (var i=0; i<keys.length; i++) {
                    var key = keys[i];
                    self.log(key.rpad(30) + interface_list[key].green);
                  } 
                  break;

                case 'down':
                  self.log("Interfaces in \"down\" state:");
                  var interfaces = JSON.parse(res.text);
                  var interface_item = '';
                  var interface_list = {};

                  for (var i = 0; i < interfaces['interfaces']['interface'].length; i++) {
                    interface_item = interfaces['interfaces']['interface'][i];

                    if (interface_item['state']['oper-status'] == "DOWN") {
                      interface_list[interface_item['name']] = interface_item['state']['oper-status'];
                    }
                  }

                  self.log("Interface Name".rpad(30) + "Operational Status");
                  var keys = Object.keys(interface_list);
                  keys.sort();

                  for (var i=0; i<keys.length; i++) {
                    var key = keys[i];
                    self.log(key.rpad(30) + interface_list[key].red);
                  } 
                break;

                case 'sum':
                  self.log("Summary of Interface states:");
                  var interfaces = JSON.parse(res.text);
                  var interface_item = '';
                  var interface_list = {};

                  for (var i = 0; i < interfaces['interfaces']['interface'].length; i++) {
                    interface_item = interfaces['interfaces']['interface'][i];
                    interface_list[interface_item['name']] = interface_item['state']['oper-status'];
                  }

                  self.log("Interface Name".rpad(30) + "Operational Status");
                  var keys = Object.keys(interface_list);
                  keys.sort();

                  for (var i=0; i<keys.length; i++) {
                    var key = keys[i];
                    if (interface_list[key] == "UP") {
                      self.log(key.rpad(30) + interface_list[key].green);
                    } else {
                      self.log(key.rpad(30) + interface_list[key].red);
                      }

                  } 
                break;

                case 'ipv4':
                  self.log("Summary of interface states with IPv4 information:");

                  var interfaces = JSON.parse(res.text);
                  var interface_list = {};
                  var interface_item = '';
                  var subinterface_item = '';
                  var address_item = '';

                  for (var i = 0; i < interfaces['interfaces']['interface'].length; i++) {
                    interface_item = interfaces['interfaces']['interface'][i];
                    interface_list[interface_item['name']] = interface_item['state']['oper-status'];

                  }

                  self.log("Interface Name".rpad(30).blue + "Subintf".rpad(10).blue + "IP Address".rpad(20).blue + "Operational Status".blue);
                  var keys = Object.keys(interface_list);
                  keys.sort();

                  for (var l=0; l<keys.length; l++) {
                    var key = keys[l];

                    for (var i = 0; i < interfaces['interfaces']['interface'].length; i++) {
                      interface_item = interfaces['interfaces']['interface'][i];

                      if (interface_item['name'] == key) {

                        for (var j = 0; j < interface_item['subinterfaces']['subinterface'].length; j++) {
                          subinterface_item =  interface_item['subinterfaces']['subinterface'][j];

                          //we try to read the ip addresses from the sub-interface
                          try { 

                            for (var k = 0; k < subinterface_item['openconfig-if-ip:ipv4']['addresses']['address'].length; k++) {
                              address_item = subinterface_item['openconfig-if-ip:ipv4']['addresses']['address'][k];

                              //subinterface with index 0 has its operational status in the main interface section
                              if (interface_item['subinterfaces']['subinterface'][j]['index'] == 0) {

                                if (interface_item['state']['oper-status'] == "UP") {

                                self.log(key.rpad(30) + interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                  address_item['ip'].toString().rpad(20) +
                                  interface_item['state']['oper-status'].green);

                                } else {

                                    self.log(key.rpad(30) + interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                      address_item['ip'].toString().rpad(20) +
                                      interface_item['state']['oper-status'].red);
                                }
                              // for all other subinterfcae > index 0 we need to look into the subinterface section
                              } else { 

                                  if (interface_item['subinterfaces']['subinterface'][j]['state']['oper-status'] == "UP") {

                                  self.log(key.rpad(30) + interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                    address_item['ip'].toString().rpad(20) +
                                    interface_item['subinterfaces']['subinterface'][j]['state']['oper-status'].green);

                                  } else {

                                      self.log(key.rpad(30) + interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                        address_item['ip'].toString().rpad(20) +
                                        interface_item['subinterfaces']['subinterface'][j]['state']['oper-status'].red);
                                  }
                                }
                            }
                          }
                          // we go down this path if we have failed to read an ip address, because there is none configured
                          catch (err) {
                            //subinterface with index 0 has its operational status in the main interface section
                            if (interface_item['subinterfaces']['subinterface'][j]['index'] == 0) {

                              if (interface_item['state']['oper-status'] == "UP") {

                              self.log(key.rpad(30) + interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                "n/a".rpad(20) +
                                interface_item['state']['oper-status'].green);

                              } else {

                                  self.log(key.rpad(30) + interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                    "n/a".rpad(20) +
                                    interface_item['state']['oper-status'].red);
                              }

                            } else { // for all other subinterfcae > index 0 we need to look into the subinterface section

                                if (interface_item['subinterfaces']['subinterface'][j]['state']['oper-status'] == "UP") {

                                self.log(key.rpad(30) + interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                  "n/a".rpad(20) +
                                  interface_item['subinterfaces']['subinterface'][j]['state']['oper-status'].green);

                                } else {

                                    self.log(key.rpad(30) + interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                      "n/a".rpad(20) +
                                      interface_item['subinterfaces']['subinterface'][j]['state']['oper-status'].red);
                                }
                              }
                          }
                        }
                      }
                    }                    
                  } 

                break;


                default:
                self.log("Unrecognized option. Please specify \"up\", \"down\", \"sum\" or \"ipv4\"");
              }
            }

          });
          callback();
      });  


  vorpal
      .command('show cli journal <node_id>')
      .description('Displays the journal of <node-id>.')
      .action(function(args, callback) {
        var self = this;

        request
          .post('http://' + odl_ip + ':8181/restconf/operations/network-topology:network-topology/topology/cli/node/' + args.node_id + '/yang-ext:mount/journal:read-journal')
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

            
            var output = (JSON.parse(res.text));
            self.log(output['output']['journal']);

          });
          callback();
      }); 


    vorpal
      .command('show cli dry-run-journal <node_id>')
      .description('Displays the journal of <node-id>.')
      .action(function(args, callback) {
        var self = this;

        request
          .post('http://' + odl_ip + ':8181/restconf/operations/network-topology:network-topology/topology/cli/node/' + args.node_id + '-dryrun/yang-ext:mount/journal:read-journal')
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

            
            var output = (JSON.parse(res.text));
            self.log(output['output']['journal']);

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


