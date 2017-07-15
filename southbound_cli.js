var request = require('superagent');
var cli = require('./frinxit.js');

var odl_ip = cli.odl_ip;
var odl_user = cli.odl_user;
var odl_pass = cli.odl_pass;


module.exports = function (vorpal) {
  vorpal
    .command('show cli translate-registry')
    .description('Displays available translation units.')
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
      .command('show cli topology operational [node_id]')
      .description('Displays CLI topology from operational data store.')
      .action(function(args, callback) {
        var self = this;
        var node_id = "";

        if (typeof args.node_id == 'undefined' ) 
          { args.node_id = ""; }
        else
          { node_id = "node/" + args.node_id}

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
          callback();
      });

  vorpal
      .command('show cli topology config [node_id]')
      .description('Displays CLI topology from config data store.')
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
      .description('Executes show version command on device and displays structured data.')
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
      .description('Executes show interface command on device and displays structured data.')
      .action(function(args, callback) {
        var self = this;

        request
          .get('http://' + odl_ip + ':8181/restconf/operational/network-topology:network-topology/topology/cli/node/' 
            + args.node_id + '/yang-ext:mount/ios-essential:interfaces')

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
      .description('Executes show ip vrf command on device and displays structured data.')
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
          self.log('Device was successfully deleted from the device. Status code: ' + res.status);
        }

        if (res.text) {
          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
        }

      });
      callback();
  });


vorpal
  .command('exec_cli <node_id>')
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
            self.log(JSON.stringify(JSON.parse(res.text), null, 2));
          }
        });
        callback();
      });
  });

}





