
var vorpal = require('vorpal')();
var request = require('superagent');
const less = require('vorpal-less');
const grep = require('vorpal-grep');
const url = require('./URL_const');

var current_delimiter = 'frinxit';

global.odl_ip = '127.0.0.1';
global.odl_user = "admin";
global.odl_pass = "admin";

exports.rpad;
module.exports.responsecodehandler = responsecodehandler;

// FRINXIT will read an environmnent variable "odl_target" from its host and if it is set 
// it will use that IP address as a default host address for all REST calls towards ODL.
// If the env variable does not exist, we will use 127.0.0.1 as default. 
// The user can change the host address at any time by using the "logon odl" command.

if (process.env.odl_target){    
  global.odl_ip = process.env.odl_target;
};


const ODL_TOPOLOGIES = url.ODL_URL_BASE + 
                        global.odl_ip + 
                        url.ODL_PORT + 
                        url.ODL_RESTCONF_OPERATIONAL + 
                        'network-topology:network-topology';


const ODL_RESTCONF_TEST = url.ODL_URL_BASE + 
                        global.odl_ip + 
                        url.ODL_PORT + 
                        'restconf/modules';


vorpal
  .delimiter('frinxit$')
  .use(require('./routing.js'))
  .use(require('./cluster.js'))
  .use(require('./southbound_cli.js'))
  .use(require('./netconf.js'))
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
  .command('test odl connectivity', 'Tests connectivity to host. \
  You need to be logged on to an ODL node for the test to succeed. Also see \
  command "logon"')
  .action(function(args, callback) {
    var self = this;
    request
      .get(ODL_RESTCONF_TEST)
      .auth(global.odl_user, global.odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
          self.log(responsecodehandler(err, res, false));
      });
    callback();
  });


vorpal
  .command('show odl topologies [depth]')
  .description('Display ODL topology information. Specify the depth of the tree that you would like to display with the optional \"depth\" parameter.')
  .action(function(args, callback) {
    var self = this;
    var depth = '';

    if (args.depth) {
      depth = "?depth=" + args.depth;
    }

    request
      .get(ODL_TOPOLOGIES + depth)
      .auth(global.odl_user, global.odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
          self.log(responsecodehandler(err, res, true));
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
String.prototype.rpad || (String.prototype.rpad = function (length, pad) {

    if (length < this.length) return this;

    pad = pad || ' ';
    str = this;

    while( str.length < length )
    {
      str += pad;
    }

    return str.substr( 0, length );
});



function responsecodehandler (err, res, displayResponse) {

  try {

    if (err || !res.ok) {
      return 'Command was unsuccessful. Error code: '.red + err.code;
    } 

    if (res.status == 200 || 201) {

      if (displayResponse && res.text) {
        return 'Success. Status code: '.green + res.status + '\n' + JSON.stringify(JSON.parse(res.text), null, 2);
      } 
      else {
        return 'Success. Status code: '.green + res.status;
      }
    } 
    else {
      return 'Response code: ' + res.status;
    }
    
  } catch(err) {
    return 'Service not available.'.red
  }
}



