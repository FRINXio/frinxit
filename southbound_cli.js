var request = require('superagent');
var frinxit = require('./frinxit.js');
const url = require('./URL_const');

const DEFAULT_TRANSPORT_TYPE_SSH = 'ssh'
const DEFAULT_TRANSPORT_TYPE_TELNET = 'telnet'
const DEFAULT_SSH_PORT = '22'
const DEFAULT_TELNET_PORT = '23'
const DEFAULT_IOS_VERSION = '15.4'
const DEFAULT_IOSXR_VERSION = '6.0'


const DEFAULT_DRYRUN_JOURNAL_SIZE = 150
const DEFAULT_JOURNAL_SIZE = 150
const KEEPALIVE_DELAY = 55
const KEEPALIVE_INITIAL_DELAY = 55
const KEEPALIVE_TIMEOUT = 120

const UC_TRANSLATE_REGISTRY = url.UC_URL_BASE + 
                        frinxit.creds.getUcIp() + 
                        url.UC_PORT +
                        url.UC_RESTCONF_OPERATIONAL +
                        'cli-translate-registry:available-cli-device-translations';

const UC_CLI_OPERATIONAL = url.UC_URL_BASE + 
                        frinxit.creds.getUcIp() + 
                        url.UC_PORT +
                        url.UC_RESTCONF_OPERATIONAL +
                        'network-topology:network-topology/topology=cli';

const UC_CLI_CONFIG = url.UC_URL_BASE + 
                        frinxit.creds.getUcIp() + 
                        url.UC_PORT +
                        url.UC_RESTCONF_CONFIG +
                        'network-topology:network-topology/topology/cli/';

const UC_CLI_OPERATIONS = url.UC_URL_BASE + 
                        frinxit.creds.getUcIp() + 
                        url.UC_PORT +
                        url.UC_RESTCONF_OPERATIONS +
                        'network-topology:network-topology/topology/cli/';

const UC_CLI_DRYRUN_OPERATIONS = url.UC_URL_BASE + 
                        frinxit.creds.getUcIp() + 
                        url.UC_PORT +
                        url.UC_RESTCONF_OPERATIONS +
                        'network-topology:network-topology/topology/cli-dryrun/';                        

const UC_CLI_DRYRUN_CONFIG = url.UC_URL_BASE + 
                        frinxit.creds.getUcIp() + 
                        url.UC_PORT +
                        url.UC_RESTCONF_CONFIG +
                        'network-topology:network-topology/topology/cli-dryrun/';      


module.exports = function (vorpal) {


vorpal
  .command('show cli translate-registry')
  .description('Display available translation units.')
  .action(function(args, callback) {
    var self = this;
    request
      .get(UC_TRANSLATE_REGISTRY)
      .auth(frinxit.creds.getUcUser(), frinxit.creds.getUcPassword())
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));
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
        .get(UC_CLI_OPERATIONAL)
        .auth(frinxit.creds.getUcUser(), frinxit.creds.getUcPassword())
        .accept('application/json')
        .set('Content-Type', 'application/json')
        .end(function (err, res) {
          self.log(frinxit.responsecodehandler(err, res, false));

          try {
            if (res.status == 200) {
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
                self.log(frinxit.responsecodehandler(err, res, false));
              }
            }
          }
          catch (err) {
            self.log(frinxit.responsecodehandler(err, res, false));
          }
        });
    }
    else { 
      node_id = "node/" + args.node_id;
      request
        .get(UC_CLI_OPERATIONAL + node_id)
        .auth(frinxit.creds.getUcUser(), frinxit.creds.getUcPassword())
        .accept('application/json')
        .set('Content-Type', 'application/json')
        .end(function (err, res) {
          self.log(frinxit.responsecodehandler(err, res, true));
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

      if (typeof args.node_id == 'undefined' ) { 
        args.node_id = ""; 
      }
      else { 
        node_id = "node/" + args.node_id
      }

      request
        .get(UC_CLI_CONFIG + node_id)
        .auth(frinxit.creds.getUcUser(), frinxit.creds.getUcPassword())
        .accept('application/json')
        .set('Content-Type', 'application/json')
        .end(function (err, res) {
          self.log(frinxit.responsecodehandler(err, res, true));
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
    var transport_type = DEFAULT_TRANSPORT_TYPE_SSH;
    
    if ( typeof args.options.device_version == 'undefined' ) {
      if (args.device_type == 'ios') {
        args.options.device_version = DEFAULT_IOS_VERSION
      }
      if (args.device_type == 'ios xr') {
        args.options.device_version = DEFAULT_IOSXR_VERSION
      }
    }

    if ( typeof args.options.telnet == 'undefined' ) { 
      transport_type = DEFAULT_TRANSPORT_TYPE_SSH; 

      if (typeof args.options.port == 'undefined' ) { 
        args.options.port = DEFAULT_SSH_PORT;
      }
    }

    if ( args.options.telnet == true ) { 
      transport_type = DEFAULT_TRANSPORT_TYPE_TELNET;

      if ( typeof args.options.port == 'undefined' ) { 
        args.options.port = DEFAULT_TELNET_PORT;
      }
    }

    if ( typeof args.options.dryrun == 'undefined' ) { 
      args.options.dryrun = DEFAULT_DRYRUN_JOURNAL_SIZE;
    }

    if ( typeof args.options.journal == 'undefined' ) { 
      args.options.journal = DEFAULT_JOURNAL_SIZE;
    }

    request
      .put(UC_CLI_CONFIG + 'node/' + args.node_id)
      .auth(frinxit.creds.getUcUser(), frinxit.creds.getUcPassword())
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
        self.log(frinxit.responsecodehandler(err, res, true));
      });
    callback();
  });


vorpal
  .command('delete cli <node_id>')
  .description('Deletes a device from the cli topology.')
  .action(function(args, callback) {
    var self = this;
    request
      .delete(UC_CLI_CONFIG + 'node/' + args.node_id)
      .auth(frinxit.creds.getUcUser(), frinxit.creds.getUcPassword())
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));
      });
    callback();
  });


