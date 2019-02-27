var request = require('superagent');
var frinxit = require('./frinxit.js');
var xml2jsParser = require('superagent-xml2jsparser');
var fs = require('fs');
var path = require('path');
const url = require('./URL_const');

const FILENAME_CONFIG = "uni_config.json";
const FILENAME_OPERATIONAL = "uni_operational.json";
const FOLDER_NAME = "config-data";
const KNOWN_TOPOLOGIES = ['cli', 'topology-netconf', 'uniconfig']; // required to identify the snapshots we define which 
                                                                   //topologies are not snapshots and show the rest

const ODL_UNICONFIG_SYNC_FROM_NETWORK = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT +
                        url.ODL_RESTCONF_OPERATIONS +
                        'uniconfig-manager:sync-from-network';

const ODL_UNICONFIG_REPLACE_CONFIG_WITH_OPER = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT +
                        url.ODL_RESTCONF_OPERATIONS +
                        'uniconfig-manager:replace-config-with-operational';

const ODL_UNICONFIG_REPLACE_CONFIG_WITH_SNAP = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT +
                        url.ODL_RESTCONF_OPERATIONS +
                        'uniconfig-manager:replace-config-with-snapshot';

const ODL_UNICONFIG_CALCULATE_DIFF = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT +
                        url.ODL_RESTCONF_OPERATIONS +
                        'uniconfig-manager:calculate-diff';

const ODL_UNICONFIG_COMMIT = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT +
                        url.ODL_RESTCONF_OPERATIONS +
                        'uniconfig-manager:commit';

const ODL_UNICONFIG_DRYRUN_COMMIT = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT +
                        url.ODL_RESTCONF_OPERATIONS +
                        'dryrun-manager:dryrun-commit';

const ODL_UNICONFIG_CREATE_SNAP = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT +
                        url.ODL_RESTCONF_OPERATIONS +
                        'snapshot-manager:create-snapshot';

const ODL_UNICONFIG_DELETE_SNAP = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT +
                        url.ODL_RESTCONF_OPERATIONS +
                        'snapshot-manager:delete-snapshot';

const ODL_UNICONFIG_TOPOLOGY_CONFIG = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT +
                        url.ODL_RESTCONF_CONFIG +
                        'network-topology:network-topology/topology/uniconfig/';

const ODL_UNICONFIG_TOPOLOGY_OPERATIONAL = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT +
                        url.ODL_RESTCONF_OPERATIONAL +
                        'network-topology:network-topology/topology/uniconfig/';                        

const ODL_NETWORK_TOPOLOGY = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT +
                        url.ODL_RESTCONF_CONFIG +
                        'network-topology:network-topology/';


module.exports = function (vorpal) {

// ##########################################################
// RPC commands

vorpal
  .command('exec uniconfig sync-from-network <node_id>')
  .description('Updates the operational data store with the current configuration of the device <node_id>. \
  If you want to sync multiple nodes from the network to the operational data store type:\
  \"exec uniconfig sync-from-network \"IOS01, IOS02\"')
  .action(function(args, callback) {
    var self = this;

    if (typeof args.node_id == 'undefined' ){
      var node_id = "";
    } 
    else {
      var node_id = 'node: [' + args.node_id + ']';
    }

    request
      .post(ODL_UNICONFIG_SYNC_FROM_NETWORK)
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/JSON')
      .send('{\
    "input": {\
      "target-nodes": {' + node_id + '}\
    }\
}')  
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));

        try {

          if (res.status == 200) {
            self.log("Status code: " + res.status + "\nThe operational data store was successfully updated with the operational state of node " + args.node_id + '.' );
          }
        }
        catch (err) {
            self.log("Service not available. Error code: ".red + err.code)
        }

      });
    callback();
    }); 


