#!/bin/bash

if [ -z $1 ] 
  then
  echo "Missing deployment stage"
  exit 1
fi
echo "Deployment stage = ${1}"

# build the zip files
cd anagram
./prepare.sh
cd ../hiddenwords
./prepare.sh
cd ../doubledef
./prepare.sh
cd ..

# deploy to Lambda
aws lambda update-function-code --function-name "cryptario-anagram-${1}" --zip-file fileb://anagram/lambda.zip
aws lambda update-function-code --function-name "cryptario-doubledef-${1}" --zip-file fileb://doubledef/lambda.zip
aws lambda update-function-code --function-name "cryptario-hiddenwords-${1}" --zip-file fileb://hiddenwords/lambda.zip


# tidy up zip files
rm anagram/lambda.zip
rm hiddenwords/lambda.zip
rm doubledef/lambda.zip

