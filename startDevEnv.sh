#!/bin/sh

babel src/scripts --watch --out-file src/bundle.js --source-maps inline &
http-server -p 9876 .
