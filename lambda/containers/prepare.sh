#!/bin/bash

# copy the utilities libraries here for deployment
cp ../../*.js ../../config.json ../../dictionary*.json ../../anagramSolutions*.json .

# mount our directory as /var/task on the Docker container
# run the Lambda Docker image
# run 'npm install' in the container
# the files appear on our node_modules (because it's mounted)
rm -rf node_modules
docker run -v "$PWD":/var/task lambci/lambda:build-nodejs10.x npm install --silent

# build the zip
zip -r lambda.zip package.json *.js config.json node_modules/

# tidy up
# this sets the shell options so that ! is understood as NOT
shopt -s extglob
# remove all files except those in the list
rm !(package.json|index.js|prepare.sh|node_modules|package-lock.json|lambda.zip)

