
var vorpal = require('vorpal')();
var request = require('superagent');
const less = require('vorpal-less');
const grep = require('vorpal-grep');

var current_delimiter = 'frinxit';

global.odl_ip = '127.0.0.1';
global.odl_user = "admin";
global.odl_pass = "admin";

exports.rpad;

// FRINXIT will read an environmnent variable "odl_target" from its host and if it is set 
// it will use that IP address as a default host address for all REST calls towards ODL.
// If the env variable does not exist, we will use 127.0.0.1 as default. 
// The user can change the host address at any time by using the "logon odl" command.

if (process.env.odl_target){    
  global.odl_ip = process.env.odl_target;
//  console.log('global.odl_ip = ' + global.odl_ip)
};


vorpal
  .delimiter('frinxit$')
  .use(require('./routing.js'))
  .use(require('./cluster.js'))
  .use(require('./southbound_cli.js'))
  .use(require('./interfaces.js'))
  .use(require('./uniconfig_manager.js'))
  .use(require('./admin_01.js'))
  .use(less)
  .use(grep)
  .show();


vorpal
  .command('logon <node_name>')
  .description('Connects to an ODL node.')
  .alias('log')
  .action(function(args, callback) {
      var self = this;
      this.log('Connecting to ' + args.node_name);
      current_delimiter = args.node_name;
      global.odl_ip = args.node_name;
      global.test_ip = args.node_name;
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
            global.odl_user = answers.username;
            global.odl_pass = answers.password;
          }
        callback();
      });
  });


vorpal
  .command('logoff')
  .description('Discconnects from an ODL node.')
  .alias('logo')
  .action(function(args, callback) {
    global.odl_ip = '';
    global.odl_user = '';
    global.odl_pass = '';
    current_delimiter = 'frinxit';
    vorpal.delimiter('frinxit$').show();
    callback();
  });


vorpal
  .command('test odl connectivity', 'Tests connectivity to host and port 8181. \
  You need to be logged on to an ODL node for the test to succeed. Also see \
  command "logon"')
  .action(function(args, callback) {
    var self = this;

    // check if an env variable is set
    if (process.env.odl_target){    
      var odl_target = process.env.odl_target;
      self.log('odl_target = ' + odl_target);
    }

    request
      .get('http://' + global.odl_ip + ':8181/restconf/modules')
      .auth(global.odl_user, global.odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
         if (err || !res.ok) {
               self.log('Can not connect to host or port');
             } else {
               self.log('We have connectivity!');
             }
      });
    callback();
  });


vorpal
  .command('banner')
  .description('Display the welcome banner (incl. topology diagram) again.')
  .alias('welcome')
  .action(function(args, callback) {
    var self = this;
    self.log(welcome_banner);
    callback();
  });


vorpal
  .command('delete nc-device <node_id>')
  .description('Deletes a netconf node in ODL. Requires node-id of the netconf device.')

  .action(function(args, callback) {
    var self = this;
    //var node_id = args.node_id;
    request
      .delete('http://' + global.odl_ip + ':8181/restconf/config/network-topology:network-topology/topology/topology-netconf/node/' + args.node_id)
      .auth(global.odl_user, global.odl_pass)
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
  .command('mount nc-device <node_id> <host> <port> <username> <password>')
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
    if (typeof args.options.tcp_only == 'undefined' ) { tcp_only = false; } else { tcp_only = true; };
    if (typeof args.options.keepalive_delay == 'undefined' ) { keepalive_delay = 0 } 
      else { keepalive_delay = args.options.keepalive_delay; };

    request
      .put('http://' + global.odl_ip + ':8181/restconf/config/network-topology:network-topology/topology/topology-netconf/node/' + args.node_id)

      .auth(global.odl_user, global.odl_pass)
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
  .command('show nc-device config [node_id]')
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
      .get('http://' + global.odl_ip + ':8181/restconf/config/network-topology:network-topology/topology/topology-netconf/' + node_string)

      .auth(global.odl_user, global.odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')

      .end(function (err, res) {

        if (err || !res.ok) {
          self.log('Device was not found in data store. Error code: ' + err.status);
        } 

        if (res.status == 200) {
          self.log('Device was found in data store. Status code: ' + res.status);
        }

        self.log(JSON.stringify(JSON.parse(res.text), null, 2));

      });
      callback();
  });


vorpal
  .command('show nc-device operational [node_id]')
  .description('Display information about a netconf nodes operational state in ODL. Optionally specify node-id.')


    .action(function(args, callback) {
      var self = this;
      var node_id = args.node_id;

      if (args.node_id) {

        request
          .get('http://' + global.odl_ip + ':8181/restconf/operational/network-topology:network-topology/topology/topology-netconf/node/' + args.node_id)

          .auth(global.odl_user, global.odl_pass)
          .accept('application/json')
          .set('Content-Type', 'application/json')

          .end(function (err, res) {

            if (err || !res.ok) {
              self.log('Device was not found in data store. Error code: ' + err.status);
            } 

            if (res.status == 200) {
              self.log('Device was found in data store. Status code: ' + res.status);
            }

            self.log(JSON.stringify(JSON.parse(res.text), null, 2));

          });

      } else {

            request
              .get('http://' + global.odl_ip + ':8181/restconf/operational/network-topology:network-topology/topology/topology-netconf/')

              .auth(global.odl_user, global.odl_pass)
              .accept('application/json')
              .set('Content-Type', 'application/json')

              .end(function (err, res) {

                if (err || !res.ok) {
                  self.log('Device was not found in data store. Error code: ' + err.status);
                } 

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
                    self.log(JSON.stringify(JSON.parse(res.text), null, 2));
                  }

                }
              });
      }
        callback();
    });
  
 



vorpal
  .command('show operational yang-ext <node_name>')
  .description('Display ODL topology information.')
  .hidden()
  .action(function(args, callback) {
    var self = this;
    request
      .get('http://' + global.odl_ip + ':8181/restconf/operational/' + 
        'network-topology:network-topology/topology/topology-netconf/' + 
        'node/' + args.node_name + '/yang-ext:mount')

      .auth(global.odl_user, global.odl_pass)
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
  .command('show odl topologies')
  .description('Display ODL topology information.')

  .action(function(args, callback) {

  var self = this;
  
    request
      .get('http://' + global.odl_ip + ':8181/restconf/operational/network-topology:network-topology')

      .auth(global.odl_user, global.odl_pass)
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

        //logs the entire reqest and response fields 
        //self.log(res.req);

      });
      callback();
  });


// remove the built-in vorpal exit command so we can define it for our 
// purposes. When in a context leave that context, when at the top level
// close the application
const exit = vorpal.find('exit');
  if (exit) { 
    exit
    .remove();
  }

vorpal
  .command('exit')
	.alias('quit')
	.description('Exits current mode or application.')
	.action(function (args, callback) {

      if (current_delimiter == 'frinxit'){
        args.options = args.options || {};
        args.options.sessionId = this.session.id;
        this.parent.exit(args.options);
      }
      else {
        current_delimiter = 'frinxit';
        vorpal.delimiter('frinxit$').show();
        callback();
        }
	});


// provide padding function to all modules to display items with equal character distance
// e.g. cli tabs 
String.prototype.rpad || (String.prototype.rpad = function( length, pad )
{
    if( length < this.length ) return this;

    pad = pad || ' ';
    str = this;

    while( str.length < length )
    {
        str += pad;
    }

    return str.substr( 0, length );
});

