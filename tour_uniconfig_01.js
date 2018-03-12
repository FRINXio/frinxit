var request = require('superagent');
var uniconfig = require('./frinxit.js');
const vorpalTour = require('vorpal-tour');

var odl_ip = uniconfig.odl_ip;
var odl_user = uniconfig.odl_user;
var odl_pass = uniconfig.odl_pass;


module.exports = function (vorpal) {
  vorpal.use(vorpalTour, {
    command: 'tour uniconfig',
    tour: function(tour) {
      // Colors the "tour guide" text. 
      tour.color('cyan');

      // Adds a step to the tour:
      // .begin spits user instructions when the step starts
      // .expect listens for an event. The function it calls 
      //   expects a `true` to be called in order for the step 
      //   to finish.
      // .reject spits text to the user when `false` is returned 
      //   on an `.expect` callback.
      // .wait waits `x` millis before completing the step
      // .end spits text to the user when the step completes.

 
      tour.step(1)
        .begin('Welcome to the FRINX UniConfig tour! \
But first things first. We need to mount the CLI and NETCONF devices that we want to control. Please type or copy/paste the text between quotation marks: \
          \n\n"mount nc-device PE01 192.168.1.111 830 cisco cisco" \n\nThis will tell FRINX ODL that it should mount a NETCONF device with the name \
"PE01" and with the ip address 192.168.1.111. We also specify \
the username and password, both "cisco" in this example as well as the NETCONF port, 830 in this case')
        .expect("command", function (data, cb) {
          cb(data.command === 'mount nc-device PE01 192.168.1.111 830 cisco cisco');
        })
        .reject('Uh.. Let\'s type "mount nc-device PE01 192.168.1.111 830 cisco cisco" instead...')
        .wait(500)
        .end('\nNice! We have now successfully mounted our first NETCONF device.\n');

      // A delay in millis between steps.
      tour.wait(1000);


      tour.step(5)
        .begin('Let\'s mount another device, this time via the FRINX CLI southbound plugin: \
          \n\n"mount cli CE01 192.168.1.121 cisco cisco ios" \n\nThis will tell FRINX ODL that it should mount a cli device with the name \
"CE01" and with the ip address 192.168.1.121. The default mount transport protocol is ssh if no options are specified. We also specify \
the username and password, both "cisco" in this example. Finally, we let FRINX ODL know that this device type is a classic IOS device by specifying "ios".')
        .expect("command", function (data, cb) {
          cb(data.command === 'mount cli CE01 192.168.1.121 cisco cisco ios');
        })
        .reject('Uh.. Let\'s type "mount cli CE01 192.168.1.121 cisco cisco ios" instead..')
        .wait(500)
        .end('\nNice! We have now successfully mounted our first CLI device.\n');

      // A delay in millis between steps.
      tour.wait(1000);

      tour.step(8)
        .begin('Finally we mount the PE01 again via CLI so that we can show CLI user interaction during the demo. Please type: \
          \n\n"mount cli PE01CLI 192.168.1.111 cisco cisco \'ios xr\'"\n\nThis will tell FRINX ODL that it should mount a cli device with the name \
"PE01CLI" and with the ip address 192.168.1.111. The default mount transport protocol is ssh if no options are specified. We also specify \
the username and password, both "cisco" in this example. Finally, we let FRINX ODL know that this device type is a classic IOS device by specifying "ios xr".')
        .expect("command", function (data, cb) {
          cb(data.command === 'mount cli PE01CLI 192.168.1.111 cisco cisco \'ios xr\'');
        })
        .reject('Uh.. Let\'s type "mount cli PE01CLI 192.168.1.111 cisco cisco \'ios xr\'" instead..')
        .wait(500)
        .end('\nThis is the last device that we needed to mount for this demo.\n');

      // A delay in millis between steps.
      tour.wait(1000);

      tour.step(10)
        .begin('Let\'s check out the config data store to see what we have configured so far. Please type:\
          \n\n"show cli config"\n\nA lot of things in ODL are called "topology", think of a topology in this context as a \
place where all things related to a domain or a feature are stored. There is a topology for L3VPN and a topology for CLI devices and so forth. You\'ll get the hang of it.')
        .expect("command", function (data, cb) {
          cb(data.command === 'show cli config');
        })
        .reject('Uh.. Let\'s type "show cli config" instead...')
        .wait(500)
        .end('\nThis output shows you the configuration of the devices that you have mounted in the previous step.\n');
     
      // A delay in millis between steps.
      tour.wait(1000);


      tour.step(13)
        .begin('Now we want to examine the status of the connections to the CLI device. Please type:\
          \n\n"show cli operational"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show cli operational');
        })
        .reject('Uh.. Let\'s type "show cli operational" instead..')
        .wait(500)
        .end('\nThis output shows you the operational state of CLI plugin and the CLI devices that it connects to. You can also get information \
from a specific node, by adding the node id like this \"show cli operational CE01\"" " \n');

      // A delay in millis between steps.
      tour.wait(1000);


      tour.step(15)
        .begin('Let\'s check out the operational state of our NETCONF connection to the device. Please type:\
          \n\n"show nc-device operational"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show nc-device operational');
        })
        .reject('Uh.. Let\'s type "show nc-device operational" instead...')
        .wait(500)
        .end('\nThis output shows you the operational state of the device that you have mounted in the previous step.\n');
     
      // A delay in millis between steps.
      tour.wait(1000);


      tour.step(20)
        .begin('blabla Please type:\
          \n\n"show uniconfig config"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show uniconfig config');
        })
        .reject('Uh.. Let\'s type "show uniconfig config" instead...')
        .wait(500)
        .end('\nblablabla.\n');

      // A delay in millis between steps.
      tour.wait(1000);

      tour.step(25)
        .begin('blabla Please type:\
          \n\n"show uniconfig operational"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show uniconfig operational');
        })
        .reject('Uh.. Let\'s type "show uniconfig operational" instead...')
        .wait(500)
        .end('\nblablabla.\n');

      // A delay in millis between steps.
      tour.wait(1000);