vorpal
  .command('exec uniconfig replace-config-with-operational')
  .description('Replaces config data store with operational data store content.')
  .action(function(args, callback) {
    var self = this;
    request
      .post(ODL_UNICONFIG_REPLACE_CONFIG_WITH_OPER)
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/JSON')
      .send('{\
      "input": {\
          "target-nodes": {}\
      }\
}') 

      // TOODO: Add node-id to replace only specific nodes in config data store

      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));

        try {
          if (res.status == 200) {
            self.log("Status code: " + res.status + "\nThe config data store was successfully updated with content from the operational data store.");
          }
        }
        catch (err) {
           self.log("Service not available. Error code: ".red + err.code)
        }
      });
      callback();
  }); 


vorpal
  .command('exec uniconfig replace-config-with-snapshot <name>')
  .description('Replaces config data store with snapshot <name>.')
  .action(function(args, callback) {
    var self = this;
    request
      .post(ODL_UNICONFIG_REPLACE_CONFIG_WITH_SNAP)
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/JSON')
      .send('{\
      "input": {\
        "name": "' + args.name + '"\
      }\
  }')       

      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));

        try {

          if (res.status == 200) {
            self.log("Status code: " + res.status + "\nThe config data store was successfully updated with content from the snapshot " 
              + args.name + ".");
          }
        }
        catch (err) {
           self.log("Service not available. Error code: ".red + err.code)
        }
      });
      callback();
  }); 


vorpal
  .command('exec uniconfig commit [node_id]')
  .description('Commit operational data store content to devices. \
If you want to commit to a subset of nodes type: \"commit uniconfig \"IOS01, IOS02\"')
  .action(function(args, callback) {
    var self = this;

    if (typeof args.node_id == 'undefined' ){
      var node_id = "";
    } 
    else {
      var node_id = 'node: [' + args.node_id + ']';
    }

    request
      .post(ODL_UNICONFIG_COMMIT)
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/JSON')
      .send('{\
      "input": {\
          "target-nodes": {' + node_id + '}\
      }\
}')        
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));

        try {

          if (res.status == 200) {
            self.log("Status code: " + res.status + "\nData store content was comitted to operational data store and downloaded to devices.".green);
          }
        }
        catch (err) {
           self.log("Service not available. Error code: ".red + err.code)
        }
      });
    callback();
  }); 


vorpal
  .command('exec uniconfig dry-run-commit')
  .description('Commit operational data store content to dry-run devices.\
If you want to commit to a subset of nodes type: \"commit uniconfig dry-run \"IOS01, IOS02\"')
  .action(function(args, callback) {
    var self = this;

    if (typeof args.node_id == 'undefined' ){
      var node_id = "";
    } 
    else {
      var node_id = 'node: [' + args.node_id + ']';
    }

    request
      .post(ODL_UNICONFIG_DRYRUN_COMMIT)
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/JSON')
      .send('{\
      "input": {\
          "target-nodes": {' + node_id + '}\
      }\
}')          
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));

        try {

          if (res.status == 200) {
            self.log("Status code: " + res.status + "\nDry-run commit was executed.".green);
          }
        }
        catch (err) {
           self.log("Service not available. Error code: ".red + err.code)
        }
      });
    callback();
  }); 


vorpal
  .command('create uniconfig snapshot <name>')
  .description('Create a new snapshot <name>.')
  .action(function(args, callback) {
    var self = this;
    request
      .post(ODL_UNICONFIG_CREATE_SNAP)
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/JSON')
      .send('{\
      "input": {\
          "name": "' + args.name + '"\
      }\
}')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));

        try {

          if (res.status == 200) {
            self.log("The snapshot " + args.name.green + " was created successfully." );
          }
        }
        catch (err) {
          self.log("Service not available. Error code: ".red + err.code)
        }
      });
    callback(); 
  }); 


vorpal
  .command('delete uniconfig snapshot [name]')
  .description('Delete snapshot <name>.')
  .action(function(args, callback) {
    var self = this;
    request
      .post(ODL_UNICONFIG_DELETE_SNAP)
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/JSON')
      .send('{\
      "input": {\
          "name": "' + args.name + '"\
      }\
}')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));
      });
    callback();
  });       


