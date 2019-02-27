var request = require('superagent');
var frinxit = require('./frinxit.js');
const url = require('./URL_const');


const ODL_VERSION = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT + 
                        url.ODL_RESTCONF_OPERATIONS + 
                        'installer:show-version';

const ODL_FEATURES = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT + 
                        url.ODL_RESTCONF_OPERATIONAL + 
                        'installer:features';

const ODL_MONITOR_RESOURCES = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT + 
                        url.ODL_RESTCONF_OPERATIONS + 
                        'installer:monitor-resources';

const ODL_YANG_MODULES = url.ODL_URL_BASE + 
                        frinxit.creds.getOdlIp() + 
                        url.ODL_PORT + 
                        'restconf/modules';


module.exports = function (vorpal) {

  vorpal
    .command('show credentials')
    .description('show credentials.')
    .action(function(args, callback) {
      var self = this;
      self.log(frinxit.creds.getOdlIp())
      self.log(frinxit.creds.getOdlUser())
      self.log(frinxit.creds.getOdlPassword())
      callback();
    });


  vorpal
    .command('show odl version')
    .description('Display the version of the FRINX ODL Distribution.')
    .action(function(args, callback) {
      var self = this;
      request
        .post(ODL_VERSION)
        .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
        .accept('application/json')
        .set('Content-Type', 'application/yang.data+json')
        .end(function (err, res) {
          self.log(frinxit.responsecodehandler(err, res, true));
        });
        callback();
    });

  vorpal
    .command('show odl features')
    .description('Display features installed in FRINX ODL Distribution.')
    .option('-i, --installed', 'Display only installed features.')
    .action(function(args, callback) {
      var self = this;
      var installed = false;
      request
        .get(ODL_FEATURES)
        .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
        .end(function (err, res) {

          self.log(frinxit.responsecodehandler(err, res, false));

          if (typeof args.options.installed == 'undefined' ) 
            { 
              installed = false; 
            } 
            else { 
              installed = true; 
            };

          try {
            if (installed && res.text) {
              var features = JSON.parse(res.text);
              var features_list = [];

              for (var i = 0; i < features['features']['features-list'].length; i++) {
                var feature_key = features['features']['features-list'][i];

                if (feature_key['feature']['installed']) {
                  features_list.push(feature_key['feature-key']);
                }
              }
              features_list.sort();
              self.log(features_list);

            } else {
              self.log(JSON.stringify(JSON.parse(res.text), null, 2));
            }            
          } catch(err)
          {
            self.log('Service not available.' + err.code)
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
      .post(ODL_MONITOR_RESOURCES)
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));
      });
    callback();
  });  



vorpal
  .command('show odl yang-models', 'Display all YANG models in connected ODL node')
  .action(function(args, callback) {
    var self = this;
    request
      .get(ODL_YANG_MODULES)
      .auth(frinxit.creds.getOdlUser(), frinxit.creds.getOdlPassword())
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        self.log(frinxit.responsecodehandler(err, res, true));
      });
    callback();
  });

}


