var request = require('superagent');
var l2vpn = require('./frinxit.js');

var odl_ip = l2vpn.odl_ip;
var odl_user = l2vpn.odl_user;
var odl_pass = l2vpn.odl_pass;


module.exports = function (vorpal) {


vorpal
  .command('show l2vpn config')
  .description('Display L2VPN configuration data service model information.')

  .action(function(args, callback) {
    var self = this;
    request
      .get('http://' + odl_ip + ':8181/restconf/config/ietf-l2vpn:l2vpn/')

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
    .command('show l2vpn operational [l2vpn_instance_id]')
    .description('Display operational data of the L2 VPN service. Optionally sepcify a l2vpn instance id for more detailed information.')

    .action(function(args, callback) {
      var self = this;

      if (!args.l2vpn_instance_id) {

      request
        .get('http://' + odl_ip + ':8181/restconf/operational/ietf-l2vpn:l2vpn/')

        .auth(odl_user, odl_pass)
        .accept('application/json')
        .set('Content-Type', 'application/json')

        .end(function (err, res) {

          if (err || !res.ok) {
            self.log('Error code: ' + err.status);
          } 

          if (res.status == 200) {
            self.log('Status code: ' + res.status);

            var l2vpn_instances = JSON.parse(res.text);
            var node_item = '';
            var endpoint = '';
            var pseudowire = '';

            self.log("L2VPN instance ID" + "\t\t\t" + "PE A" + "\t\t\t" + "PE Z");
            for (var i = 0; i < l2vpn_instances['l2vpn']['l2vpn-instances']['l2vpn-instance'].length; i++) {
              node_item = l2vpn_instances['l2vpn']['l2vpn-instances']['l2vpn-instance'][i];


              self.log(node_item['name'].green + "\t\t\t" + node_item['endpoint'][0]['pe-node-id'] + "\t\t\t" 
                + node_item['endpoint'][1]['pe-node-id']);
            }
          }

        });

      } else {

      request
        .get('http://' + odl_ip + ':8181/restconf/operational/ietf-l2vpn:l2vpn/')

        .auth(odl_user, odl_pass)
        .accept('application/json')
        .set('Content-Type', 'application/json')

        .end(function (err, res) {

          if (err || !res.ok) {
            self.log('Error code: ' + err.status);
          } 

          if (res.status == 200) {
            self.log('Status code: ' + res.status);
            var l2vpn_instances = JSON.parse(res.text);

            for (var i = 0; i < l2vpn_instances['l2vpn']['l2vpn-instances']['l2vpn-instance'].length; i++) {
              node_item = l2vpn_instances['l2vpn']['l2vpn-instances']['l2vpn-instance'][i];
              if (node_item['name'] == args.l2vpn_instance_id) {
                self.log(node_item);
              }
            }
          }

        });
      }
      callback();
    });




vorpal
  .command('create l2vpn pw-template <pw_template_id> [cw_negotiation] [encapsulation]')
  .description('Creates a pseudo wire template for the L2VPN service. Use \"commit l2vpn\" command to push configuration to devices.')

  .action(function(args, callback) {
    var self = this;
    
      //hack default settings
    if (typeof args.cw_negotiation == 'undefined' ) 
      { args.cw_negotiation= "preferred"; };

    if (typeof args.encapsulation== 'undefined' ) 
      { args.encapsulation = "mpls"; };

    request
      .put('http://' + odl_ip + ':8181/restconf/config/ietf-l2vpn:l2vpn/pw-templates/pw-template/' + args.pw_template_id)

      .auth(odl_user, odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .send('{\
              "pw-template":[\
                {\
                  "name":"'+ args.pw_template_id +'",\
                  "cw-negotiation":"' + args.cw_negotiation +'",\
                  "encapsulation":"' + args.encapsulation + '"\
                }\
              ]\
            }')

      .end(function (err, res) {
              if (err || !res.ok) {
                self.log('Creation attempt was unsuccessful. Error code: '.red + err.status);
              } 

              if (res.status == 200) {
                self.log('Pseudo wire template was successfully modified or overwritten in the data store. Status code: '.green + res.status);
              }       

              if (res.status == 201) {
                self.log('Pseudo wire was successfully created and mounted in the data store. Status code: '.green + res.status);
              }

              if (res.text) {
                self.log(JSON.stringify(JSON.parse(res.text), null, 2));
              }

            });
            callback();
        });

vorpal
  .command('create l2vpn instance')
  .description('Creates an instance of a L2VPN service between two endpoints  in the L2VPN service module in ODL.')
  .action(function(args, callback) {
    var self = this;

    this.prompt([{
        type: 'input',
        name: 'l2vpn_instance_name',
        default: 'ce1-ce2_vlan3001',
        message: 'L2VPN instance ID: '
      },
      {
        type: 'input',
        name: 'l2vpn_instance_type',
        default: 'vpws-instance-type',
        message: 'Instance type: '
      },
      {
        type: 'input',
        name: 'service_type',
        default: 'Ethernet',
        message: 'Service type: '
      },
      {
        type: 'input',
        name: 'signaling_type',
        default: 'ldp-signaling',
        message: 'Signaling type: '
      },
      {
        type: 'input',
        name: 'tenant_id',
        default: 'frinx',
        message: 'Tenant ID: '
      },
      {
        type: 'input',
        name: 'pwaz_name',
        default: 'pe1_pw999_vlan3001',
        message: 'Pseudo wire (A->Z) name : '
      },
      {
        type: 'input',
        name: 'pwaz_template',
        default: 'PW1',
        message: 'Pseudo wire (A->Z) template: '
      },
      {
        type: 'input',
        name: 'pwaz_peer_ip',
        default: '99.0.0.2',
        message: 'Pseudo wire (A->Z) peer IP: '
      },
      {
        type: 'input',
        name: 'pwaz_id',
        default: '999',
        message: 'Pseudo wire (A->Z) ID: '
      },
      {
        type: 'input',
        name: 'pwaz_request_vlanid',
        default: '3001',        
        message: 'Pseudo wire (A->Z) VLAN ID: '
      },
      {
        type: 'input',
        name: 'pwza_name',
        default: 'pe2_pw999_vlan3001',
        message: 'Pseudo wire (Z->A) name : '
      },
      {
        type: 'input',
        name: 'pwza_template',
        default: 'PW1',
        message: 'Pseudo wire (Z->A) template: '
      },
      {
        type: 'input',
        name: 'pwza_peer_ip',
        default: '99.0.0.1',
        message: 'Pseudo wire (Z->A) peer IP: '
      },
      {
        type: 'input',
        name: 'pwza_id',
        default: '999',
        message: 'Pseudo wire (Z->A) ID: '
      },
      {
        type: 'input',
        name: 'pwza_request_vlanid',
        default: '3001',        
        message: 'Pseudo wire (Z->A) VLAN ID: '
      },
      {
        type: 'input',
        name: 'epa_name',
        default: 'CE01',
        message: 'Endpoint A name : '
      },
      {
        type: 'input',
        name: 'epa_pe_node_id',
        default: 'PE01',
        message: 'Endpoint A Attachment PE: '
      },
      {
        type: 'input',
        name: 'epa_pe_2_ce_tp_id',
        default: 'GigabitEthernet0/0/0/1',
        message: 'Endpoint A - PE attachment interface: '
      },
      {
        type: 'input',
        name: 'epa_pw_name',
        default: 'pe1_pw999_vlan3001',
        message: 'Endpoint A - PE pseudo wire name: '
      },
      {
        type: 'input',
        name: 'epz_name',
        default: 'CE02',
        message: 'Endpoint Z name : '
      },
      {
        type: 'input',
        name: 'epz_pe_node_id',
        default: 'PE02',
        message: 'Endpoint Z Attachment PE: '
      },
      {
        type: 'input',
        name: 'epz_pe_2_ce_tp_id',
        default: 'GigabitEthernet0/0/0/1',
        message: 'Endpoint Z - PE attachment interface: '
      },
      {
        type: 'input',
        name: 'epz_pw_name',
        default: 'pe2_pw999_vlan3001',
        message: 'Endpoint Z - PE pseudo wire name: '
      }
    ], function(answers) {
      request
        .put('http://' + odl_ip + ':8181/restconf/config/ietf-l2vpn:l2vpn/l2vpn-instances/l2vpn-instance/' + answers.l2vpn_instance_name 
          + '/ietf-l2vpn:vpws-instance-type')
        .auth(odl_user, odl_pass)
        .accept('application/json')
        .set('Content-Type', 'application/json')

        .send('{\
          "l2vpn-instance":[\
            {\
              "name":"'+ answers.l2vpn_instance_name +'",\
              "type":"'+ answers.l2vpn_instance_type +'",\
              "service-type":"' + answers.service_type + '",\
              "signaling-type":"' + answers.signaling_type + '",\
              "tenant-id":"' + answers.tenant_id + '",\
              "pw":[\
                {\
                  "name":"' + answers.pwaz_name + '",\
                  "template":"' + answers.pwaz_template + '",\
                  "peer-ip":"' + answers.pwaz_peer_ip + '",\
                  "pw-id":"' + answers.pwza_id + '",\
                  "request-vlanid":"' + answers.pwaz_request_vlanid + '"\
                },\
                {\
                  "name":"' + answers.pwza_name + '",\
                  "template":"' + answers.pwza_template + '",\
                  "peer-ip":"' + answers.pwza_peer_ip + '",\
                  "pw-id":"' + answers.pwza_id + '",\
                  "request-vlanid":"' + answers.pwza_request_vlanid + '"\
                }\
              ],\
              "endpoint":[\
                {\
                  "name":"' + answers.epa_name + '",\
                  "pe-node-id":"' + answers.epa_pe_node_id + '",\
                  "pe-2-ce-tp-id":"' + answers.epa_pe_2_ce_tp_id + '",\
                  "pw":[\
                    {\
                      "name":"' + answers.epa_pw_name + '"\
                    }\
                  ]\
                },\
                {\
                  "name":"' + answers.epz_name + '",\
                  "pe-node-id":"' + answers.epz_pe_node_id + '",\
                  "pe-2-ce-tp-id":"' + answers.epz_pe_2_ce_tp_id + '",\
                  "pw":[\
                    {\
                      "name":"' + answers.epz_pw_name + '"\
                    }\
                  ]\
                }\
              ]\
            }\
          ]\
        }')


        .end(function(err, res) {
          if (err || !res.ok) {
            self.log('Creation attempt was unsuccessful. Error code: '.red + err.status);
          }

          if (res.status == 200) {
            self.log('VPN was successfully modified or overwritten in the data store. Status code: '.green + res.status);
          }

          if (res.status == 201) {
            self.log('VPN was successfully created and mounted in the data store. Status code: '.green + res.status);
          }

          if (res.text) {
            self.log(JSON.stringify(JSON.parse(res.text), null, 2));
          }

        });
      callback();
    });
  });

vorpal
  .command('commit l2vpn')
  .description('Commits the L2VPN service configurations and downloads to devices.')

  .action(function(args, callback) {
    var self = this;
    
    request
      .post('http://' + odl_ip + ':8181/restconf/operations/ietf-l2vpn:commit-l2vpn')

      .auth(odl_user, odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .end(function (err, res) {
        if (err || !res.ok) {
          self.log('Commit was unsuccessful. Error code: '.red + err.status);
        } 

        if (res.status == 200) {
          self.log('Device(s) were successfully modified or overwritten in the data store. Status code: '.green + res.status);
        }       

        if (res.status == 201) {
          self.log('Device(s) were successfully created and mounted in the data store. Status code: '.green + res.status);
        }

        if (res.text) {
          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
        }

      });
      callback();
    });


vorpal
    .command('delete l2vpn instance <l2vpn_instance_id>')
    .description('Deletes a L2VPN instance from the FRINX ODL service model. Requires l2vpn_instance_id. Requires "commit l2vpn" \
to also remove from operational data store and devices.')

    .action(function(args, callback) {
      var self = this;
      //var node_id = args.node_id;
      request
        .delete('http://' + odl_ip + ':8181/restconf/config/ietf-l2vpn:l2vpn/l2vpn-instances/l2vpn-instance/' + 
          args.l2vpn_instance_id+ '/ietf-l2vpn:vpws-instance-type')
        .auth(odl_user, odl_pass)
        .accept('application/json')
        .set('Content-Type', 'application/json')

        .end(function (err, res) {
          if (err || !res.ok) {
            self.log('L2VPN Instance was not found in the data store. Error code: '.red + err.status);
          } 

          if (res.status == 200) {
            self.log('L2VPN was successfully deleted from the data store. Status code: '.green + res.status);
          }

          if (res.text) {
            self.log(JSON.stringify(JSON.parse(res.text), null, 2));
          }

        });
        callback();
  });


vorpal
    .command('delete l2vpn pw-template <pw_template_id>')
    .description('Deletes a pseudo wire template from the FRINX ODL config data store. Requires pw_template_id. Requires "commit l2vpn" \
to also remove from operational data store and devices.')

    .action(function(args, callback) {
      var self = this;
      //var node_id = args.node_id;
      request
        .delete('http://' + odl_ip + ':8181/restconf/config/ietf-l2vpn:l2vpn/pw-templates/pw-template/' + args.pw_template_id)
        .auth(odl_user, odl_pass)
        .accept('application/json')
        .set('Content-Type', 'application/json')

        .end(function (err, res) {
          if (err || !res.ok) {
            self.log('L2VPN pseudo wire template was not found in the data store. Error code: '.red + err.status);
          } 

          if (res.status == 200) {
            self.log('L2VPN pseudo wire template was successfully deleted from the data store. Status code: '.green + res.status);
          }

          if (res.text) {
            self.log(JSON.stringify(JSON.parse(res.text), null, 2));
          }

        });
        callback();
  });


}
