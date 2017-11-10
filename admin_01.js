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
            self.log('Error code: '.red + err.status);
          } 

          if (res.status == 200) {
            self.log('Status code: '.green + res.status);
          }

          var version = JSON.parse(res.text);

          self.log(JSON.stringify(version.output, null, 2));

          //logs the entire request and response content
          //self.log(res.req);

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
        .get('http://' + odl_ip + ':8181/restconf/operational/installer:features')
        .auth(odl_user, odl_pass)
        //.accept('application/json, text/plain ,*/*')
        //.set('Content-Type', 'application/yang.data+json')

        .end(function (err, res) {

          if (err || !res.ok) {
            self.log('Error code: '.red + err.status);
          } 

          if (res.status == 200) {
            self.log('Status code: '.green + res.status);
          }

          if (typeof args.options.installed == 'undefined' ) { installed = false; } else { installed = true; };

          if (installed) {
          
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
            self.log('Error code: '.red + err.status);
          } 

          if (res.status == 200) {
            self.log('Status code: '.green + res.status);
          }

          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
          //self.log(res.text);

        });
        callback();
    });  



vorpal
  .command('show odl yang-models', 'Display all YANG models in connected ODL node')

  .action(function(args, callback) {
    var self = this;
    request
      .get('http://' + odl_ip + ':8181/restconf/modules')

      .auth(odl_user, odl_pass)
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {

        if (err || !res.ok) {
          self.log('Show command was unsuccessful. Error code: '.red + err.status);
        } 

        if (res.status == 200) {
          self.log('Success. Status code: '.green + res.status);
        }       

        if (res.status == 201) {
          self.log('Status code: '.green + res.status);
        }

        if (res.text) {
          self.log(JSON.stringify(JSON.parse(res.text), null, 2));
        }

      });
      callback();
  });



}
