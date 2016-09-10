#!/bin/sh

babel scripts --watch --out-file script.js --source-maps inline &
http-server -p 9876 .
