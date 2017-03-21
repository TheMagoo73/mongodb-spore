#!/usr/bin/env node

const commandLineArgs = require('command-line-args');

const optionsDefinitions = [
  {name: 'src', alias: 's', type: String, multiple: true, defaultOption: true},
  {name: 'help', alias: '?', type: Boolean},
  {name: 'verbose', alias: 'v', type: Boolean, defaultValue: false}
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

options.src.forEach((configFile) => {
  vo.log('Processing configuration file ' + configFile);
  var config = YAML.load(configFile);
  vo.log('Configuration: ' + config);

  var MongoClient = require('mongodb').MongoClient,
      co = require('co'),
      assert = require('assert');

  co(function*() {
    var arrInsertMany = [];
    var db = yield MongoClient.connect(config.connection);
    var collection = db.collection(config.collection);
    config.data.files.forEach((dataFile) =>{
      var data = require(dataFile);
      arrInsertMany.push(collection.insertMany(data));
      vo.log('Completed data file ' + dataFile);      
    })
    var results = yield arrInsertMany;
    db.close();
    console.log(results);
  }).catch((err)=> {
    console.log(err.stack);
  })
  vo.log('Completed configuration file ' + configFile);
})
