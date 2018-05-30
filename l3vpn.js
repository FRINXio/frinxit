var request = require('superagent');
var l3vpn = require('./frinxit.js');

var odl_ip = l3vpn.odl_ip;
var odl_user = l3vpn.odl_user;
var odl_pass = l3vpn.odl_pass;


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
  .description('Display operational data of simulated PE device.')

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
  .description('Display L3VPN topology information.')

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
  .command('show l3vpn config')
  .description('Display L3VPN configuration data service model information.')

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
      { args.customer_as = "65000"; };

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
        default: 'CE01',
        message: 'Site ID: '
      },
      {
        type: 'input',
        name: 'vpn_id',
        default: 'bambi',
        message: 'VPN ID: '
      },
      {
        type: 'input',
        name: 'pe_id',
        default: 'PE01',
        message: 'PE node ID: '
      },
      {
        type: 'input',
        name: 'pe_iface_id',
        default: 'GigabitEthernet0/0/0/2',
        message: 'PE interface name: '
      },
      {
        type: 'input',
        name: 'pe_iface_ip',
        default: '10.9.9.1',
        message: 'PE interface IP: '
      },
      {
        type: 'input',
        name: 'pe_iface_mask',
        default: 30,
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
        default: '10.9.9.2',        
        message: 'CE interface IP: '
      },
      {
        type: 'input',
        name: 'ce_bgp_as',
        default: 65111,        
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
      .post('http://' + odl_ip + ':8181/restconf/operations/ietf-l3vpn-svc:commit-l3vpn-svc')

      .auth(odl_user, odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .end(function (err, res) {
        if (err || !res.ok) {
          self.log('Commit attempt was unsuccessful. Error code: ' + err.status);
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
    .description('Display operational data of the L3 VPN service.')

    .action(function(args, callback) {
      var self = this;
      request
        .get('http://' + odl_ip + ':8181/restconf/operational/ietf-l3vpn-svc:l3vpn-svc')

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
