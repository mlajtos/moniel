#!/bin/sh

babel scripts --watch --out-file script.js &
http-server -p 9876 .