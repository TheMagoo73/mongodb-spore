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
  var directoryName = PATH.dirname(configFile);
  var config = YAML.load(configFile);

  var MongoClient = require('mongodb').MongoClient;
  var connection = null;

  MongoClient.connect(config.connection)
  .then(
    (db)=>{
      connection = db;
      if(options.dropcollection) return connection.dropCollection(config.collection).then(() => console.log('Dropped collection ' + config.collection));
      return Promise.resolve()
    }
  )
  .then(
    () => {
      let collection = connection.collection(config.collection)
      let changes = [];
      if(dataFile.startsWith('.\\'))
      {
          dataFile = dataFile.replace('.\\', directoryName + '\\');
      }
      var data = require(dataFile);
      config.data.files.forEach(
        (datafile) => {
          changes.push(collection.insertMany(data).then(() => console.log('Completed datafile ' + datafile)))
        }
      )
      return Promise.all(changes);
    }
  )
  .then(
    () => db.close()
  )
  .catch(
    err => console.log(err.message)
  )
  
  vo.log('Completed configuration file ' + configFile);
})
