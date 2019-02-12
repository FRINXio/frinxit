var parseString = require('xml2js').parseString;

module.exports = function(res, fn){
    res.text = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk){ res.text += chunk; });
    res.on('end', function(){
        try {
            parseString(res.text, fn);
        } catch (err) {
            fn(err);
        }
    });
};