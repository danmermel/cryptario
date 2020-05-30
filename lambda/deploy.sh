#!/bin/bash

if [ -z $1 ] 
  then
  echo "Missing deployment stage"
  exit 1
fi
echo "Deployment stage = ${1}"

echo "configuring aws region"

export AWS_DEFAULT_REGION="eu-west-1"

# this sets the shell options so that ! is understood as NOT
shopt -s extglob 

echo "changing dir to build dir.."

if [ -z $TRAVIS_BUILD_DIR ]
then
  TRAVIS_BUILD_DIR="."
fi

cd $TRAVIS_BUILD_DIR/lambda

echo $PWD

# build the dictionaries
echo "Building dictionaries"
cd ../scripts
npm install
node generateAnagrams.js
node generateDictionary.js
cd ../lambda
echo "Done"

# get npm modules once only
npm install

# build the Lambda functions
declare -a arr=("solver" "anagram" "hiddenwords" "doubledef" "homophones" "reversals" "containers" "charades" "subtractions")

for i in "${arr[@]}"
do
  cd "$i"
  echo "Doing ${i}"
  pwd
  cp ../../*.js ../../config.json ../../dictionary*.json ../../anagramSolutions*.json .

  # copy the common dependencies
  cp -r ../node_modules .

  # build the zip
  rm lambda.zip
  zip -r lambda.zip *.js *.json node_modules/

  # tidy up
  # remove all files except those in the list
  rm !(package.json|index.js|prepare.sh|node_modules|package-lock.json|lambda.zip)

  # deploy to lambda
  aws lambda update-function-code --function-name "cryptario-${i}-${1}" --zip-file fileb://lambda.zip
  cd ..
done


