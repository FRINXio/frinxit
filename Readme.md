# Getting started with Frinxit.js

install node.js & npm on your machine:

~~~~
sudo apt install nodejs
sudo apt install npm
~~~~

[https://nodejs.org/en/download/package-manager/](https://nodejs.org/en/download/package-manager/)

[https://www.sitepoint.com/beginners-guide-node-package-manager/](https://www.sitepoint.com/beginners-guide-node-package-manager/)

use npm to install the following packages

* superagent
* superagent-xml2jsparser
* vorpal
* vorpal-less
* vorpal-grep
* vorpal-tour
* colors 

this should look similar to the following output:

~~~~
gwieser@fmach:~/frinxit$ npm install superagent vorpal vorpal-less vorpal-grep vorpal-tour colors superagent-xml2jsparser
/home/gwieser/frinxit
├── colors@1.3.3
├── superagent@4.1.0
├─┬ superagent-xml2jsparser@0.1.1
│ └─┬ xml2js@0.4.19
│   ├── sax@1.2.4
│   └── xmlbuilder@9.0.7
├── vorpal@1.12.0
├── vorpal-grep@0.2.0
├── vorpal-less@0.0.13
└── vorpal-tour@0.0.5

gwieser@fmach:~/frinxit$
~~~~

Get the Frinxit.js code from Github

clone the repository from here:

https://github.com/FRINXio/frinxit

start frinxit.js with

~~~~
Gerhards-MacBook-Pro:frinxit gwieser$ node frinxit.js 
frinxit$ 
~~~~


## Getting started with frinxit:

default settings are:

~~~~
const ODL_IP = '127.0.0.1'
const ODL_USER = 'admin'
const ODL_PASSWORD = 'admin'
~~~~

FRINXIT will read an environmnent variable "odl_target" from its host and if it is set it will use that IP address as a default host address for all REST calls towards ODL. If the env variable does not exist, we will use 127.0.0.1 as default. The user can change the host address at any time by using the "logon" command.

~~~~
frinxit$ logon 192.168.1.50
Connecting to 192.168.1.50
Username: admin
Password: *****
<192.168.1.50>$ show odl version
Status code: 200
{
  "versions": {
    "controller-version": "3.1.6.frinx"
  }
}
<192.168.1.50>$ exit
frinxit$ exit
gwieser@fmach:~/frinxit$
~~~~


## Grep and less support
Frinxit supports pipes to grep and less:

~~~~
frinxit$ show l3vpn service | grep vpn-id
          "vpn-id": "bambi",
                  "vpn-id": "bambi",
                  "vpn-id": "bambi",
frinxit$ show l3vpn service | grep site-id
          "site-id": "ce2",
          "site-id": "ce1",
frinxit$ 
~~~~

