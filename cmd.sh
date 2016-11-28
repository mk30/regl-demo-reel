#!/bin/bash
dir=$(readlink -f $(dirname `readlink -f $0`))
budo $* -- -r $dir/regl.js:regl
#browserify $* -r $dir/regl.js:regl


#to make an html file ./cmd.sh bye.js feedbackgalaxy.js foldingfan.js | indexhtmlify > test.html

