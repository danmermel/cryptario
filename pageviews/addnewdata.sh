#!/bin/bash

# cat two files together into one and then sort -u will get the uniques

cat mostpopular.txt ../scripts/combined.txt | sort -u > temp.txt

mv temp.txt ../scripts/combined.txt