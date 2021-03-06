var request = require('superagent');
var frinxit = require('./frinxit.js');
const util = require('util');
const url = require('./URL_const');


const OC_INTERFCACES = url.UC_URL_BASE + 
                        frinxit.creds.getUcIp() +
                        url.UC_PORT + 
                        url.UC_RESTCONF_OPERATIONAL + 
                        'network-topology:network-topology/topology=uniconfig/node=';

module.exports = function (vorpal) {
  
vorpal
  .command('show interface <node_id> [status]')
  .description('Show interface command on device <node-id> and display structured data. Operational [status] can be \"brief\", \"up\", \"down\", \"sum\" for summary or \"ipv4\".')
  .action(function(args, callback) {
    var self = this;
    request
      .get(OC_INTERFCACES + args.node_id + '/configuration/interfaces?content=nonconfig')
      .auth(frinxit.creds.getUcUser(), frinxit.creds.getUcPassword())
      .accept('application/json')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {

        if (!args.status) {
          self.log(frinxit.responsecodehandler(err, res, true));
        }
        else {
          switch (args.status) {

            case 'brief':

             try {
                var interfaces = JSON.parse(res.text);
                var interface_list = {};
                var interface_item = '';
                var subinterface_item = '';
                var address_item = '';

                for (var i = 0; i < interfaces['frinx-openconfig-interfaces:interfaces']['interface'].length; i++) {
                  interface_item = interfaces['frinx-openconfig-interfaces:interfaces']['interface'][i];
                  interface_list[interface_item['name']] = interface_item['config']['enabled'];
                }

                self.log("Summary of interface states with IPv4 information:");
                self.log("Interface Name".rpad(30).blue + "Subintf".rpad(10).blue + "IP address".rpad(20).blue + "Status".blue);
                var keys = Object.keys(interface_list);
                keys.sort();

                for (var l=0; l<keys.length; l++) {
                  var key = keys[l];

                  for (var i = 0; i < interfaces['frinx-openconfig-interfaces:interfaces']['interface'].length; i++) {
                    interface_item = interfaces['frinx-openconfig-interfaces:interfaces']['interface'][i];

                    if (interface_item['name'] == key) {

                      //we try to read all subinterfaces
                      try {

                        for (var j = 0; j < interface_item['subinterfaces']['subinterface'].length; j++) {
                          subinterface_item =  interface_item['subinterfaces']['subinterface'][j];

                          //we try to read the ip addresses from the sub-interface
                          try { 

                            for (var k = 0; k < subinterface_item['frinx-openconfig-if-ip:ipv4']['addresses']['address'].length; k++) {
                              address_item = subinterface_item['frinx-openconfig-if-ip:ipv4']['addresses']['address'][k];

                              //subinterface with index 0 has its operational status in the main interface section
                              if (interface_item['subinterfaces']['subinterface'][j]['index'] == 0) {

                                if (interface_item['config']['enabled'] === true) {
                                  self.log(key.rpad(30) + 
                                    interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                    address_item['ip'].toString().rpad(20) +
                                    "UP".green);
                                } 
                                else {
                                  self.log(key.rpad(30) + 
                                    interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                    address_item['ip'].toString().rpad(20) + 
                                    "DOWN".red);
                                }
                              // for all other subinterfcae > index 0 we need to look into the subinterface section
                              } 
                              else {

                                if (interface_item['subinterfaces']['subinterface'][j]['config']['enabled'] === true) {
                                  self.log(key.rpad(30) + 
                                    interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                    address_item['ip'].toString().rpad(20) +
                                    interface_item['subinterfaces']['subinterface'][j]['config']['enabled'].green);
                                } 
                                else {
                                  self.log(key.rpad(30) + 
                                    interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                    address_item['ip'].toString().rpad(20) +
                                    interface_item['subinterfaces']['subinterface'][j]['config']['enabled'].red);
                                }
                              }
                            }
                          }
                          // we go down this path if we have failed to read an ip address, because there is none configured
                          catch (err) {

                            //subinterface with index 0 has its operational status in the main interface section
                            if (interface_item['subinterfaces']['subinterface'][j]['index'] == 0) {

                              if (interface_item['config']['enabled'] === true) {
                                self.log(key.rpad(30) + 
                                  interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                  "n/a".rpad(20) +
                                  "UP".green);
                              } 
                              else {
                                  self.log(key.rpad(30) + 
                                    interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                    "n/a".rpad(20) +
                                    "DOWN".red);
                              }
                            } 
                            else { // for all other subinterfcae > index 0 we need to look into the subinterface section
                              if (interface_item['subinterfaces']['subinterface'][j]['config']['enabled'] === true) {
                                self.log(key.rpad(30) + 
                                  interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                  "n/a".rpad(20) +
                                  "UP".green);
                              } 
                              else {
                                self.log(key.rpad(30) + 
                                  interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                  "n/a".rpad(20) +
                                  "DOWN".red);
                              }
                            }
                          }
                        }
                      } 
                      //in case there is no subinterface we will read the main interface
                      catch (err) {

                        //self.log(util.inspect(interface_item, false, null));
                        if (interface_item['config']['enabled'] === true) {
                          self.log(key.rpad(30) + 
                            "n/a".rpad(10) + 
                            "n/a".rpad(20) + 
                            "UP".green);
                        } 
                        else {
                          self.log(key.rpad(30) + 
                            "n/a".rpad(10) + 
                            "n/a".rpad(20) + 
                            "DOWN".red);
                        }
                      }
                    }
                  }                    
                }

              }
              catch(err) {
                self.log('No interface information available. Error code: '.red + err.code)
              }
	     
	      break;

            case 'up':

              try {
                self.log("Interfaces in \"up\" state:");
                var interfaces = JSON.parse(res.text);
                var interface_item = '';
                var interface_list = {};

		for (var i = 0; i < interfaces['frinx-openconfig-interfaces:interfaces']['interface'].length; i++) {
                  interface_item = interfaces['frinx-openconfig-interfaces:interfaces']['interface'][i];

                  if (interface_item['config']['enabled'] === true) {
                    interface_list[interface_item['name']] = "true"
		  }
                }

                self.log("Interface Name".rpad(30) + "Enabled Status");
                var keys = Object.keys(interface_list);
                keys.sort();

                for (var i=0; i<keys.length; i++) {
                  var key = keys[i];
                  self.log(key.rpad(30) + interface_list[key].green);
                } 
              } 
              catch(err){
                self.log('No interface information available. Error code: '.red + err.code)
              }
              break;

            case 'down':

              try {
                self.log("Interfaces in \"down\" state:");
                var interfaces = JSON.parse(res.text);
                var interface_item = '';
                var interface_list = {};

                for (var i = 0; i < interfaces['interfaces']['interface'].length; i++) {
                  interface_item = interfaces['interfaces']['interface'][i];

                  if (interface_item['state']['oper-status'] == "DOWN") {
                    interface_list[interface_item['name']] = interface_item['state']['oper-status'];
                  }
                }

                self.log("Interface Name".rpad(30) + "Operational Status");
                var keys = Object.keys(interface_list);
                keys.sort();

                for (var i=0; i<keys.length; i++) {
                  var key = keys[i];
                  self.log(key.rpad(30) + interface_list[key].red);
                } 
              }
              catch (err){
                self.log('No interface information available. Error code: '.red + err.code)
              }
              break;

            case 'sum':

              try {
                self.log("Summary of Interface states:");
                var interfaces = JSON.parse(res.text);
                var interface_item = '';
                var interface_list = {};

                for (var i = 0; i < interfaces['interfaces']['interface'].length; i++) {
                  interface_item = interfaces['interfaces']['interface'][i];
                  interface_list[interface_item['name']] = interface_item['state']['oper-status'];
                }

                self.log("Interface Name".rpad(30) + "Operational Status");
                var keys = Object.keys(interface_list);
                keys.sort();

                for (var i=0; i<keys.length; i++) {
                  var key = keys[i];

                  if (interface_list[key] == "UP") {
                    self.log(key.rpad(30) + interface_list[key].green);
                  } 
                  else {
                    self.log(key.rpad(30) + interface_list[key].red);
                  }
                } 
              }
              catch(err){
                self.log('No interface information available. Error code: '.red + err.code)
              }

            break;

            case 'ipv4':

              try {
                var interfaces = JSON.parse(res.text);
                var interface_list = {};
                var interface_item = '';
                var subinterface_item = '';
                var address_item = '';

                for (var i = 0; i < interfaces['interfaces']['interface'].length; i++) {
                  interface_item = interfaces['interfaces']['interface'][i];
                  interface_list[interface_item['name']] = interface_item['config']['enabled'];
                }

                self.log("Summary of interface states with IPv4 information:");
                self.log("Interface Name".rpad(30).blue + "Subintf".rpad(10).blue + "IP Address".rpad(20).blue + "Enabled Status".blue);
                var keys = Object.keys(interface_list);
                keys.sort();

                for (var l=0; l<keys.length; l++) {
                  var key = keys[l];

                  for (var i = 0; i < interfaces['interfaces']['interface'].length; i++) {
                    interface_item = interfaces['interfaces']['interface'][i];

                    if (interface_item['name'] == key) {

                      //we try to read all subinterfaces
                      try {

                        for (var j = 0; j < interface_item['subinterfaces']['subinterface'].length; j++) {
                          subinterface_item =  interface_item['subinterfaces']['subinterface'][j];

                          //we try to read the ip addresses from the sub-interface
                          try { 

                            for (var k = 0; k < subinterface_item['frinx-openconfig-if-ip:ipv4']['addresses']['address'].length; k++) {
                              address_item = subinterface_item['frinx-openconfig-if-ip:ipv4']['addresses']['address'][k];

                              //subinterface with index 0 has its operational status in the main interface section
                              if (interface_item['subinterfaces']['subinterface'][j]['index'] == 0) {

                                if (interface_item['config']['enabled'] == true) {
                                  self.log(key.rpad(30) + 
                                    interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                    address_item['ip'].toString().rpad(20) +
                                    interface_item['config']['enabled'].green);
                                } 
                                else {
                                  self.log(key.rpad(30) + 
                                    interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                    address_item['ip'].toString().rpad(20) + 
                                    interface_item['config']['enabled'].red);
                                }
                              // for all other subinterfcae > index 0 we need to look into the subinterface section
                              } 
                              else {

                                if (interface_item['subinterfaces']['subinterface'][j]['stat']['oper-status'] == "UP") {
                                  self.log(key.rpad(30) + 
                                    interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                    address_item['ip'].toString().rpad(20) +
                                    interface_item['subinterfaces']['subinterface'][j]['state']['oper-status'].green);
                                } 
                                else {
                                  self.log(key.rpad(30) + 
                                    interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                    address_item['ip'].toString().rpad(20) +
                                    interface_item['subinterfaces']['subinterface'][j]['state']['oper-status'].red);
                                }
                              }
                            }
                          }
                          // we go down this path if we have failed to read an ip address, because there is none configured
                          catch (err) {

                            //subinterface with index 0 has its operational status in the main interface section
                            if (interface_item['subinterfaces']['subinterface'][j]['index'] == 0) {

                              if (interface_item['state']['oper-status'] == "UP") {
                                self.log(key.rpad(30) + 
                                  interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                  "n/a".rpad(20) +
                                  interface_item['state']['oper-status'].green);
                              } 
                              else {
                                  self.log(key.rpad(30) + 
                                    interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                    "n/a".rpad(20) +
                                    interface_item['state']['oper-status'].red);
                              }
                            } 
                            else { // for all other subinterfcae > index 0 we need to look into the subinterface section
                              if (interface_item['subinterfaces']['subinterface'][j]['state']['oper-status'] == "UP") {
                                self.log(key.rpad(30) + 
                                  interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                  "n/a".rpad(20) +
                                  interface_item['subinterfaces']['subinterface'][j]['state']['oper-status'].green);
                              } 
                              else {
                                self.log(key.rpad(30) + 
                                  interface_item['subinterfaces']['subinterface'][j]['index'].toString().rpad(10) +
                                  "n/a".rpad(20) +
                                  interface_item['subinterfaces']['subinterface'][j]['state']['oper-status'].red);
                              }
                            }
                          }
                        }
                      } 
                      //in case there is no subinterface we will read the main interface
                      catch (err) {

                        //self.log(util.inspect(interface_item, false, null));
                        if (interface_item['state']['oper-status'] == "UP") {
                          self.log(key.rpad(30) + 
                            "n/a".rpad(10) + 
                            "n/a".rpad(20) + 
                            interface_item['state']['oper-status'].green);
                        } 
                        else {
                          self.log(key.rpad(30) + 
                            "n/a".rpad(10) + 
                            "n/a".rpad(20) + 
                            interface_item['state']['oper-status'].red);
                        }
                      }
                    }
                  }                    
                }

              }
              catch(err) {
                self.log('No interface information available. Error code: '.red + err.code)
              }

            break;

            default:
            self.log("Unrecognized option. Please specify \"up\", \"down\", \"sum\" or \"ipv4\"");
          }
        }

      });
      callback();
  });  

}