vorpal
  .command('exec cli show version <node_id>')
  .description('Executes show version command on device and Display structured data.')
  .action(function(args, callback) {
    var self = this;
    request
      .get(UC_CLI_OPERATIONAL + 'node/' + args.node_id + '/yang-ext:mount/frinx-openconfig-platform:components')
      .auth(frinxit.creds.getUcUser(), frinxit.creds.getUcPassword())
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));
      });
    callback();
  });  


vorpal
  .command('show cli journal <node_id>')
  .description('Displays the journal of <node-id>.')
  .action(function(args, callback) {
    var self = this;
    request
      .post(UC_CLI_OPERATIONS + 'node/' + args.node_id + '/yang-ext:mount/journal:read-journal')
      .auth(frinxit.creds.getUcUser(), frinxit.creds.getUcPassword())
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, false));

        try {
          var output = (JSON.parse(res.text));
          self.log(output['output']['journal']);
        } 
        catch (err) {
          self.log(frinxit.responsecodehandler(err, res, false));
        }       
      });
    callback();
  }); 


  vorpal
    .command('show cli dry-run-journal <node_id>')
    .description('Displays the journal of <node-id>.')
    .action(function(args, callback) {
      var self = this;
      request
        .post(UC_CLI_DRYRUN_OPERATIONS + 'node/' + args.node_id + '/yang-ext:mount/journal:read-journal')
        .auth(frinxit.creds.getUcUser(), frinxit.creds.getUcPassword())
        .accept('application/json')
        .set('Content-Type', 'application/json')
        .end(function (err, res) {
          self.log(frinxit.responsecodehandler(err, res, false));

          try {
            var output = (JSON.parse(res.text));
            self.log(output['output']['journal']);
          } 
          catch (err) {
            self.log(frinxit.responsecodehandler(err, res, false));
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
    }], function(answers) {
      request
        .post(UC_CLI_OPERATIONS + 'node/' + args.node_id + '/yang-ext:mount/cli-unit-generic:execute-and-read')
        .auth(frinxit.creds.getUcUser(), frinxit.creds.getUcPassword())
        .accept('application/json')
        .set('Content-Type', 'application/json')
        .send({ "input" : { "ios-cli:command" : answers.command }})
        .end(function (err, res) {
          self.log(frinxit.responsecodehandler(err, res, false));

          try {
            var output = (JSON.parse(res.text));
            self.log(output['output']['outputl']);
          } 
          catch (err) {
            self.log(frinxit.responsecodehandler(err, res, false));
          }  
        });
      callback();
    });
  });

}