// ##########################################################
// Show commands

vorpal
  .command('show uniconfig calculate-diff [node_id]')
  .description('Calculates and displays the diff between operational data store and config data store contents.')
  .action(function(args, callback) {
    var self = this;

    if (typeof args.node_id == 'undefined' ){
      var node_id = "";
    } else {
      var node_id = 'node: [' + args.node_id + ']';
    }

    request
      .post(ODL_UNICONFIG_CALCULATE_DIFF)
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('xml')
      .buffer(true)
      .parse(xml2jsParser)
      .set('Content-Type', 'application/JSON')
      .send('{\
      "input": {\
          "target-nodes": {' + node_id + '}\
      }\
}')   
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, false));

        try {

          if (typeof res.body['output']['node-with-diff'] != 'undefined') {
            node_list = res.body['output']['node-with-diff'];

            self.log("\n###################### Summary of changes ######################".blue);
            var slice = []
            for (var i = 0; i < node_list.length; i++) {
              slice = Object.keys(node_list[i])
              slice[0] = node_list[i]['node-id']
              self.log(slice)
            }

            for (var i = 0; i < node_list.length; i++) {
              self.log("\n###################### " + node_list[i]['node-id'] + " ######################");
              self.log("---- Created data in config DS compared with operational DS ----");

              try {

                for (var j = 0; j < node_list[i]['created-data'].length; j++) {
                  self.log(node_list[i]['created-data'][j]['data'][0].green);
                }

              }
              catch (err) {
                self.log("none");
              }

              self.log("---- Deleted data from config DS compared with operational DS ----");

              try {

                for (var k = 0; k < node_list[i]['deleted-data'].length; k++) {
                  self.log(node_list[i]['deleted-data'][k]['data'][0].red);
                }                    
              } 
              catch (err) {
                self.log("none");                    
              }
            }
          } 
          else {
            self.log("No diffs between config and operational datastore.");
          }
        }
        catch (err) {
          self.log(frinxit.responsecodehandler(err, res, false));
        }

      });
    callback();
  }); 


// ##########################################################
// Show commands & file access

vorpal
  .command('show uniconfig config [node_id]')
  .description('Display device configuration in config data store. Optionally specify a node-id to see a single node.')
  .action(function(args, callback) {
    var self = this;
    var node_id = "";

    if (typeof args.node_id == 'undefined') { 
      args.node_id = ""; 
    }
    else { 
      node_id = "node/" + args.node_id
    }

    request
      .get(ODL_UNICONFIG_TOPOLOGY_CONFIG + node_id)
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, false));
        var cliPath = path.join(__dirname, '.', FOLDER_NAME, FILENAME_CONFIG);
        try {
          var fileContent = JSON.stringify(JSON.parse(res.text), null, 2)
          writeFile(cliPath, fileContent).then(function (data){
            self.log(data);
          }).catch(function (err) {
            self.log(err);
          });
        }
        catch (err) {
          self.log(frinxit.responsecodehandler(err, res, false));
        }
      });
    callback();
  });


vorpal
  .command('show uniconfig operational [node_id]')
  .description('Display device configuration in operational data store. Optionally specify a node-id to see a single node.')
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
      .get(ODL_UNICONFIG_TOPOLOGY_OPERATIONAL + node_id)
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, false));
        var cliPath = path.join(__dirname, '.', FOLDER_NAME, FILENAME_OPERATIONAL);
        var fileContent = JSON.stringify(JSON.parse(res.text), null, 2);
        writeFile(cliPath, fileContent).then(function (data){
          self.log(data);
        }).catch(function (err) {
          self.log(err);
        });
      });
    callback();
  });


