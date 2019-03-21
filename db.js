var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json');
var dynamodb = new AWS.DynamoDB();
var config = require('./config.json');

var docClient = new AWS.DynamoDB.DocumentClient()



var queryAnagram = async function(processedProblem) { 
  var obj = { 
              TableName : config.database, 
              IndexName : 'problem-index', 
              KeyConditionExpression: "problem = :problem", 
              ExpressionAttributeValues: { ":problem": processedProblem } 
            }; 
  return docClient.query(obj).promise(); 
}

module.exports = {
  queryAnagram: queryAnagram
}
