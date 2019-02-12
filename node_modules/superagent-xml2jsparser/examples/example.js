

request = require('superagent');
xml2jsParser = require('../')



request
    .get('http://api.openweathermap.org/data/2.5/weather?q=Los Angeles&mode=xml')
    .accept('xml')
    .parse(xml2jsParser)  // add the parser function
    .end(function(err, res){
        console.log(res.body)
    })