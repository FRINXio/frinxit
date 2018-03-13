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
the username and password, both "cisco" in this example as well as the NETCONF port, 830.')
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
        .begin('Finally we mount the PE01 again, but this time via CLI so that we can show CLI user interaction during the demo. Please type: \
          \n\n"mount cli PE01CLI 192.168.1.111 cisco cisco \'ios xr\'"\n\nThis will tell FRINX ODL that it should mount a cli device with the name \
"PE01CLI" and with the ip address 192.168.1.111. The default mount transport protocol is ssh if no options are specified. We also specify \
the username and password, both "cisco" in this example. Finally, we let FRINX ODL know that this device type is an IOS XR device by specifying "ios xr".')
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
        //.reject('Uh.. Let\'s type "show cli operational" instead..')
        .wait(500)
        .end('\nThis output shows you the operational state of CLI plugin and the CLI devices that it connects to. You can also get information \
from a specific node, by adding the node id like this \"show cli operational CE01\". Repeat entering \"show cli operational\"" (hit the up key\
 on your cursor pad to get the last command again on the prompt) until you see both devices are listed with host status: \"connected\".\n');

      // A delay in millis between steps.
      tour.wait(1000);


      tour.step(15)
        .begin('Let\'s check out the operational state of our NETCONF connection to the device. Please type:\
          \n\n"show nc-device operational"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show nc-device operational');
        })
        //.reject('Uh.. Let\'s type "show nc-device operational" instead...')
        .wait(500)
        .end('\nThis output shows you the operational state of the device that you have mounted in the previous step. Repeat entering \"show nc-device operational\"\
until you see the NETCONF device listed with host status: \"connected\".\n');
     
      // A delay in millis between steps.
      tour.wait(1000);


      tour.step(20)
        .begin('When the devices are successfully mounted, we perform a reconciliation step and acquire the complete configuration of the device,\
convert it to OpenConfig format and store it in the UniConfig topology. The UniConfig topology in the config data store shows the intended state of\
your devices, the UniConfig topology in the operational data store shows you the actual state of the devices, based on the last reconciliation process.\
When we mount the device we apply a sync from device reconciliation and copy the operational store content into the config data store.  Please type:\
          \n\n"show uniconfig config"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show uniconfig config');
        })
        //.reject('Uh.. Let\'s type "show uniconfig config" instead...')
        .wait(500)
        .end('\nYou can use the \"grep\" command to specify lines containing a string. Try the following \"show uniconfig config | grep node-id\".\
This will show you only the lines containing the string \"node-id\".\n');

      // A delay in millis between steps.
      tour.wait(1000);

      tour.step(25)
        .begin('The following command shows you the contents of the operational data store. It contains the actual state of the devices, as discovered\
during the last reconciliation. Please type:\
          \n\n"show uniconfig operational"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show uniconfig operational');
        })
        .reject('Uh.. Let\'s type "show uniconfig operational" instead...')
        .wait(500)
        .end('\nLike in the previous example you can use grep or less commands to help with locating information in this output.\n');

      // A delay in millis between steps.
      tour.wait(1000);

// show uniconfig calculate diff
      tour.step(30)
        .begin('If you would like to see the difference between intended and actual state of your network, use the calculate-diff command. Please type:\
          \n\n"show uniconfig calculate-diff"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show uniconfig calculate-diff');
        })
        .reject('Uh.. Let\'s type "show uniconfig calculate-diff" instead...')
        .wait(500)
        .end('\nAt this step of the demo, both data stores (config and operational) should contain the same information. The expected result of this command\
 is that there is no difference between the intended and actual state.\n');

      // A delay in millis between steps.
      tour.wait(1000);

