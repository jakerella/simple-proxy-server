#!/bin/bash

CURR_SCRIPT=`readlink $0`
REAL_DIR=`dirname $CURR_SCRIPT`

node $REAL_DIR/simpleServer.js
