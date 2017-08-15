var request = require('superagent');
var frinxit = require('./frinxit.js');
var fs = require('fs');
var path = require('path');
var client = require('scp2');

var odl_ip = frinxit.odl_ip;
var odl_user = frinxit.odl_user;
var odl_pass = frinxit.odl_pass;

var cliPath = path.join(__dirname, '.', 'config-data', 'cli_config.cfg');

module.exports = function (vorpal) {
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
  .command('read file')
  .hidden()
  .description('Read a file.')
  .action(function(args, callback) {
    self = this;

    readFile(cliPath).then(function (data){
      self.log(data.toString('utf8'));
    }).catch(function (err) {
      self.log(err);
    });

    callback();
  });


vorpal
.command('copy file')
.hidden()
.description('Copy a file with scp.')
.action(function(args, callback) {
  self = this;

  getscpFile('127.0.0.1', 'gwieser', 'xxx', 
    '/Users/gwieser/Documents/bin/odl/distribution-karaf-2.3.0.frinx/daexim/odl_backup_config.json', 
    './config-data/').then(function(data) {
    self.log(data);
  }).catch(function(err) {
    self.log(err);
  });

  callback();
});


vorpal
.command('git clone')
.hidden()
.description('Clones a git repository.')
.action(function(args, callback) {
  self = this;

  self.log('git clone.');

  callback();
});


vorpal
.command('backup status')
.hidden()
.description('shows the backup status.')
.action(function(args, callback) {
  self = this;

  request
    .get('http://' + odl_ip + ':8181/restconf/operational/data-export-import-internal:daexim/')

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
.command('backup node-status')
.hidden()
.description('shows the backup status of the node with the odl_ip address.')
.action(function(args, callback) {
  self = this;

 getDaeximNodeStatus(odl_ip).then(function(data) {
    self.log(resolve);
  }).catch(function(err) {
    self.log(reject);
  });

/*
getDaeximNodeStatus(odl_ip).then(function(data) {
    self.log(data);
  });
*/

  callback();
});



} // close module.export



// *********************************************
// Async promisyfied filesystem helper functions

function readFile(filename) {
  return fs.readFileAsync(filename);
}

function writeFile(filename, content) {
  return fs.writeFileAsync(filename, content);
}

function getscpFile(host, username, password, src_filepath, dst_filepath){
  return client.getscpFileAsync(host, username, password, src_filepath, dst_filepath);
}

//does not work with mac host. fails authentication. works with linux host.
client.getscpFileAsync = function (host, username, password, src_filepath, dst_filepath) {
  return new Promise(function(resolve, reject) {
    try {
      client.scp({
        host: '10.225.9.32',
        username: 'gwieser',
        password: 'xxx',
        //path: '/Users/gwieser/Documents/bin/odl/distribution-karaf-2.3.0.frinx/daexim/odl_backup_config.json'
        path: '/home/gwieser/odl_backup_test.json',
        }, './', function(err) {
          if (err) reject(err); else resolve('File copied!');
        });
    } catch (err) {
        reject(err);
    }
  });
}


fs.readFileAsync = function (filename) {
    return new Promise(function (resolve, reject) {
        try {
            fs.readFile(filename, function(err, buffer){
                if (err) reject(err); else resolve(buffer);
            });
        } catch (err) {
            reject(err);
        }
    });
};


fs.writeFileAsync = function (filename, content) {
  return new Promise(function (resolve, reject) {
      try {
          fs.writeFile(filename, content, function(err){
              if (err) reject(err); else resolve('The file was saved');
          });
      } catch (err) {
          reject(err);
      }
  });
};


function getDaeximNodeStatus (odl_ip) {

  var backup = 'xyz';

  return new Promise(function(resolve, reject) {
    try {
        request
          .get('http://' + odl_ip + ':8181/restconf/operational/data-export-import-internal:daexim/')
          .auth(odl_user, odl_pass)
          .accept('application/json')
          .set('Content-Type', 'application/json')
          .end(function (err, res) {

            if (err || !res.ok) {
              self.log('Error code: ' + err.status);
            } 

            if (res.status == 200) {
              var daexim = JSON.parse(res.text);
              var node_status = [];

              for (var i = 0; i < daexim['daexim']['daexim-status']['node-status'].length; i++) {
                nodes_status = daexim['daexim']['daexim-status']['node-status'][i];

                if (nodes_status['node-name'] === odl_ip + ':2550') {
                  self.log(nodes_status['export-status']);
                  self.log(nodes_status['last-export-change']);

                  var data_files = [];

                  for (var j = 0; j < nodes_status['data-files'].length; j++) {
                    data_files = nodes_status['data-files'][j];
                    self.log(data_files);
                  }
                }
              }
            }
          });

          if (err) reject(err); else resolve(backup);

    } catch (err) {
        reject(err);
    }

  });

}

