#!/bin/bash

cd ../lambda/
rm -rf nodejs
npm ci
mkdir -p nodejs/nodejs
cp -ir node_modules nodejs/nodejs