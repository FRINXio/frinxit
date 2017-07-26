
var vorpal = require('vorpal')();
var request = require('superagent');
const less = require('vorpal-less');
const grep = require('vorpal-grep');

var current_delimiter = 'frinxit';
var odl_ip = '127.0.0.1';
var odl_user = "admin";
var odl_pass = "admin";

exports.odl_ip = odl_ip;
exports.odl_user = odl_user;
exports.odl_pass = odl_pass;


const welcome_banner = "************************************************************************\n\
Welcome to frinxit, the command line tool for the FRINX ODL Distribution\n\
\n\
type \"tour admin\" to explore FRINX ODL admin commands\n\
coming soon: \"tour l3vpn\" to explore L3VPN features\n\
coming soon: \"tour l2vpn\" to explore L2VPN features\n\
coming soon: \"tour cli\" to explore our CLI southbound plugin\n\
\n\
or\n\
\n\
type \"help\" to explore CLI commands\n\
\n\
     +-------------+\n\
     |   FRINXIT   |\n\
     +------+------+       +-------------+\n\
            |              | IOS classic |\n\
     +------:------+       |     R1      |\n\
     |   ODL Host  +=======>192.168.1.122|\n\
+----+             |       +------+------+\n\
|    +------+------+ \n\
|           |\n\
|    +------v------+       +------+------+       +-------------+\n\
|    |  IOS XRv    |       | IOS classic |       |    IOS XRv  |\n\
|    |    PE1      +=======+     P1      +=======+     PE2     |\n\
|    |192.168.1.111|       |192.168.1.121|       |192.168.1.112|\n\
|    +-------------+       +------^------+       +-------^-----+\n\
|                                 |                      |\n\
+---------------------------------+----------------------+\n\
\n\
************************************************************************";

if (process.env.odl_target){    
  odl_ip = process.env.odl_target;
  self.log('odl_ip = ' + odl_ip);
}

console.log(welcome_banner);

vorpal
  .delimiter('frinxit$')
  .use(require('./l3vpn.js'))
  .use(require('./cluster.js'))
  .use(require('./southbound_cli.js'))
  .use(require('./admin_01.js'))
  .use(require('./tour_admin_01.js'))
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
      .get('http://' + odl_ip + ':8181/restconf/modules')
      .auth(odl_user, odl_pass)
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
  .command('delete nc-device <node_id>')
  .description('Deletes a netconf node in ODL. Requires node-id of the netconf device.')

  .action(function(args, callback) {
    var self = this;
    //var node_id = args.node_id;
    request
      .delete('http://' + odl_ip + ':8181/restconf/config/network-topology:network-topology/topology/topology-netconf/node/' + args.node_id)
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
      .put('http://' + odl_ip + ':8181/restconf/config/network-topology:network-topology/topology/topology-netconf/node/' + args.node_id)

      .auth(odl_user, odl_pass)
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
  .command('show nc-device <node_id>')
  .description('Displays information about a netconf node in ODL. Requires node-id.')

  .action(function(args, callback) {
    var self = this;
    var node_id = args.node_id;
    request
      .get('http://' + odl_ip + ':8181/restconf/config/network-topology:network-topology/topology/topology-netconf/node/' + args.node_id)

      .auth(odl_user, odl_pass)
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
  .command('show operational yang-ext <node_name>')
  .description('Displays ODL topology information.')

  .action(function(args, callback) {
    var self = this;
    request
      .get('http://' + odl_ip + ':8181/restconf/operational/' + 
        'network-topology:network-topology/topology/topology-netconf/' + 
        'node/' + args.node_name + '/yang-ext:mount')

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
  .command('show topologies')
  .description('Displays ODL topology information.')

  .action(function(args, callback) {

  var self = this;
  
    request
      .get('http://' + odl_ip + ':8181/restconf/operational/network-topology:network-topology')

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



//  restconf/config/ietf-l3vpn-svc:l3vpn-svc/vpn-services/vpn-service/T24T_vpn1



