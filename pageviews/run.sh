#!/bin/bash

# change directory for crontab
echo "Entering WIKI cron"
cd /home/daniel/cryptario/pageviews/

YEAR=`date --date='yesterday' '+%Y'`
MONTH=`date --date='yesterday' '+%m'`
DAY=`date --date='yesterday' '+%d'`

echo "delete the totals"
echo '{}' > totals.json


for h in {00..23}
do
  echo "DAY $DAY HOUR $h"
  ./process.sh $YEAR $MONTH $DAY $h
done

# extract totals as a tab separated file in the form 00002351 Taylor Swift
# sort so that the largest numbers to to the top
# strip out the numbers
# remove trailing brackets e.g. Taylor_Swifr_(Singer)
# only accept strings made up of English alphabet characters and underscore
# remove any List_ pages e.g. List_Of_Marvel_Films
# substitute _ for space
# take top 100k
node extracttotals.js | sort -r | sed 's/^[0-9]*\t//g' | sed 's/_(.*)$//g' | grep '^[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_]*$' | grep -v '^List_' | sed 's/_/ /g' | head -n 50000 > mostpopular.txt


# calculate top 50 newly added strings
# for each of the most popular Wikipedia articles, grep to see if they already exist in our dictionary
cat mostpopular.txt | tr '\n' '\0' | xargs -0 -L 1  -I % sh -c 'grep "^%$" ../scripts/combined.txt' > out.txt
# find the strings which don't exist in the dictionary
diff out.txt mostpopular.txt |  grep -E "^>" | sed 's/^> //g' > top.txt
# take the top 50 strings that don't exist
head -n 50 top.txt > "top50_${YEAR}_${MONTH}_${DAY}.txt"

# add new strings to our anagram dictionary
cp mostpopular.txt ../scripts/
cd ../scripts
cat combined.txt mostpopular.txt | sort -u > test.txt
mv test.txt combined.txt
cd ../pageviews
mv mostpopular.txt "mostpopular_${YEAR}_${MONTH}_${DAY}.txt"

# commit to git
cd ../scripts/
git add combined.txt
git commit -m'latest wiki pages'
git push
cd ../pageviews/

# tidy up
rm totals.json

