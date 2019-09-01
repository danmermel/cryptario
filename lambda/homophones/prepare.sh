#!/bin/bash

# copy the utilities libraries here for deployment
cp ../../*.js ../../config.json .

# mount our directory as /var/task on the Docker container
# run the Lambda Docker image
# run 'npm install' in the container
# the files appear on our node_modules (because it's mounted)
rm -rf node_modules
docker run -v "$PWD":/var/task lambci/lambda:build-nodejs8.10 npm install --silent

# build the zip
zip -r lambda.zip package.json *.js config.json node_modules/

# tidy up
rm homophone.js homophoneIndicators.js hiddenWordIndicators.js hiddenwords.js doubledef.js anagramIndicators.js datamuse.js db.js anagram.js utilities.js *.test.js config.json

