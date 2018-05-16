#!/usr/bin/env node

const commandLineArgs = require('command-line-args');

const optionsDefinitions = [
  {name: 'src', alias: 's', type: String, multiple: true, defaultOption: true},
  {name: 'help', alias: '?', type: Boolean},
  {name: 'verbose', alias: 'v', type: Boolean, defaultValue: false},
  {name: 'dropcollection', alias: 'd', type: Boolean, defaultValue: false},
];

const options = commandLineArgs(optionsDefinitions, {partial: true});

verboseOutput = require('./verbose-output');
vo = new verboseOutput(options.verbose);

vo.log("Command line options: " + JSON.stringify(options));

if(!options.src)
  options.help = true;

if(options.help === true) {
    const commandLineUsage = require("command-line-usage");
    console.log(commandLineUsage([
      {
        header: 'mongodb-spore - a MongoDB Seeding tool',
        content: 'Allows configurable bulk seeding of MongoDB databases'
      },
      {
        header: 'Options',
        optionList: [
          {
            name: 'src',
            typeLabel: '[underline]{files}',
            description: 'The input configuration file(s). Required'
          },
          {
            name: 'help',
            description: 'Display this usage guide'
          }
        ]
      }
    ])
  );
  return;
}

const YAML = require('yamljs');
const PATH = require('path');

var errHandler = function(err) {
  console.log(err);
}

options.src.forEach((configFile) => {
  vo.log('Processing configuration file ' + configFile);
  var directoryName = PATH.dirname(configFile);
  vo.log('directoryName: ' + directoryName);
  var config = YAML.load(configFile);
  vo.log('Configuration: ' + config);

  var MongoClient = require('mongodb').MongoClient,
      co = require('co'),
      assert = require('assert');

  co(function*() {
    var db = yield MongoClient.connect(config.connection);
    if(options.dropcollection)
    {
      yield db.dropCollection(config.collection).then(function(data) {
        console.log(data)
        vo.log('Dropped collection' + config.collection);    
      }, errHandler);
    }
    var collection = db.collection(config.collection);
    config.data.files.forEach((dataFile) => {
      vo.log('dataFile: ' + dataFile);      
      if(dataFile.startsWith('.\\'))
      {
          vo.log('dataFile starts with .\\: ');
          dataFile = dataFile.replace('.\\', directoryName + '\\');
      }
      var data = require(dataFile);
      collection.insertMany(data).then(function(data) {
        console.log(data)
        vo.log('Completed data file ' + dataFile);    
      }, errHandler);
    })
    db.close();
    console.log(results);
  }).catch((err)=> {
    console.log(err.stack);
  })
  vo.log('Completed configuration file ' + configFile);
})
