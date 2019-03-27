#!/bin/bash

if [ -z $1 ] 
  then
  echo "Missing deployment stage"
  exit 1
fi
echo "Deployment stage = ${1}"

# copy the anagram/utilities libraries here for deployment
cp ../*.js ../config.json .

# mount our directory as /var/task on the Docker container
# run the Lambda Docker image
# run 'npm install' in the container
# the files appear on our node_modules (because it's mounted)
docker run -v "$PWD":/var/task lambci/lambda:build-nodejs8.10 npm install

# build the zip
zip -r lambda.zip package.json *.js config.json node_modules/

# deploy to Lambda
aws lambda update-function-code --function-name "cryptario-${1}" --zip-file fileb://lambda.zip
rm lambda.zip

# tidy up
rm anagramIndicators.js datamuse.js db.js anagram.js utilities.js *.test.js config.json

