var request = require('superagent');
var l2vpn = require('./frinxit.js');
const vorpalTour = require('vorpal-tour');

var odl_ip = l2vpn.odl_ip;
var odl_user = l2vpn.odl_user;
var odl_pass = l2vpn.odl_pass;


module.exports = function (vorpal) {
  vorpal.use(vorpalTour, {
    command: 'tour l2vpn',
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
        .begin('Welcome to the FRINX L2VPN service module tour! \
The purpose of the L2VPN service module is to help network operators to configure and control L2VPNs in their heterogeneous networks. \
The L2VPN service module uses the IETF YANG service model for VPNs and implements a translation logic to send and receive structured data to and from devices. \
This demo interacts with a Cisco IOS XR device via NETCONF, but the L2VPN implementation is capable of communicating with devices from \
different vendors with differing NETCONF/YANG implementations. Devices that do not speak NETCONF can be configured via the CLI southbound service module (see "tour cli"). \
But first things first. We need to mount the NETCONF devices that we want to control. Please type or copy/paste the text between quotation marks: \
          \n\n"mount nc-device PE01 192.168.1.111 830 cisco cisco" \n\nThis will tell FRINX ODL that it should mount a NETCONF device with the name \
"PE01" and with the ip address 192.168.1.111. We also specify \
the username and password, both "cisco" in this example.')
        .expect("command", function (data, cb) {
          cb(data.command === 'mount nc-device PE01 192.168.1.111 830 cisco cisco');
        })
        .reject('Uh.. Let\'s type "mount nc-device PE01 192.168.1.111 830 cisco cisco" instead...')
        .wait(500)
        .end('\nNice! We have now successfully mounted our first NETCONF device.\n');

      // A delay in millis between steps.
      tour.wait(3000);


      tour.step(2)
        .begin('Let\'s mount another NETCONF device while we are at it. Please type:\
          \n\n"mount nc-device PE02 192.168.1.112 830 cisco cisco"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'mount nc-device PE02 192.168.1.112 830 cisco cisco');
        })
        .reject('Uh.. Let\'s type "mount nc-device PE02 192.168.1.112 830 cisco cisco" instead...')
        .wait(500)
        .end('\nNow we have two NETCONF devices mounted.\n');

      // A delay in millis between steps.
      tour.wait(3000);


      tour.step(4)
        .begin('Let\'s check out the config data store to see what we have configured so far. Please type:\
          \n\n"show nc-device config"\n\nA lot of things in ODL are called "topology", think of a topology in this context as a \
place where all things related to a domain or a feature are stored. There is a topology for L3VPN and a topology for CLI devices and so forth. You\'ll get the hang of it.')
        .expect("command", function (data, cb) {
          cb(data.command === 'show nc-device config');
        })
        .reject('Uh.. Let\'s type "show nc-device config" instead...')
        .wait(500)
        .end('\nThis output shows you the configuration of the devices that you have mounted in the previous step.\n');
     
      // A delay in millis between steps.
      tour.wait(5000);

      tour.step(5)
        .begin('Now we want to examine how FRINX ODL processes the mounted devices and how it connects to them. It can take a little \
while before the devices go from \"connecting\"" to \"connected\" state. Repeat the command until you see a fairly long list of YANG models \
(e.g. about 450 for a CIsco IOS XR device).  Please type:\
          \n\n"show nc-device operational PE01"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show nc-device operational PE01');
        })
        .reject('Uh.. Let\'s type "show nc-device operational PE01" instead...')
        .wait(500)
        .end('\nThis output shows you the operational state of the mounted NETCONF device. You can find connection status and \
all the YANG models and capabilities that the device supports.\n');

      // A delay in millis between steps.
      tour.wait(7000);

      tour.step(6)
        .begin('Let\' proceed to the real action. The reason why we went through all the previous steps, is to present an \
abstract, model-based network service interface \
to applications and users. In the next example, we will create a L2VPN pseudo wire template in the network. \
Pseudo wire templates are usually configured only once when the service is set up in the network. Please type:\
          \n\n"create l2vpn pw-template PW1"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'create l2vpn pw-template PW1');
        })
        .reject('Uh.. Let\'s type "create l2vpn pw-template PW1" instead...')
        .wait(500)
        .end('\nWe have now created the pseudo wire template PW1 in the network. It is not yet configured on any device. It only exists in the service model \
in FRINX ODL. It will be configured on the devices after the next two steps.\n');

      // A delay in millis between steps.
      tour.wait(4000);


      tour.step(7)
        .begin('Let\s check the config data store and see what we have configured and what the L3VPN service module has created \
at this point. Please type:\
          \n\n"show l2vpn config"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show l2vpn config');
        })
        .reject('Uh.. Let\'s type "show l2vpn config" instead...')
        .wait(500)
        .end('\nThis output shows you all information pertaining to the L2VPN service. At this point you will see the \
information about the pseudo wire template that you have configured and some values that the service modules has chosen. These values can be \
defined by the user or application during the template creation or by the L2VPN service module via default values.\n');


      tour.step(10)
        .begin('Now we need to create an instance of a l2vpn that uses the pseudo wire template that we have created previously. You will be prompted \
with a set of configuration options for the l2vpn instance. If this all sounds unfamiliar to you, just pick the default options \
by pressing return at every prompt. Please type:\
          \n\n"create l2vpn instance"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'create l2vpn instance');
        })
        .reject('Uh.. Let\'s type "create l2vpn instance" instead...')
        .wait(500)
        .end('\nWe have now created an L2VPN instance that uses the pseudo wire template that we have created previously.\n');

      // A delay in millis between steps.
      tour.wait(4000);


      tour.step(15)
        .begin('Now we want to check out the L2VPN config data store again to see what we have configured so far. Please type:\
          \n\n"show l2vpn config"\n\n\ ')
        .expect("command", function (data, cb) {
          cb(data.command === 'show l2vpn config');
        })
        .reject('Uh.. Let\'s type "show l2vpn config" instead...')
        .wait(500)
        .end('\nThis now includes the information about the pseudo wire template and the L2VPN instance that we have configured. The configuration has \
not yet been applied to any device though.\n');

      // A delay in millis between steps.
      tour.wait(3000);

      tour.step(20)
        .begin('In this step we will finally commit the configuration that we have created in FRINX ODL to the network devices. \
Please type:\n\n"commit l2vpn"\n\n\ ')
        .expect("command", function (data, cb) {
          cb(data.command === 'commit l2vpn');
        })
        .reject('Uh.. Let\'s type "commit l2vpn" instead...')
        .wait(500)
        .end('\nThis command has now created the configurations on the devices.\n');

      // A delay in millis between steps.
      tour.wait(4000);


      tour.step(25)
        .begin('Let\'s inspect the L2VPN service operational data store. Please type:\
          \n\n"show l2vpn operational ce1-ce2_vlan3001"\n\n\ ')
        .expect("command", function (data, cb) {
          cb(data.command === 'show l2vpn operational ce1-ce2_vlan3001');
        })
        .reject('Uh.. Let\'s type "show l2vpn operational ce1-ce2_vlan3001" instead...')
        .wait(500)
        .end('\nThis command shows the contents of the operational data store and the configured network devices.\n');

      // A delay in millis between steps.
      tour.wait(3000);



      tour.step(30)
        .begin('Finally, let\'s delete the L2VPN instance. Please type:\
          \n\n"delete l2vpn instance ce1-ce2_vlan3001"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'delete l2vpn instance ce1-ce2_vlan3001');
        })
        .reject('Uh.. Let\'s type "delete l2vpn instance ce1-ce2_vlan3001" instead...')
        .wait(3000)
        .end('\nVery good. Thank you for cleanning up.\n');


      tour.step(35)
        .begin('And let\'s delete the site. Please type:\
          \n\n"delete l2vpn pw-template PW1"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'delete l2vpn pw-template PW1');
        })
        .reject('Uh.. Let\'s type "delete l2vpn pw-template PW1" instead...')
        .wait(3000)
        .end('\nExcellent.\n');

// in 2.3.1 there is a situation that a commit will catastrophically fail and crash frinxit if an instance refers to a non-existant 
// pw-template in the config data store. The required behavior is a warning only.

      tour.step(40)
        .begin('The last step is to issue another commit command so the operational data store gets updated and the configurations \
will be deleted. Please type:\n\n"commit l2vpn"\n\n\ ')
        .expect("command", function (data, cb) {
          cb(data.command === 'commit l2vpn');
        })
        .reject('Uh.. Let\'s type "commit l2vpn" instead...')
        .wait(500)
        .end('\nThe FRINX ODL L2VPN service in config and operational data store and devices are now deleted.\n');


      // Ends the tour, spits text to the user.
      tour.end('This is it for now. Very well done! Type "banner" to see the welcome message, including the lab topology diagram again.');

      return tour;
    }
  });



}
