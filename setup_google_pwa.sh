#!/bin/bash


echo Hello, please name your new web application running on google web starter kit.
read DestFolder
if [ ! -d "$DestFolder" ]; then
  # Control will enter here if $DIRECTORY doesn't exist.
  tar xf ressources\\web-starter-kit-0.6.5.tar.gz
  mv web-starter-kit-0.6.5 $DestFolder
  cp ressources\\start_pwa.py $DestFolder\\app
  cd $DestFolder
  npm install
else
  cd $DestFolder
fi
cd app

python start_pwa.py

