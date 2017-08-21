#!/bin/bash
dir=$(readlink -f $(dirname `readlink -f $0`))
#budo $* -- -r $dir/regl.js:regl
browserify $* -r $dir/regl.js:regl
