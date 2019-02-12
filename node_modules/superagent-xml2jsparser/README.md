superagent-xml2jsparser
=======================

a parser for [visionmedia/superagent](https://github.com/visionmedia/superagent) that converts XML to json. It uses [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js)

## Installation

with npm

```js
npm install superagent-xml2jsparser
```

## Motivation

I needed to access an XML based API with superagent.  This seemed the simplest thing to do

## Usage

```js
request = require('superagent');
xml2jsParser = require('superagent-xml2jsparser');

request
    .get('http://api.openweathermap.org/data/2.5/weather?q=Los Angeles&mode=xml')
    .accept('xml')
    .parse(xml2jsParser) // add the parser function
    .end(function(err, res){
        console.log(res.body)
    })
```
