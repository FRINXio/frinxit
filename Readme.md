# Getting started with Frinxit.js

install node.js & npm on your machine:

[https://nodejs.org/en/download/package-manager/](https://nodejs.org/en/download/package-manager/)

[https://www.sitepoint.com/beginners-guide-node-package-manager/](https://www.sitepoint.com/beginners-guide-node-package-manager/)

use npm to install the following packages

* superagent
* vorpal
* vorpal-less
* vorpal-grep

this should look similar to the following output:

~~~~
Gerhards-MacBook-Pro:~ gwieser$ npm install superagent

superagent@3.5.2 node_modules/superagent
├── cookiejar@2.1.1
├── methods@1.1.2
├── component-emitter@1.2.1
├── extend@3.0.1
├── mime@1.3.6
├── formidable@1.1.1
├── qs@6.4.0
├── debug@2.6.8 (ms@2.0.0)
├── form-data@2.1.4 (asynckit@0.4.0, combined-stream@1.0.5, mime-types@2.1.15)
└── readable-stream@2.2.9 (buffer-shims@1.0.0, inherits@2.0.3, util-deprecate@1.0.2, process-nextick-args@1.0.7, core-util-is@1.0.2, isarray@1.0.0, string_decoder@1.0.1)

Gerhards-MacBook-Pro:~ gwieser$ npm install vorpal
vorpal@1.12.0 node_modules/vorpal
├── node-localstorage@0.6.0
├── in-publish@2.0.0
├── minimist@1.2.0
├── strip-ansi@3.0.1 (ansi-regex@2.1.1)
├── chalk@1.1.3 (escape-string-regexp@1.0.5, ansi-styles@2.2.1, supports-color@2.0.0, has-ansi@2.0.0)
├── log-update@1.0.2 (ansi-escapes@1.4.0, cli-cursor@1.0.2)
├── wrap-ansi@2.1.0 (string-width@1.0.2)
├── inquirer@0.11.0 (ansi-regex@2.1.1, ansi-escapes@1.4.0, rx-lite@3.1.2, through@2.3.8, cli-width@1.1.1, figures@1.7.0, cli-cursor@1.0.2, readline2@1.0.1, run-async@0.1.0, lodash@3.10.1)
├── lodash@4.17.4
└── babel-polyfill@6.23.0 (regenerator-runtime@0.10.5, babel-runtime@6.23.0, core-js@2.4.1)

Gerhards-MacBook-Pro:~ gwieser$ npm install vorpal-less
vorpal-less@0.0.13 node_modules/vorpal-less
└── slice-ansi@0.0.3

Gerhards-MacBook-Pro:~ gwieser$ npm install vorpal-grep
vorpal-grep@0.2.0 node_modules/vorpal-grep
├── vorpal-autocomplete-fs@0.0.3 (strip-ansi@3.0.1, chalk@1.1.3)
└── glob@5.0.15 (path-is-absolute@1.0.1, inherits@2.0.3, once@1.4.0, inflight@1.0.6, minimatch@3.0.4)
Gerhards-MacBook-Pro:~ gwieser$ 
~~~~

Get the Frinxit.js code from Github

clone the repository from here:

https://github.com/FRINXio/frinxit

start frinxit.js with

~~~~
Gerhards-MacBook-Pro:frinxit gwieser$ node frinxit.js 
frinxit$ 
~~~~