vorpal
  .command('show uniconfig snapshot [name]')
  .description('Display all snapshot names or specify [name] of snapshot and display snapshot [name] content.')
  .action(function(args, callback) {
    var self = this;

    if (typeof args.name == 'undefined' ) { 
      args.name = ""; 
    }

    if (args.name == '') {
      request
        .get(ODL_NETWORK_TOPOLOGY + '?depth=2')
        .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
        .accept('application/json')
        .set('Content-Type', 'application/json')
        .end(function (err, res) {
          self.log(frinxit.responsecodehandler(err, res, false));

          try {
            var topologies = JSON.parse(res.text);
            var topology_item = '';
            var topology_list = [];

            for (var i = 0; i < topologies['network-topology']['topology'].length; i++) {
              topology_item = topologies['network-topology']['topology'][i];

              if (KNOWN_TOPOLOGIES.indexOf(topology_item['topology-id']) == -1) {
                topology_list.push(topology_item['topology-id']);
              }
            }
            self.log(topology_list.sort());
          }
          catch (err) {
            self.log(frinxit.responsecodehandler(err, res, false));
          }
        });
    }
    else {
      request
        .get(ODL_NETWORK_TOPOLOGY + 'topology/' + args.name)
        .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
        .accept('application/json')
        .set('Content-Type', 'application/json')
        .end(function (err, res) {
          self.log(frinxit.responsecodehandler(err, res, true));
        });
    }
    callback();
  });


vorpal
  .command('read file <name>')
  .hidden()
  .description('Read a file.')
  .action(function(args, callback) {
    self = this;

    var cliPath = path.join(__dirname, '.', FOLDER_NAME, args.name);

    readFile(cliPath).then(function (data){
      self.log(data.toString('utf8'));
    }).catch(function (err) {
      self.log(err);
    });

    callback();
  });


vorpal
  .command('write file')
  .hidden()
  .description('Write a file.')
  .action(function(args, callback) {
    self = this;
    var fileContent = "";

    for (i = 0; i < 50; i++) { 
        fileContent += "a new number " + i + "\n";
    }

    writeFile(cliPath, fileContent).then(function (data){
      self.log(data);
      }).catch(function (err) {
      self.log(err);
    });

    callback();
  });


vorpal
  .command('copy file to-config-datastore [name]')
  .description('Copy file uni_config.cfg to config data store. Optionally specify a different filename [name]')
  .action(function(args, callback) {
    self = this;

    if (typeof args.name == 'undefined' ) 
      { args.name = FILENAME_CONFIG; }

    var cliPath = path.join(__dirname, '.', FOLDER_NAME, args.name);

    readFile(cliPath).then(function (data){
      request
        .put(ODL_UNICONFIG_TOPOLOGY_CONFIG)
        .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
        .accept('application/json')
        .set('Content-Type', 'application/json')
        .send(data.toString('utf8'))
        .end(function (err, res) {
          self.log(frinxit.responsecodehandler(err, res, true));
          try {
            if (res.status == 200 || res.status == 201) {
              self.log('Data store was successfully modified or overwritten. Status code: ' + res.status);
            }  
          }
          catch (err) {
            self.log(frinxit.responsecodehandler(err, res, false));
          }
          callback();
        });
    });
    callback();
  });
}


// *********************************************
// Async promisyfied filesystem helper functions

function readFile(filename) {
  return fs.readFileAsync(filename);
}

function writeFile(filename, content) {
  return fs.writeFileAsync(filename, content);
}

fs.readFileAsync = function (filename) {
  return new Promise(function (resolve, reject) {
    try {
      fs.readFile(filename, function(err, buffer){
          if (err) reject(err); else resolve(buffer);
      });
    } 
    catch (err) {
      reject(err);
    }
  });
};

fs.writeFileAsync = function (filename, content) {
  return new Promise(function (resolve, reject) {
    try {
        fs.writeFile(filename, content, function(err){
            if (err) reject(err); else resolve(content + "\nFile was saved as " + filename);
        });
    } 
    catch (err) {
      reject(err);
    }
  });
};

