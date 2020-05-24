#!/bin/bash

#get the file

YEAR=$1
MONTH=$2
DAY=$3
HOUR=$4
FILENAME="pageviews-${YEAR}${MONTH}${DAY}-${HOUR}0000"
ZIPFILE="${FILENAME}.gz"
URL="https://dumps.wikimedia.org/other/pageviews/${YEAR}/${YEAR}-${MONTH}/${ZIPFILE}"
echo $URL

wget $URL

echo "unzipping.."
gunzip $ZIPFILE

echo "transforming ...."
cat ${FILENAME} | grep "^en " | sed "s/^en //" | sed "s/ [0-9]$//" |  sed 's/[."]//g'  | grep -E '^.{0,20}$' | grep -v ' 1$' > ${FILENAME}.txt

echo "totalising"
node totaliser.js ${FILENAME}.txt

echo "tidying up..."
rm ${FILENAME}
rm ${FILENAME}.txt



