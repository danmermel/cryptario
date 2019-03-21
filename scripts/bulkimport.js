// Load the SDK for JavaScript
var AWS = require('aws-sdk');
var crypto = require('crypto');
var utilities = require ("../utilities.js")

// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('./config.json');
var dynamodb = new AWS.DynamoDB();
var config = require('./config.json')

const isDupe = function(data, id) {

  for(var i in data) {
   if (data[i].id === id) {
     return true
   }
  }
  return false
}

var writeToDB = async function (data) {

  var db = config.database
  var params ={
    RequestItems:{}
  };
  params.RequestItems[db] = []
  var key = new Date().getTime();
  for(var i in data) {
    var obj = {
      PutRequest:{
        Item:{}
      }
    };
    obj.PutRequest.Item.id = {S: data[i].id};
    obj.PutRequest.Item.problem = {S: data[i].problem};
    obj.PutRequest.Item.solution = {S: data[i].solution}; 
    params.RequestItems[db].push(obj);
  }
//  console.log(JSON.stringify(params));
  return dynamodb.batchWriteItem(params).promise() ; 
}


var main = function() {

  var buffer = []
  var num = 0
  var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('data.txt');

  lr.on('error', function (err) {
    console.error(err);
    process.exit()
  });

  lr.on('line', async function (line) {
    if (line.trim().length === 0 ) {
      return
    }
    var obj = {}
    var word = line
    var problem = utilities.transformWord(word)
    obj.solution = word
    obj.problem = problem
    var data = problem+word.toLowerCase();
    obj.id = crypto.createHash('md5').update(data).digest("hex") 
    if (!isDupe(buffer, obj.id)) {
      buffer.push(obj)
    }
    if (buffer.length == 25) {
      lr.pause();

  //    console.log('writing', buffer)
      var data = await writeToDB(buffer) 
      num += 25
      process.stdout.write('   ' + num + '\r')
     //console.log(err, data);
      lr.resume()
      buffer = []
    }
  })

  lr.on('end', async function () {
    console.log('done')
    if (buffer.length > 0 ) {
    //  console.log('final write', buffer);
      var data = await writeToDB(buffer)
      num += buffer.length
      process.stdout.write('   ' + num + '\n')
      //  console.log(err, data)
    }
  });

}


main()
