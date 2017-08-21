the below demo reel acted as the backing visual for [shani
aviram's](http://shaniaviram.net/) set at the [2017 night of 1,000
kates](https://www.facebook.com/1000kates) which took place 
on aug. 12, 2017 in philadelphia.

![shani](https://kitties.neocities.org/2017-08-12-01-sm.jpg)

(photo by [kenzi crash](http://kenzicrash.com))


### demos with source code


[full demo reel](https://kitties.neocities.org/kate.html)

in the above demo reel, you can hop to individual demos by hitting the below
keys:

n: nightmare cats ([demo](https://kitties.neocities.org/nightmarecats.html))
([code](https://github.com/mk30/regl-demo-reel/blob/master/nightmarecats.js))

k: kate shape ([demo](https://kitties.neocities.org/deepergeometry.html))
([code](https://github.com/mk30/regl-demo-reel/blob/master/kate.js))

g: kate group ([demo](https://kitties.neocities.org/k116.html))
([code](https://github.com/mk30/regl-demo-reel/blob/master/k116.js))

a: kate hands ([demo](https://kitties.neocities.org/kbhands.html))
([code](https://github.com/mk30/regl-demo-reel/blob/master/kbhands.js))

e: emoji ([demo](https://kitties.neocities.org/emoji.html))
([code](https://github.com/mk30/regl-demo-reel/blob/master/emoji.js))

h: hello cat ([demo](https://kitties.neocities.org/cathello2.html))
([code](https://github.com/mk30/regl-demo-reel/blob/master/cathello2.js))

y: yellow particles
([demo](https://kitties.neocities.org/yellowparticlevortex.html))
([code](https://github.com/mk30/regl-demo-reel/blob/master/yellowparticlevortex.js))

u: unicorns ([demo](https://kitties.neocities.org/unicornwoo.html))
([code](https://github.com/mk30/regl-demo-reel/blob/master/unicornwoo.js))

c: computer ([demo](https://kitties.neocities.org/computer.html))
([code](https://github.com/mk30/regl-demo-reel/blob/master/computer.js))

i: iphone ([demo](https://kitties.neocities.org/iphone.html))
([code](https://github.com/mk30/regl-demo-reel/blob/master/iphone.js))

s: hate to lose ([demo](https://kitties.neocities.org/hatetolose.html))
([code](https://github.com/mk30/regl-demo-reel/blob/master/hatetolose.js))

v: hate to leave ([demo](https://kitties.neocities.org/hatetoleave.html))
([code](https://github.com/mk30/regl-demo-reel/blob/master/hatetoleave.js))

m: catmugs ([demo](https://kitties.neocities.org/catmugwoo.html))
([code](https://github.com/mk30/regl-demo-reel/blob/master/catmugwoo.js))

b: ball of catmugs ([demo](https://kitties.neocities.org/catmugball.html))
([code](https://github.com/mk30/regl-demo-reel/blob/master/catmugball.js))

d: dialog.exe (note: this one was made by [substack](https://twitter.com/substack))
([demo](https://substack.neocities.org/dialog.exe/))
([code](https://github.com/substack/glart/tree/master/dialog.exe))


### run code yourself

to run some of these demos yourself, you'll need [node.js and
npm](https://nodejs.org/en/download/).

once you have node.js & npm installed, fork this repository.

go to your forked version on github and via command line `git clone` the repository.

on your computer navigate to the directory that the repo was cloned into.

once there, do `npm install` to install the required dependencies.

once you've installed, you will have access to a number of scripts you can run
from the command line:

`npm run start`: run `npm run start` followed by the name of the file you want
to run. like this: `npm run start emoji.js`. if everything works correctly, you
should see something like `[0001] info  Server running at
http://192.168.93.17:9966/ (connect)`. open your browser and go to this url
`localhost:9966`. you should see the demo running. to stop this demo and start
running another one, go back to the command line and do `CTRL + c` to stop the
server. 

`npm run makehtml`: run `npm run makehtml` followed by two file names. the first
should be the input file (eg `emoji.js`) and the second should be the output
file (eg `emoji.html`). here's an example of the entire command: `npm run
makehtml emoji.js emoji.html`. this will generate an html file from one of the
demos.  

### build the demo reel html file

the demo reel is made up of 11 different demo programs (the various .js files)
that get put one after the other into a single html file. that html file will
include all the assets (images) used in the demos. it will also include
javascript that allows you to switch between demos by hitting certain keys on
the keyboard (as noted above).

there's a shell program called `cmd.sh` that takes all the files you give it,
runs them through the `regl.js` program (which is where the keys that go with
each demo get assigned, among other things), and then outputs an html file that
you can open in a browser like any other html file.

to use `cmd.sh`, once you've cloned and installed everything (as described
above), navigate via command line to the directory where you've cloned everything into and run `chmod
+x cmd.sh` (this command lets you run `cmd.sh` as an executable, like a .exe
file on windows).

once you've done the `chmod` command, run this command:

`./cmd.sh nightmarecats.js dialog/main.js cathello2.js catmugball.js catmugwoo.js hatetoleave.js hatetolose.js iphone.js emoji.js computer.js kbhands.js k116.js kate.js unicornwoo.js yellowparticlevortex.js | indexhtmlify > kate.html`

this command will run `cmd.sh` with all the files named after it then pack the
whole thing into `kate.html`. if you like, you can change `kate.html` to any name you want.



i hope you find this useful and if you have any questions, feel free to ask on
twitter: [@marinakukso](https://twitter.com/marinakukso).

all demos were created with [regl](http://regl.party).
