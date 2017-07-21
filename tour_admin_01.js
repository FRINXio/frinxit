var request = require('superagent');
var admin = require('./frinxit.js');
const vorpalTour = require('vorpal-tour');

var odl_ip = admin.odl_ip;
var odl_user = admin.odl_user;
var odl_pass = admin.odl_pass;


module.exports = function (vorpal) {
  vorpal.use(vorpalTour, {
    command: 'tour',
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
        .end('\nNice! Wasn\'t that command just amazing?\n');

      // A delay in millis between steps.
      tour.wait(1000);

      tour.step(2)
        .begin('Here we go with the second step! Run "show odl features".')
        .expect("command", function (data, cb) {
          cb(data.command === 'show odl features');
        })
        .reject('Uh.. Let\'s type "show odl features" instead..')
        .wait(500)
        .end('\nNice! Wasn\'t that command just amazing?\n');
      // Ends the tour, spits text to the user.
      tour.end('Very well done!');

      return tour;
    }
  });



}
