#!/bin/bash
#
# Server side debugging
#
# Requires:
# - node-inspector ()
#

DEBUG_OUTPUT="./app.debug.log"

node-inspector &
node --debug ./app.js >> $DEBUG_OUTPUT 2>&1 &
tail -f $DEBUG_OUTPUT
