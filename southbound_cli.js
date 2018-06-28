var request = require('superagent');
var cli = require('./frinxit.js');

var odl_ip = cli.odl_ip;
var odl_user = cli.odl_user;
var odl_pass = cli.odl_pass;

const DEFAULT_DRYRUN_JOURNAL_SIZE = 150;
const DEFAULT_JOURNAL_SIZE = 150;
const KEEPALIVE_DELAY = 55;
const KEEPALIVE_INITIAL_DELAY = 55;
const KEEPALIVE_TIMEOUT = 120;

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
        var node_list = {};

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
                    node_list[node_item['node-id']] = [node_item['cli-topology:host'], node_item['cli-topology:connection-status']];
                  }
                  var keys = Object.keys(node_list);
                  keys.sort();


                  for (var i=0; i<keys.length; i++) {
                    var key = keys[i];
                    if (node_list[key][1] === "connected"){
                      self.log(key.rpad(20) + node_list[key][0].rpad(20) + node_list[key][1].rpad(20).green);
                    } else {
                      self.log(key.rpad(40) + node_list[key][1].rpad(20).red);                      
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
          node_id = "node/" + args.node_id;

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
  .command('mount cli <node_id> <host_ip> <username> <password> <device_type>')
  .description('Mount a CLI device via ssh and telnet transport layer. Default transport-type is ssh and default port is 22. You can \
find out the supported device types in your version of FRINX ODL by typing: \'show cli translate-registry | grep device-type\'')
  .option('-t, --telnet', 'Sets transport type from ssh (default) to telnet')
  .option('-p, --port <port>', 'Change default port from ssh = 22 or telnet = 23')
  .option('-d, --dryrun <dr_journal_size>', 'set journal size for dry-run')
  .option('-j, --journal <journal_size>', 'set journal size')
  .option('-v, --device_version <device_version>', 'set specific device version, e.g. \'15.0\' or \'15.2(14)T\'')
  .types({
    string: ['v', 'device_version']
  })
  .action(function(args, callback) {
    var self = this;
    var transport_type = 'ssh';
    
      //hack default settings
    if ( typeof args.options.device_version == 'undefined' ) { 
        args.options.device_version = "15.2";
      };

    if ( typeof args.options.telnet == 'undefined' ) { 
        transport_type = 'ssh'; 
        if (typeof args.options.port == 'undefined' ) { 
          args.options.port = '22';
          };
      };

    if ( args.options.telnet == true ) { 
        transport_type = 'telnet';
        if ( typeof args.options.port == 'undefined' ) { 
          args.options.port = '23';
          };
      };

    if ( typeof args.options.dryrun == 'undefined' ) { 
        args.options.dryrun = DEFAULT_DRYRUN_JOURNAL_SIZE;
      };

    if ( typeof args.options.journal == 'undefined' ) { 
        args.options.journal = DEFAULT_JOURNAL_SIZE;
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
                    "cli-topology:port" : "' + args.options.port + '",\
                    "cli-topology:transport-type" : "' + transport_type+ '",\
                    "cli-topology:device-type" : "' + args.device_type + '",\
                    "cli-topology:device-version" : "' + args.options.device_version + '",\
                    "cli-topology:username" : "' + args.username + '",\
                    "cli-topology:password" : "' + args.password + '",\
                    "cli-topology:journal-size": "'+ args.options.journal +'",\
                    "cli-topology:dry-run-journal-size": "'+ args.options.dryrun +'",\
                    "cli-topology:keepalive-delay": "'+ KEEPALIVE_DELAY +'",\
                    "cli-topology:keepalive-initial-delay": "'+ KEEPALIVE_INITIAL_DELAY +'",\
                    "cli-topology:keepalive-timeout": "'+ KEEPALIVE_TIMEOUT +'"\
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
          .post('http://' + odl_ip + ':8181/restconf/operations/network-topology:network-topology/topology/cli-dryrun/node/' + args.node_id + '/yang-ext:mount/journal:read-journal')
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


   vorpal
      .command('demo delete ospf_1 <node_id>')
      .description('Deletes ospf process 1 on <node-id> via CLI command (requires IOS XR 6.1 or higher).')
      .action(function(args, callback) {
        var self = this;
        var cli_command = "conf t\n\
no router ospf 1\n\
commit\n\
exit\n }}"

        request
          .post('http://' + odl_ip + ':8181/restconf/operations/network-topology:network-topology/topology/cli/node/' + args.node_id + '/yang-ext:mount/cli-unit-generic:execute-and-read')
          .auth(odl_user, odl_pass)
          .accept('application/json')
          .set('Content-Type', 'application/json')

          .send({ "input" : { "ios-cli:command" : cli_command }})

          .end(function (err, res) {

            if (err || !res.ok) {
              self.log('Error code: ' + err.status);
            } 

            if (res.status == 200) {
              self.log('Status code: ' + res.status);
            }

          });
          callback();
      }); 


vorpal
  .command('demo dryrun create loopback <node_id>')
  .description('Creates Loopback 789 on <node_id>')
  .action(function(args, callback) {
    var self = this;
    var interface_name = "Loopback789";

    request
      .put('http://' + odl_ip + ':8181/restconf/config/network-topology:network-topology/topology/cli-dryrun/node/' 
        + args.node_id + '/yang-ext:mount/frinx-openconfig-interfaces:interfaces/interface/' + interface_name)

      .auth(odl_user, odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .send('{\
    "interface": [\
        {\
            "name": "' + interface_name + '",\
            "config": {\
                "type": "iana-if-type:softwareLoopback",\
                "enabled": false,\
                "name": "' + interface_name + '"\
            }\
        }\
    ]\
}')

      .end(function (err, res) {
        if (err || !res.ok) {
          self.log('Dry-run interface creation was unsuccessful. Error code: ' + err.status);
        } 

        if (res.status == 200 || res.status == 201) {
          self.log('Dry-run interface creation was successfully executed. Status code: ' + res.status);
        }       

        if (res.text) {

          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
        }
      });

      callback();

  });

}