// delete ospf 1 on CE01
      tour.step(35)
        .begin('In the following step we change the configuration on PE01. We will use the CLI plugin to emulate a user who is changing the device configuration.\
The type of change that we are applying is to delete the complete ospf process 1 configuration in the global table on the router. The following command issues\
the following snippet on the router PE01 (mounted via CLI as PE01CLI):\n\n\
conf t\n\
no router ospf 1\n\
commit\n\
exit\n\n Please type:\
          \n\n"demo delete ospf_1 PE01CLI"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'demo delete ospf_1 PE01CLI');
        })
        .reject('Uh.. Let\'s type "demo delete ospf_1 PE01CLI" instead...')
        .wait(500)
        .end('\nIf you see a 200 OK message, the OSPF configuration was removed on the router.\n');

      // A delay in millis between steps.
      tour.wait(1000);

// sync from network
      tour.step(40)
        .begin('Since the router configuration has changed, we need to synchronize the state of the operational data store with the actual device state.\
To achieve that please issue the following command.  Please type:\
          \n\n"exec uniconfig sync-from-network PE01"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'exec uniconfig sync-from-network PE01');
        })
        .reject('Uh.. Let\'s type "exec uniconfig sync-from-network PE01" instead...')
        .wait(500)
        .end('\nSynchronization of NETCONF devices happens farily quickly, while CLI devices take more time to reconcile. Wait for a \"complete\" message \
before you move on to the next step.\n');

      // A delay in millis between steps.
      tour.wait(1000);
 
// show calculate diff
      tour.step(45)
        .begin('Now we want to examine the differences between intended and actual state again. Please type:\
          \n\n"show uniconfig calculate-diff"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show uniconfig calculate-diff');
        })
        .reject('Uh.. Let\'s type "show uniconfig calculate-diff" instead...')
        .wait(500)
        .end('\nThe green content shows you configuration that is present in the config data store (intended state) while red text shows you configuration that \
is present on the device (i.e. in the operational data store), but not in the config data store.\n');

      // A delay in millis between steps.
      tour.wait(1000);


// commit uniconfig
      tour.step(50)
        .begin('Now we want to apply the configuration that is in config data store to the device. For that we issue the commit uniconfig command. Please type:\
          \n\n"commit uniconfig PE01"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'commit uniconfig PE01');
        })
        .reject('Uh.. Let\'s type "commit uniconfig PE01" instead...')
        .wait(500)
        .end('\nWhen you see the \"complete\" message, the configuration has been successfully applied to the device.\n');

      // A delay in millis between steps.
      tour.wait(1000);


// show calculate diff
      tour.step(55)
        .begin('Let\'s verify that the intended state is identical with the actual state of the network. Please type:\
          \n\n"show uniconfig calculate-diff"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show uniconfig calculate-diff');
        })
        .reject('Uh.. Let\'s type "show uniconfig calculate-diff" instead...')
        .wait(500)
        .end('\nWe expect to see no differences between intended and actual state.\n');

      // A delay in millis between steps.
      tour.wait(1000);


// show uniconfig config
      tour.step(60)
        .begin('Finally, let\'s look at the device configuration to verify that our changes were applied. Please type:\
          \n\n"exec cli command PE01CLI"\n\nWhen you see the \"command: \" prompt, please type:\n\n\"show run router ospf\"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'exec cli command PE01CLI');
        })
        .reject('Uh.. Let\'s type "exec cli command PE01CLI" instead...')
        .wait(500)
        .end('\nYou will see the actual ospf configuration snippet of the IOS XR device.\n');

      // A delay in millis between steps.
      tour.wait(1000);

// delete devices
      tour.step(60)
        .begin('Please copy and paste the following lines to delete the devices from ODL and restore the lab to its original state. Please type:\
          \n\n\"delete cli CE01\n\
delete cli PE01CLI\n\
delete nc-device PE01\"\n\
          \n')
        .expect("command", function (data, cb) {
          cb(data.command === 'delete cli CE01\n\
delete cli PE01CLI\n\
delete nc-device PE01');
        })
        .wait(500)
        .end('\nAll devices have been deleted from ODL.\n');

      // A delay in millis between steps.
      tour.wait(1000);



      // Ends the tour, spits text to the user.
      tour.end('This is it for now. Very well done! Type "banner" to see the welcome message, including the lab topology diagram again.');

      return tour;
    }
  });


}
