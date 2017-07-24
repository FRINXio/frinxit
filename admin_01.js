var request = require('superagent');
var admin = require('./frinxit.js');

var odl_ip = admin.odl_ip;
var odl_user = admin.odl_user;
var odl_pass = admin.odl_pass;


module.exports = function (vorpal) {
  vorpal
    .command('show odl version')
    .description('Display the version of the FRINX ODL Distribution.')
    .action(function(args, callback) {
      var self = this;
      request
        .post('http://' + odl_ip + ':8181/restconf/operations/installer:show-version')
        .auth(odl_user, odl_pass)
        .accept('application/json')
        .set('Content-Type', 'application/yang.data+json')

        .end(function (err, res) {

          if (err || !res.ok) {
            self.log('Error code: ' + err.status);
          } 

          if (res.status == 200) {
            self.log('Status code: ' + res.status);
          }

          var version = JSON.parse(res.text);

          self.log(JSON.stringify(version.output, null, 2));

        });
        callback();
    });

  vorpal
    .command('show odl features')
    .description('Display features installed in FRINX ODL Distribution.')
    .option('-i, --installed', 'Only display installed features.')
    .action(function(args, callback) {
      var self = this;
      var installed = false;
      request
        .get('http://' + odl_ip + ':8181/restconf/operational/installer:features')
        .auth(odl_user, odl_pass)
        //.accept('application/json, text/plain ,*/*')
        //.set('Content-Type', 'application/yang.data+json')

        .end(function (err, res) {

          if (err || !res.ok) {
            self.log('Error code: ' + err.status);
          } 

          if (res.status == 200) {
            self.log('Status code: ' + res.status);
          }

          if (typeof args.options.installed == 'undefined' ) { installed = false; } else { installed = true; };

          if (installed) {
          
          var features = JSON.parse(res.text);
          var features_list = [];

          for (var i = 0; i < features['features']['features-list'].length; i++) {

            var feature_key = features['features']['features-list'][i];

            features_list.push(feature_key['feature-key']);

          }
          
          features_list.sort();
          self.log(features_list);

          //self.log(JSON.stringify(feature_list, null, 2));

          } 
          else
          {
          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
          }

        });
        callback();
    });   

  vorpal
    .command('show odl monitor-resources')
    .description('Display resource information about the ODL host.')
    .action(function(args, callback) {
      var self = this;
      request
        .post('http://' + odl_ip + ':8181/restconf/operations/installer:monitor-resources')
        .auth(odl_user, odl_pass)
        //.accept('application/json, text/plain ,*/*')
        //.set('Content-Type', 'application/yang.data+json')

        .end(function (err, res) {

          if (err || !res.ok) {
            self.log('Error code: ' + err.status);
          } 

          if (res.status == 200) {
            self.log('Status code: ' + res.status);
          }

          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
          //self.log(res.text);

        });
        callback();
    });  



vorpal
  .command('show odl yang-models', 'Retrieve all YANG models in connected ODL node')

  .action(function(args, callback) {
    var self = this;
    request
      .get('http://' + odl_ip + ':8181/restconf/modules')

      .auth(odl_user, odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')
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
  .command('logon <node_name>')
  .description('Connects to an ODL node.')
  .alias('log')
  .action(function(args, callback) {
      var self = this;
      this.log('Connecting to ' + args.node_name);
      current_delimiter = args.node_name;
      odl_ip = args.node_name;
      this.delimiter('<' + current_delimiter + '>$');
      this.prompt([
        {
          type: 'input',
          name: 'username',
          message: 'Username: '
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password: '
        }
        ], function (answers) {
          if (answers.username) {
            odl_user = answers.username;
            odl_pass = answers.password;
          }
        callback();
      });
  });

vorpal
  .command('logoff')
  .description('Discconnects from an ODL node.')
  .alias('logo')
  .action(function(args, callback) {
    odl_ip = '';
    odl_user = '';
    odl_pass = '';
    current_delimiter = 'frinxit';
    vorpal.delimiter('frinxit$').show();
    callback();
  });

}


/*
//curl 'http://localhost:8181/restconf/operational/installer:features' -H 'Host: localhost:8181' -H 'Accept: application/json, text/plain, *'/*' -H 'Accept-Language: en-US,en;q=0.5' -H 'Authorization: Basic YWRtaW46YWRtaW4='



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
              self.log(JSON.stringify(JSON.parse(res.text), null, 2));
            }
          });

          callback();
      });

  });

}

*/
