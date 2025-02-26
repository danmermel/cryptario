#!/bin/bash

if [ -z $1 ] 
  then
  echo "Missing deployment stage"
  exit 1
fi
echo "Deployment stage = ${1}"

# 1. read the current combined.txt
echo "reading combined.txt from s3"
aws s3 cp "s3://cryptario-dictionary-${1}/combined.txt" .

# 2 Run the scripts that augment it with new databaseR
#2.1 Get popularity data for a single hour from wikipedia

YEAR=`date -d "yesterday" '+%Y'`
MONTH=`date -d "yesterday" '+%m'`
DAY=`date -d "yesterday" '+%d'`
HOUR=`date -d "yesterday" '+%H'`
FILENAME="pageviews-${YEAR}${MONTH}${DAY}-${HOUR}0000"
ZIPFILE="${FILENAME}.gz"
URL="https://dumps.wikimedia.org/other/pageviews/${YEAR}/${YEAR}-${MONTH}/${ZIPFILE}"
echo "Fetching usage data from wikipedia"
curl $URL > $ZIPFILE

echo "unzipping.."
gunzip $ZIPFILE

echo "transforming ...."
cat ${FILENAME} | grep "^en " | sed "s/^en //" | sed "s/ [0-9]$//" |  sed 's/[."]//g'  | grep -E '^.{0,20}$' | grep -v ' 1$' > ${FILENAME}.txt

#2.2 Create totals (which requires js)
npm install

echo "totalising"
node totaliser.js ${FILENAME}.txt

echo "tidying up..."
rm ${FILENAME}
rm ${FILENAME}.txt

#2.3
# extract totals as a tab separated file in the form 00002351 Taylor Swift
# sort so that the largest numbers to to the top
# strip out the numbers
# remove trailing brackets e.g. Taylor_Swifr_(Singer)
# only accept strings made up of English alphabet characters and underscore
# remove any List_ pages e.g. List_Of_Marvel_Films
# substitute _ for space
# take top 100k
echo "getting most popular entries"
node extracttotals.js | sort -r | sed 's/^[0-9]*\t//g' | sed 's/_(.*)$//g' | grep '^[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_]*$' | grep -v '^List_' | sed 's/_/ /g' | head -n 50000 > mostpopular.txt

# 2.4 Add any new terms in the mostpopular file to the combined file by cat-ing both files and de-duping  
echo "adding most popular entries to our dictionary"
cat mostpopular.txt combined.txt | sort -u > new_combined.txt
echo "original combined file contains"
cat combined.txt | wc -l
echo "new combined file contains"
cat new_combined.txt | wc -l
mv new_combined.txt combined.txt

# 3. Write it back to s3
echo "writing back to s3"
aws s3 cp combined.txt "s3://cryptario-dictionary-${1}/combined.txt"

# 4. build the anagrams.db sqlite 
#4.1 create a csv file from combined.txt
echo "creating csv file" 
node generateAnagrams.js

#4.2 Create a sqlite db from csv file
echo "creating sqlite db"
rm anagrams.db
sqlite3 anagrams.db <<'END_SQL'
CREATE TABLE anagrams (id INTEGER PRIMARY KEY,jumble TEXT NOT NULL,solution TEXT NOT NULL);
CREATE INDEX anagramindex ON anagrams (jumble);
.mode csv
.import anagrams.csv anagrams
END_SQL

#5 Put files in the right directory
cd ../lambda
rm -rf functionassets
mkdir functionassets
cp cryptario.js ../pageviews/anagrams.db functionassets/