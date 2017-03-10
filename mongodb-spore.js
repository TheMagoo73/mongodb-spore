#!/usr/bin/env node

const commandLineArgs = require('command-line-args');

const optionsDefinitions = [
  {name: 'src', alias: 's', type: String, multiple: true},
  {name: 'help', alias: '?', type: Boolean}
];

const options = commandLineArgs(optionsDefinitions);

console.log(options);

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
            typeLabel: '[underline]{file}',
            description: 'The input configuration'
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
  console.log('Processing configuration file ' + configFile);
  var config = YAML.load(configFile);
  console.log(config);

  var MongoClient = require('mongodb').MongoClient,
      co = require('co'),
      assert = require('assert');

  co(function*() {
    var db = yield MongoClient.connect(config.connection);
    var collection = db.collection(config.collection);
    config.data.files.forEach((dataFile) =>{
      var data = require(dataFile);
      collection.insertMany(data);
      console.log(data);
    })
    db.close();
  }).catch((err)=> {
    console.log(err.stack);
  })
})
