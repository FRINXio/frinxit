var request = require('superagent');
var admin = require('./frinxit.js');
const vorpalTour = require('vorpal-tour');

var odl_ip = admin.odl_ip;
var odl_user = admin.odl_user;
var odl_pass = admin.odl_pass;


module.exports = function (vorpal) {
  vorpal.use(vorpalTour, {
    command: 'tour cli',
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
        .begin('Welcome to the FRINX southbound CLI service module tour! \
The purpose of the CLI southbound service module is to enable FRINX ODL to communicate with CLI devices that do not speak NETCONF or any other \
programmatic API. \
The CLI service module uses YANG models and implements a translation logic to send and receive structured data to and from CLI devices. \
This allows applications to use a service model or unified device model to communicate with a broad range \
of network platforms and SW revisions from different vendors. \n\
But first things first. We need to mount the CLI devices that we want to control. Please type or copy/paste the text between quotation marks: \
          \n\n"mount cli R121 192.168.1.121 cisco cisco ios" \n\nThis will tell FRINX ODL that it should mount a cli device with the name \
"R121" and with the ip address 192.168.1.121. The default mount transport protocol is ssh if no options are specified. We also specify \
the username and password, both "cisco" in this example. Finally, we let FRINX ODL know that this device type is a classic IOS device by specifying "ios".')
        .expect("command", function (data, cb) {
          cb(data.command === 'mount cli R121 192.168.1.121 cisco cisco ios');
        })
        .reject('Uh.. Let\'s type "mount cli R121 192.168.1.121 cisco cisco ios" instead..')
        .wait(500)
        .end('\nNice! We have now successfully mounted our first CLI device.\n');

      // A delay in millis between steps.
      tour.wait(3000);


      tour.step(2)
        .begin('Let\'s mount another CLI device while we are at it. This time we will not use ssh, but we will use telnet. Please type:\
          \n\n"mount cli -t R122 192.168.1.122 cisco cisco ios"\n\nThe "-t" switch tells FRINX ODL to use telnet instead of ssh transport. \
You can also specify the port number with the "-p portnumber" option. If you don\'t specify any portnumbers then ssh transport defaults\
to port 22 and telnet to port 23.')
        .expect("command", function (data, cb) {
          cb(data.command === 'mount cli -t R122 192.168.1.122 cisco cisco ios');
        })
        .reject('Uh.. Let\'s type "mount cli -t R122 192.168.1.122 cisco cisco ios" instead..')
        .wait(500)
        .end('\nNow we have two devices mounted, one via ssh and one via telnet.\n');

      // A delay in millis between steps.
      tour.wait(3000);

      tour.step(3)
        .begin('You might have asked yourself how to find out that the device type is "ios". By looking into the translate registry, \
you can find out which device types are supported by FRINX ODL. Additional device types can be loaded at runtime, we will look at that at a later point.\
To see the supported device types, type:\n\n"show cli translate-registry"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show cli translate-registry');
        })
        .reject('Uh.. Let\'s type "show cli translate-registry" instead..')
        .wait(500)
        .end('\nYou can also use "show cli translate-registry | grep device-type" for an abbreviated output.\n');

      // A delay in millis between steps.
      tour.wait(3000);

      tour.step(4)
        .begin('Let\'s check out the config data store to see what we have configured so far. Please type:\
          \n\n"show cli topology config"\n\nA lot of things in ODL are called "topology", think of a topology in this context as a \
place for all things related to a domain or feature. There is a topology for L3VPN and a topology for CLI devices and so forth. You\'ll get the hang of it.')
        .expect("command", function (data, cb) {
          cb(data.command === 'show cli topology config');
        })
        .reject('Uh.. Let\'s type "show cli topology config" instead..')
        .wait(500)
        .end('\nThis output shows you the configuration of the devices that you have mounted in the previous step.\n');
     
      // A delay in millis between steps.
      tour.wait(5000);

      tour.step(5)
        .begin('Now we want to examine what the CLI plugin is doing and check the status of the connections to the CLI devices. Please type:\
          \n\n"show cli topology operational"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'show cli topology operational');
        })
        .reject('Uh.. Let\'s type "show cli topology operational" instead..')
        .wait(500)
        .end('\nThis output shows you the operational state of CLI plugin and the CLI devices that it connects to. In the \
"available-capability" section in the json response, we also see the information about which translation units and modules \
are supported by each CLI device.\n');

      // A delay in millis between steps.
      tour.wait(7000);

      tour.step(6)
        .begin('How about we get some real work done now? The reason why we went through all this hassle up to this point, is to present an \
abstract, model-based network device and service interface \
to applications and users. In the next example you see how we parse the CLI output of an IOS command and return \
structured data. Please type:\
          \n\n"exec cli show version R121"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'exec cli show version R121');
        })
        .reject('Uh.. Let\'s type "exec cli show version R121" instead..')
        .wait(500)
        .end('\nThis output shows you the structured data that the FRINX CLI plugin has parsed from the CLI device. The data is\
 based on a very simple YANG model that was built for demonstration purposes. In many cases users will use models like OpenConfig that\
 provide standardized access to all kinds of config and operational data independent of network device vendor.\n');

      // A delay in millis between steps.
      tour.wait(4000);

      tour.step(7)
        .begin('Here is another example for getting structured YANG model-based data out of a CLI device. Please type:\
          \n\n"exec cli show interfaces R121"\n\n')
        .expect("command", function (data, cb) {
          cb(data.command === 'exec cli show interfaces R121');
        })
        .reject('Uh.. Let\'s type "exec cli show interfaces R121" instead..')
        .wait(500)
        .end('\nThis output shows you all interfaces configured on the CLI device including their operational status.\n');

      // A delay in millis between steps.
      tour.wait(4000);

      tour.step(8)
        .begin('But wait, there is more. Here is an example how we configure a CLI device programmatically via a YANG model. \
This is how we set a vrf. If you came this far you are probably familiar with what a vrf is, but just in case... VRF stands \
for VPN Routing and Forwarding and is similar to a dedicated routing table for a group of interfaces on a router. Please type:\
          \n\n"exec cli create vrf R121 bambi configured_from_FRINX_ODL"\n\n\
This command creates a vrf named "bambi" on node "R121" and adds a description "configured_from_FRINX_ODL".')
        .expect("command", function (data, cb) {
          cb(data.command === 'exec cli create vrf R121 bambi configured_from_FRINX_ODL');
        })
        .reject('Uh.. Let\'s type "exec cli create vrf R121 bambi configured_from_FRINX_ODL" instead..')
        .wait(500)
        .end('\nThis command will return a 204 status code when things worked out well and a 409 code if the configuration already exists.\n');

      // A delay in millis between steps.
      tour.wait(3000);

      tour.step(9)
        .begin('Now we want to see what we have configured on node R121. Please type:\
          \n\n"exec cli show vrfs R121"\n\n\ ')
        .expect("command", function (data, cb) {
          cb(data.command === 'exec cli show vrfs R121');
        })
        .reject('Uh.. Let\'s type "exec cli show vrfs R121" instead..')
        .wait(500)
        .end('\nThis command will provide structured data as output that lists all vrfs that are configured on node R121.\n');

      // A delay in millis between steps.
      tour.wait(4000);


      tour.step(10)
        .begin('Now we delete this vrf again to leave this router squeaky clean. Please type:\
          \n\n"exec cli delete vrf R121 bambi"\n\n\ ')
        .expect("command", function (data, cb) {
          cb(data.command === 'exec cli delete vrf R121 bambi');
        })
        .reject('Uh.. Let\'s type "exec cli delete vrf R121 bambi" instead..')
        .wait(500)
        .end('\nThis command will delete vrf "bambi" on node R121.\n');

      // A delay in millis between steps.
      tour.wait(3000);



      tour.step(11)
        .begin('Finally, here is a way to execute any arbitrary command on a mounted CLI device. Please type:\
          \n\n"exec cli command R121"\n\nYou will be presented with a command prompt "command:". Once you see the prompt type: "show running-config" and press enter.')
        .expect("command", function (data, cb) {
          cb(data.command === 'exec cli command R121');
        })
        .reject('Uh.. Let\'s type "exec cli command R121" instead..')
        .wait(3000)
        .end('\nYou see the IOS output from the command that was executed on node R121. You can also use "grep" to further specify the output \
Try: "exec cli command R121 | grep hostname" and then enter the command you want to execute on the CLI device, e.g. "Show running-config".\n');

// exec cli show vrfs R121

      // Ends the tour, spits text to the user.
      tour.end('This is it for now. Very well done! Type "banner" to see the welcome message, including the lab topology diagram again.');

      return tour;
    }
  });



}