// show uniconfig calculate diff
      tour.step(30)
        .begin('blabla Please type:\
          \n\n"show uniconfig calculate-diff"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show uniconfig calculate-diff');
        })
        .reject('Uh.. Let\'s type "show uniconfig calculate-diff" instead...')
        .wait(500)
        .end('\nblablabla.\n');

      // A delay in millis between steps.
      tour.wait(1000);

// delete ospf 1 on CE01
      tour.step(35)
        .begin('blabla Please type:\
          \n\n"demo delete ospf_1 PE01CLI"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'demo delete ospf_1 PE01CLI');
        })
        .reject('Uh.. Let\'s type "demo delete ospf_1 PE01CLI" instead...')
        .wait(500)
        .end('\nblablabla.\n');

      // A delay in millis between steps.
      tour.wait(1000);

// sync from network
      tour.step(40)
        .begin('blabla Please type:\
          \n\n"exec uniconfig sync-from-network PE01"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'exec uniconfig sync-from-network PE01');
        })
        .reject('Uh.. Let\'s type "exec uniconfig sync-from-network PE01" instead...')
        .wait(500)
        .end('\nblablabla.\n');

      // A delay in millis between steps.
      tour.wait(1000);
 
// show calculate diff
      tour.step(45)
        .begin('blabla Please type:\
          \n\n"show uniconfig calculate-diff"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show uniconfig calculate-diff');
        })
        .reject('Uh.. Let\'s type "show uniconfig calculate-diff" instead...')
        .wait(500)
        .end('\nblablabla.\n');

      // A delay in millis between steps.
      tour.wait(1000);


// commit uniconfig
      tour.step(50)
        .begin('blabla Please type:\
          \n\n"commit uniconfig PE01"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'commit uniconfig PE01');
        })
        .reject('Uh.. Let\'s type "commit uniconfig PE01" instead...')
        .wait(500)
        .end('\nblablabla.\n');

      // A delay in millis between steps.
      tour.wait(1000);


// show calculate diff
      tour.step(55)
        .begin('blabla Please type:\
          \n\n"show uniconfig calculate-diff"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show uniconfig calculate-diff');
        })
        .reject('Uh.. Let\'s type "show uniconfig calculate-diff" instead...')
        .wait(500)
        .end('\nblablabla.\n');

      // A delay in millis between steps.
      tour.wait(1000);


// show uniconfig config
      tour.step(60)
        .begin('blabla Please type:\
          \n\n"show uniconfig config"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show uniconfig config');
        })
        .reject('Uh.. Let\'s type "show uniconfig config" instead...')
        .wait(500)
        .end('\nblablabla.\n');

      // A delay in millis between steps.
      tour.wait(1000);


      // Ends the tour, spits text to the user.
      tour.end('This is it for now. Very well done! Type "banner" to see the welcome message, including the lab topology diagram again.');

      return tour;
    }
  });



}
