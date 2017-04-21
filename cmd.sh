#!/bin/bash
dir=$(readlink -f $(dirname `readlink -f $0`))
#budo $* -- -r $dir/regl.js:regl
browserify $* -r $dir/regl.js:regl
#browserify $* -r
#browserify $* -r /home/marina/dev/glart/cat/node_modules/regl:regl



#to make an html file ./cmd.sh bye.js feedbackgalaxy.js foldingfan.js | indexhtmlify > test.html

