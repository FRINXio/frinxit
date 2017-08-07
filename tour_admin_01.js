var request = require('superagent');
var admin = require('./frinxit.js');
const vorpalTour = require('vorpal-tour');

var odl_ip = admin.odl_ip;
var odl_user = admin.odl_user;
var odl_pass = admin.odl_pass;
var welcome_banner = admin.welcome_banner;


module.exports = function (vorpal) {
  vorpal.use(vorpalTour, {
    command: 'tour admin',
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
        .begin('Welcome to the tour! Run "show odl version".')
        .expect("command", function (data, cb) {
          cb(data.command === 'show odl version');
        })
        .reject('Uh.. Let\'s type "show odl version" instead..')
        .wait(500)
        .end('\nNice! \n');

      // A delay in millis between steps.
      tour.wait(1000);

      tour.step(2)
        .begin('Here we go with the second step! Run "show odl features".')
        .expect("command", function (data, cb) {
          cb(data.command === 'show odl features');
        })
        .reject('Uh.. Let\'s type "show odl features" instead..')
        .wait(500)
        .end('\nUghh ... Those are a lot of features.\n');

      tour.step(3)
        .begin('There is a little variation of that as well. Try "show odl features -i" shows you all features that are currently installed in ODL.')
        .expect("command", function (data, cb) {
          cb(data.command === 'show odl features -i');
        })
        .reject('Uh.. Let\'s type "show odl features -i" instead..')
        .wait(500)
        .end('\nNice! \n');

      tour.step(4)
        .begin('If you want to see the resource usage of your ODL host. Type "show odl monitor-resources".')
        .expect("command", function (data, cb) {
          cb(data.command === 'show odl monitor-resources');
        })
        .reject('Uh.. Let\'s type "show odl monitor-resources" instead..')
        .wait(500)
        .end('\n');

      tour.step(5)
        .begin('The next command shows you which YANG models are available in ODL. Type "show odl yang-models".')
        .expect("command", function (data, cb) {
          cb(data.command === 'show odl yang-models');
        })
        .reject('Uh.. Let\'s type "show odl yang-models" instead..')
        .wait(500)
        .end('\nExcellent.\n');


      // Ends the tour, spits text to the user.
      tour.end('This is it for now. Very well done! If you feel adventurous you can type \"show odl yang-models | grep ietf\" and see what happens.\n\n\
Type "banner" to see the welcome banner and the topology again.');


      return tour;
    }
  });



}
