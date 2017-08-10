var request = require('superagent');
var cli = require('./frinxit.js');
var fs = require('fs');
var path = require('path');

var odl_ip = cli.odl_ip;
var odl_user = cli.odl_user;
var odl_pass = cli.odl_pass;

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
      console.error(err);
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
      console.error(err);
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


