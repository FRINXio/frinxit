var vorpal = require('vorpal')();
var request = require('superagent');
var colors = require('colors');
var credentials = require('./credentials.js')
const less = require('vorpal-less');
const grep = require('vorpal-grep');
const url = require('./URL_const');

var current_delimiter = url.DEFAULT_DELIMITER;

var creds = new credentials();

module.exports.rpad;
module.exports.creds = creds;
module.exports.responsecodehandler = responsecodehandler;

// FRINXIT will read an environmnent variable "uc_target" from its host and if it is set 
// it will use that IP address as a default host address for all REST calls towards ODL.
// If the env variable does not exist, we will use 127.0.0.1 as default. 
// The user can change the host address at any time by using the "logon odl" command.

if (process.env.uc_target){    
  creds.setUcIp(process.env.uc_target)
};

const UC_TOPOLOGIES = url.UC_URL_BASE + 
                        creds.getUcIp() + 
                        url.UC_PORT + 
                        url.UC_RESTCONF_OPERATIONAL + 
                        'network-topology:network-topology';


const UC_RESTCONF_TEST = url.UC_URL_BASE + 
                        creds.getUcIp() + 
                        url.UC_PORT + 
                        'rests/data/snapshot-manager:snapshots-metadata';


vorpal
  .delimiter('frinxit$')
//  .use(require('./routing.js'))
//  .use(require('./cluster.js'))
  .use(require('./southbound_cli.js'))
//  .use(require('./netconf.js'))
  .use(require('./interfaces.js'))
  .use(require('./uniconfig_manager.js'))
//  .use(require('./admin_01.js'))
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
    creds.setUcIp(args.node_name)
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

        if (answers.username && answers.password) {
          creds.setUcUser(answers.username)
          creds.setUcPassword(answers.password)
        }
      callback();
    });
  });


vorpal
  .command('logoff')
  .description('Discconnects from UniConfig node.')
  .alias('logo')
  .action(function(args, callback) {
    creds.setUcIp('')
    creds.setUcUser('')
    creds.setUcPassword('')    
    current_delimiter = url.DEFAULT_DELIMITER
    vorpal.delimiter(url.DEFAULT_DELIMITER + '$').show();
    callback();
  });


vorpal
  .command('test uniconfig connectivity', 'Tests connectivity to host. You need to be logged on to a UniConfig node for the test to succeed. Also see command "logon"')
  .action(function(args, callback) {
    var self = this;
    request
      .get(UC_RESTCONF_TEST)
      .auth(creds.getUcUser(), creds.getUcPassword())
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
          self.log(responsecodehandler(err, res, false));
      });

    callback();
  });


vorpal
  .command('show uniconfig topologies [depth]')
  .description('Display UniConfig topology information. Specify the depth of the tree that you would like to display with the optional \"depth\" parameter.')
  .action(function(args, callback) {
    var self = this;
    var depth = '';

    if (args.depth) {
      depth = "?depth=" + args.depth;
    }
    request
      .get(UC_TOPOLOGIES + depth)
      .auth(creds.getUcUser(), creds.getUcPassword())
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

    if (current_delimiter == 'frinxit') {
      args.options = args.options || {};
      args.options.sessionId = this.session.id;
      this.parent.exit(args.options);
    }
    else {
      current_delimiter = url.DEFAULT_DELIMITER
      vorpal.delimiter(url.DEFAULT_DELIMITER + '$').show();
      callback();
    }
	});


// provide padding function to all modules to display items with equal character distance
// e.g. cli tabs 

String.prototype.rpad || (String.prototype.rpad = function (length, pad) {

  if (length < this.length) return this;

  pad = pad || ' ';
  str = this;

  while(str.length < length) {
    str += pad;
  }
  return str.substr( 0, length );
});


// provide http response handler to all functions and commands in frinxit 

function responsecodehandler (err, res, displayResponse) {
  
  try {

    if (err || !res.ok) {
      return 'Command was unsuccessful. Error code: '.red + JSON.stringify(JSON.parse(err.code), null, 2);
    }
    if (res.status == 200 || 201) {

      if (displayResponse && res.text) {
        return 'Success. Status code: '.green + JSON.stringify(JSON.parse(res.status), null, 2) + '\n' + JSON.stringify(JSON.parse(res.text), null, 2);
      } 
      else {
        return 'Success. Status code: '.green + JSON.stringify(JSON.parse(res.status), null, 2);
      }
    } 
    else {
      return 'Response code: ' + JSON.stringify(JSON.parse(res.status), null, 2);
    }
  } 
  catch (err) {
    return 'Service not available.'.red
  }
}



