#!/bin/bash

if [ -z $1 ] 
  then
  echo "Missing deployment stage"
  exit 1
fi
echo "Deployment stage = ${1}"

echo "configuring aws region"

export AWS_DEFAULT_REGION="eu-west-1"

# build the zip files

echo "changing dir to build dir.."

cd $TRAVIS_BUILD_DIR/lambda

echo $PWD

cd  anagram
./prepare.sh
cd ../hiddenwords
./prepare.sh
cd ../doubledef
./prepare.sh
cd ../homophones
./prepare.sh
cd ../reversals
./prepare.sh
cd ../containers
./prepare.sh
cd ../subractions
./prepare.sh
cd ..


# deploy to Lambda
aws lambda update-function-code --function-name "cryptario-anagram-${1}" --zip-file fileb://anagram/lambda.zip
aws lambda update-function-code --function-name "cryptario-doubledef-${1}" --zip-file fileb://doubledef/lambda.zip
aws lambda update-function-code --function-name "cryptario-hiddenwords-${1}" --zip-file fileb://hiddenwords/lambda.zip
aws lambda update-function-code --function-name "cryptario-homophones-${1}" --zip-file fileb://homophones/lambda.zip
aws lambda update-function-code --function-name "cryptario-reversals-${1}" --zip-file fileb://reversals/lambda.zip
aws lambda update-function-code --function-name "cryptario-containers-${1}" --zip-file fileb://containers/lambda.zip
aws lambda update-function-code --function-name "cryptario-subtractions-${1}" --zip-file fileb://subtractions/lambda.zip


# tidy up zip files
rm anagram/lambda.zip
rm hiddenwords/lambda.zip
rm doubledef/lambda.zip
rm homophones/lambda.zip
rm reversals/lambda.zip
rm containers/lambda.zip
rm subtractions/lambda.zip