/*
    try {
      var res = eval(command);
      var log = (_.isString(res)) ? String(res).white : res;
      // console.log(log);
      cb(res);
    } catch (e) {
      console.log(e);
      cb(e);
    }
// http://localhost:8181/restconf/operations/network-topology:network-topology/topology/cli/node/IOS-121/yang-ext:mount/cli-unit-generic:execute-and-read
// http://127.0.0.1:8181/restconf/operations/network-topology:network-topology/topology/cli/node/IOS-121/yang-ext:mount/cli-unit-generic:execute-and-read
// http://localhost:8181/restconf/operations/network-topology:network-topology/topology/cli/node/IOS-121/yang-ext:mount/cli-unit-generic:execute-and-read


//***************************************** delete below here
module.exports = function (vorpal) {
  vorpal
  .command('mount simulated <pe_id>')
  .description('Mounts a simulated PE node in ODL.')

  .action(function(args, callback) {
    var self = this;
    
    request
      .put('http://' + odl_ip + ':8181/restconf/config/network-topology:network-topology/topology/mock-pe-topology/node/' + args.pe_id)

      .auth(odl_user, odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .send('{\
              "node": [\
                {\
                  "node-id": "' + args.pe_id + '",\
                  "termination-point": [\
                    {\
                      "tp-id":"GigabitEthernet0/0/0/1"\
                    },\
                    {\
                      "tp-id":"GigabitEthernet0/0/0/2"\
                    },\
                    {\
                      "tp-id":"GigabitEthernet0/0/0/3"\
                    }\
                  ]\
                }\
              ]\
            }\
            ')


      .end(function (err, res) {
        if (err || !res.ok) {
          self.log('Mount attempt was unsuccessful. Error code: ' + err.status);
        } 

        if (res.status == 200) {
          self.log('Device was successfully mmodified or overwritten in the data store. Status code: ' + res.status);
        }       

        if (res.status == 201) {
          self.log('Device was successfully created and mounted in the data store. Status code: ' + res.status);
        }

        if (res.text) {
          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
        }

      });
      callback();
  });

vorpal
  .command('show operational simulated <pe_id>')
  .description('Displays operational data of simulated PE device.')

  .action(function(args, callback) {
    var self = this;
    request
      .get('http://' + odl_ip + ':8181/restconf/operational/network-topology:network-topology/topology/mock-pe-topology/node/' + args.pe_id)

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
  .command('show l3vpn topologies simulated')
  .description('Displays L3VPN topology information.')

  .action(function(args, callback) {
    var self = this;
    request
      .get('http://' + odl_ip + ':8181/restconf/config/network-topology:network-topology/topology/mock-pe-topology')

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
  .command('show l3vpn service')
  .description('Displays L3VPN configuration data service model information.')

  .action(function(args, callback) {
    var self = this;
    request
      .get('http://' + odl_ip + ':8181/restconf/config/ietf-l3vpn-svc:l3vpn-svc')

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
  .command('delete simulated nc-device <node_id>')
  .description('Deletes a simulated netconf node in ODL.')

  .action(function(args, callback) {
    var self = this;
    //var node_id = args.node_id;
    request
      .delete('http://' + odl_ip + ':8181/restconf/config/network-topology:network-topology/topology/mock-pe-topology/node/' + args.node_id)
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
  .command('create l3vpn vpn <vpn_id> [customer_as] [route_distinguisher] [route_target]')
  .description('Creates a VPN in the L3VPN service module in ODL. Use \"commit l3vpn\" command to push configuration to devices.')

  .action(function(args, callback) {
    var self = this;
    
      //hack default settings
    if (typeof args.customer_as == 'undefined' ) 
      { args.customer_as = "65001"; };

    if (typeof args.route_distinguisher == 'undefined' ) 
      { args.route_distinguisher = "10"; };

    if (typeof args.route_target == 'undefined' ) 
      { args.route_target = "22" };

    request
      .put('http://' + odl_ip + ':8181/restconf/config/ietf-l3vpn-svc:l3vpn-svc/vpn-services/vpn-service/' + args.vpn_id)

      .auth(odl_user, odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .send('{\
              "vpn-service":[\
                {\
                  "vpn-id":"'+ args.vpn_id +'",\
                  "customer-name":"Customer name",\
                  "vpn-service-topology":"any-to-any",\
                  "l3vpn-param:vrf-name":"' + args.vpn_id + '",\
                  "l3vpn-param:route-distinguisher":{\
                    "as":' + args.customer_as + ',\
                    "as-index":' + args.route_distinguisher + '\
                  },\
                  "l3vpn-param:import-route-targets":{\
                    "route-target":{\
                      "as":' + args.customer_as + ',\
                      "as-index":' + args.route_target + '\
                    }\
                  },\
                  "l3vpn-param:export-route-targets":{\
                    "route-target":{\
                      "as":' + args.customer_as + ',\
                      "as-index":' + args.route_target + '\
                    }\
                  }\
                }\
              ]\
            }')

      .end(function (err, res) {
              if (err || !res.ok) {
                self.log('Creation attempt was unsuccessful. Error code: ' + err.status);
              } 

              if (res.status == 200) {
                self.log('VPN was successfully modified or overwritten in the data store. Status code: ' + res.status);
              }       

              if (res.status == 201) {
                self.log('VPN was successfully created and mounted in the data store. Status code: ' + res.status);
              }

              if (res.text) {
                self.log(JSON.stringify(JSON.parse(res.text), null, 2));
              }

            });
            callback();
        });

vorpal
  .command('delete l3vpn vpn <vpn_id>')
  .description('Deletes a L3VPN.')

  .action(function(args, callback) {
    var self = this;
    //var vpn_id = args.vpn_id;
    request
      .delete('http://' + odl_ip + ':8181/restconf/config/ietf-l3vpn-svc:l3vpn-svc/vpn-services/vpn-service/' + args.vpn_id)
      .auth(odl_user, odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .end(function (err, res) {
        if (err || !res.ok) {
          self.log('VPN was not found in the data store. Error code: ' + err.status);
        } 

        if (res.status == 200) {
          self.log('VPN was successfully deleted from the data store. Status code: ' + res.status);
        }

        if (res.text) {
          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
        }

      });
      callback();
  });

vorpal
  .command('create l3vpn site')
  .description('Creates a site connected to VPN in the L3VPN service module in ODL.')
  .action(function(args, callback) {
    var self = this;

    this.prompt([{
        type: 'input',
        name: 'site_id',
        message: 'Site ID: '
      },
      {
        type: 'input',
        name: 'vpn_id',
        message: 'VPN ID: '
      },
      {
        type: 'input',
        name: 'pe_id',
        message: 'PE node ID: '
      },
      {
        type: 'input',
        name: 'pe_iface_id',
        default: 'GigabitEthernet0/0/0/3',
        message: 'PE interface name: '
      },
      {
        type: 'input',
        name: 'pe_iface_ip',
        message: 'PE interface IP: '
      },
      {
        type: 'input',
        name: 'pe_iface_mask',
        default: 24,
        message: 'PE interface mask: '
      },
      {
        type: 'input',
        name: 'pe_bgp_as',
        default: 65000,
        message: 'PE BGP AS: '
      },
      {
        type: 'input',
        name: 'rpl_in',
        default: 'RPL_PASS_ALL',
        message: 'Route policy in: '
      },
      {
        type: 'input',
        name: 'rpl_out',
        default: 'RPL_PASS_ALL',
        message: 'Route policy out: '
      },
      {
        type: 'input',
        name: 'ce_iface_ip',
        message: 'CE interface IP: '
      },
      {
        type: 'input',
        name: 'ce_bgp_as',
        message: 'CE BGP AS: '
      }
    ], function(answers) {
      request
        .put('http://' + odl_ip + ':8181/restconf/config/ietf-l3vpn-svc:l3vpn-svc/sites/site/' + answers.site_id)

        .auth(odl_user, odl_pass)
        .accept('application/json')
        .set('Content-Type', 'application/json')

        .send('{\
            "site":[\
              {\
                "site-id":"' + answers.site_id + '",\
                "site-vpn-flavor":"site-vpn-flavor-single",\
                "management":{\
                  "type":"customer-managed"\
                },\
                "site-network-accesses":{\
                  "site-network-access":[\
                    {\
                      "site-network-access-id":"' + answers.site_id + '",\
                      "site-network-access-type":"multipoint",\
                      "vpn-attachment":{\
                        "vpn-id":"' + answers.vpn_id + '",\
                        "site-role":"any-to-any-role"\
                      },\
                      "routing-protocols":{\
                        "routing-protocol":[\
                          {\
                            "type":"bgp",\
                            "bgp":{\
                              "autonomous-system":' + answers.ce_bgp_as + ',\
                              "address-family":[\
                                "ipv4"\
                              ]\
                            }\
                          }\
                        ]\
                      },\
                      "ip-connection":{\
                        "ipv4":{\
                          "address-allocation-type":"static-address",\
                          "addresses":{\
                            "provider-address":"' + answers.pe_iface_ip + '",\
                            "customer-address":"' + answers.ce_iface_ip + '",\
                            "mask":' + answers.pe_iface_mask + '\
                          }\
                        }\
                      },\
                      "l3vpn-param:pe-node-id":"' + answers.pe_id + '",\
                      "l3vpn-param:pe-2-ce-tp-id":"' + answers.pe_iface_id + '",\
                      "l3vpn-param:pe-bgp-as":' + answers.pe_bgp_as + ',\
                      "l3vpn-param:route-policy-in":"' + answers.rpl_in + '",\
                      "l3vpn-param:route-policy-out":"' + answers.rpl_out + '"\
                    }\
                  ]\
                }\
              }\
            ]\
          }')


        .end(function(err, res) {
          if (err || !res.ok) {
            self.log('Creation attempt was unsuccessful. Error code: ' + err.status);
          }

          if (res.status == 200) {
            self.log('VPN was successfully modified or overwritten in the data store. Status code: ' + res.status);
          }

          if (res.status == 201) {
            self.log('VPN was successfully created and mounted in the data store. Status code: ' + res.status);
          }

          if (res.text) {
            self.log(JSON.stringify(JSON.parse(res.text), null, 2));
          }

        });
      callback();
    });
  });

vorpal
  .command('delete l3vpn site <site_id>')
  .description('Deletes a site from the VPN. Requires site-id.')

  .action(function(args, callback) {
    var self = this;
    //var node_id = args.node_id;
    request
      .delete('http://' + odl_ip + ':8181/restconf/config/ietf-l3vpn-svc:l3vpn-svc/sites/site/' + args.site_id)
      .auth(odl_user, odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .end(function (err, res) {
        if (err || !res.ok) {
          self.log('Site was not found in the data store. Error code: ' + err.status);
        } 

        if (res.status == 200) {
          self.log('Site was successfully deleted from the data store. Status code: ' + res.status);
        }

        if (res.text) {
          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
        }

      });
      callback();
  });

  vorpal
  .command('commit l3vpn')
  .description('Commits the VPN service configurations and downloads to devices.')

  .action(function(args, callback) {
    var self = this;
    
    request
      .post('http://' + odl_ip + ':8181/restconf/operations/l3vpn-provider:process-l3vpn-svc')

      .auth(odl_user, odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .end(function (err, res) {
        if (err || !res.ok) {
          self.log('Mount attempt was unsuccessful. Error code: ' + err.status);
        } 

        if (res.status == 200) {
          self.log('Device(s) were successfully mmodified or overwritten in the data store. Status code: ' + res.status);
        }       

        if (res.status == 201) {
          self.log('Device(s) were successfully created and mounted in the data store. Status code: ' + res.status);
        }

        if (res.text) {
          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
        }

      });
      callback();

    });

vorpal
  .command('show l3vpn operational')
  .description('Displays operational data of the L3 VPN service.')

  .action(function(args, callback) {
    var self = this;
    request
      .get('http://' + odl_ip + ':8181/restconf/operational/ietf-l3vpn-svc:configured-l3vpn-svc')

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

*/
