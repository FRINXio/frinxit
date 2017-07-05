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

or you can run in debug mode to see all REST interactions in clear text. 

~~~~
Gerhards-MacBook-Pro:frinxit gwieser$ node-debug frinxit.js 
~~~~

##Getting started with frinxit:

default settings are:

var odl_ip = '127.0.0.1';
var odl_user = "admin";
var odl_pass = "admin";

if you need to connect to another ip address use the "logon" command:

~~~~
frinxit$ logon --help
  Missing required argument. Showing Help:
  Usage: logon [options] <node_name>
  Alias: log
  Connects to an ODL node.
  Options:

    --help  output usage information

frinxit$ logon 192.168.0.22
Connecting to 192.168.0.22
Username: admin
Password: *****
<192.168.0.22>$ 
<192.168.0.22>$ 
~~~~

This will execute all ODL commands on the new ip address. User/pwd are stored in memory for each call to use with basic authentication.

you can test connectivity to ODL with the following command

~~~~
frinxit$ logon 192.168.0.22
Connecting to 192.168.0.22
Username: admin
Password: *****
<192.168.0.22>$ 
<192.168.0.22>$ test odl connectivity 
Can not connect to host or port
<192.168.0.22>$ 
<192.168.0.22>$ logon 127.0.0.1
Connecting to 127.0.0.1
Username: admin
Password: *****
<127.0.0.1>$ 
<127.0.0.1>$ test odl connectivity 
We have connectivity!
<127.0.0.1>$ 
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

## L3VPN commands

~~~~
    mount simulated <pe_id>                                                                 Mounts a simulated PE node in ODL.
    show operational simulated <pe_id>                                                      Displays operational data of simulated PE device.
    show l3vpn topologies simulated                                                         Displays L3VPN topology information.
    show l3vpn service                                                                      Displays L3VPN configuration data service model
                                                                                            information.
    delete simulated nc-device <node_id>                                                    Deletes a simulated netconf node in ODL.
    create l3vpn vpn <vpn_id> [customer_as] [route_distinguisher] [rt_imp] [rt_exp]         Creates a VPN in the L3VPN service module in ODL.
                                                                                            Use "commit l3vpn" command to push configuration
                                                                                            to devices.
    delete l3vpn vpn <vpn_id>                                                               Deletes a L3VPN.
    create l3vpn site <site_id> <vpn_id> <pe_id> [customer_ip] [provider_ip] [customer_as]  Creates a site connected to VPN in the L3VPN
                                                                                            service module in ODL.
    delete l3vpn site <site_id>                                                             Deletes a site from the VPN. Requires site-id.
    commit l3vpn                                                                            Commits the VPN service configurations and
                                                                                            downloads to devices.
    show l3vpn operational                                                                  Displays configuration data of the L3 VPN
~~~~    

### L3VPN Example

~~~~
frinxit$ 
frinxit$ 
frinxit$ create l3vpn vpn bambi
VPN was successfully created and mounted in the data store. Status code: 201
frinxit$ create l3vpn vpn bambi --help

  Usage: create l3vpn vpn [options] <vpn_id> [customer_as] [route_distinguisher] [rt_imp] [rt_exp]

  Creates a VPN in the L3VPN service module in ODL. Use "commit l3vpn" command to push configuration to devices.

  Options:

    --help  output usage information

frinxit$ create l3vpn site ce1 --help

  Missing required argument. Showing Help:

  Usage: create l3vpn site [options] <site_id> <vpn_id> <pe_id> [customer_ip] [provider_ip] [customer_as]

  Creates a site connected to VPN in the L3VPN service module in ODL.

  Options:

    --help  output usage information

frinxit$ create l3vpn site ce1 bambi pe05 1.1.1.1 2.2.2.2 65001
VPN was successfully created and mounted in the data store. Status code: 201
frinxit$ create l3vpn site ce2 bambi pe06 1.1.2.1 2.2.3.2 65001
VPN was successfully created and mounted in the data store. Status code: 201
frinxit$ show l3vpn service 
Status code: 200
{
  "l3vpn-svc": {
    "vpn-services": {
      "vpn-service": [
        {
          "vpn-id": "bambi",
          "vpn-service-topology": "ietf-l3vpn-svc:any-to-any",
          "l3vpn-param:route-distinguisher": {
            "as-index": 10,
            "as": 65001
          },
          "l3vpn-param:export-route-targets": {
            "route-target": {
              "as-index": 22,
              "as": 65001
            }
          },
          "l3vpn-param:import-route-targets": {
            "route-target": {
              "as-index": 22,
              "as": 65001
            }
          },
          "l3vpn-param:vrf-name": "bambi",
          "customer-name": "Customer name"
        }
      ]
    },
    "sites": {
      "site": [
        {
          "site-id": "ce2",
          "site-vpn-flavor": "ietf-l3vpn-svc:site-vpn-flavor-single",
          "management": {
            "type": "ietf-l3vpn-svc:customer-managed"
          },
          "site-network-accesses": {
            "site-network-access": [
              {
                "site-network-access-id": "Use this field to assist in mapping CEs to PE",
                "site-network-access-type": "ietf-l3vpn-svc:multipoint",
                "ip-connection": {
                  "ipv4": {
                    "addresses": {
                      "provider-address": "2.2.3.2",
                      "mask": 24,
                      "customer-address": "1.1.2.1"
                    },
                    "address-allocation-type": "ietf-l3vpn-svc:static-address"
                  }
                },
                "vpn-attachment": {
                  "vpn-id": "bambi",
                  "site-role": "ietf-l3vpn-svc:any-to-any-role"
                },
                "routing-protocols": {
                  "routing-protocol": [
                    {
                      "type": "ietf-l3vpn-svc:bgp",
                      "bgp": {
                        "autonomous-system": 65001,
                        "address-family": [
                          "ipv4"
                        ]
                      }
                    }
                  ]
                },
                "l3vpn-param:route-policy-in": "RPL_PASS_ALL",
                "l3vpn-param:pe-bgp-as": 65000,
                "l3vpn-param:route-policy-out": "RPL_PASS_ALL",
                "l3vpn-param:pe-node-id": "pe06",
                "l3vpn-param:pe-2-ce-tp-id": "GigabitEthernet0/0/0/1"
              }
            ]
          }
        },
        {
          "site-id": "ce1",
          "site-vpn-flavor": "ietf-l3vpn-svc:site-vpn-flavor-single",
          "management": {
            "type": "ietf-l3vpn-svc:customer-managed"
          },
          "site-network-accesses": {
            "site-network-access": [
              {
                "site-network-access-id": "Use this field to assist in mapping CEs to PE",
                "site-network-access-type": "ietf-l3vpn-svc:multipoint",
                "ip-connection": {
                  "ipv4": {
                    "addresses": {
                      "provider-address": "2.2.2.2",
                      "mask": 24,
                      "customer-address": "1.1.1.1"
                    },
                    "address-allocation-type": "ietf-l3vpn-svc:static-address"
                  }
                },
                "vpn-attachment": {
                  "vpn-id": "bambi",
                  "site-role": "ietf-l3vpn-svc:any-to-any-role"
                },
                "routing-protocols": {
                  "routing-protocol": [
                    {
                      "type": "ietf-l3vpn-svc:bgp",
                      "bgp": {
                        "autonomous-system": 65001,
                        "address-family": [
                          "ipv4"
                        ]
                      }
                    }
                  ]
                },
                "l3vpn-param:route-policy-in": "RPL_PASS_ALL",
                "l3vpn-param:pe-bgp-as": 65000,
                "l3vpn-param:route-policy-out": "RPL_PASS_ALL",
                "l3vpn-param:pe-node-id": "pe05",
                "l3vpn-param:pe-2-ce-tp-id": "GigabitEthernet0/0/0/1"
              }
            ]
          }
        }
      ]
    }
  }
}
frinxit$ commit l3vpn
Device(s) were successfully mmodified or overwritten in the data store. Status code: 200
{
  "output": {
    "l3vpn-svc-version": "11"
  }
}
frinxit$ show operational simulated pe05
Status code: 200
{
  "node": [
    {
      "node-id": "pe05",
      "mock-network-element:ne-fictive-configuration": {
        "ne-interfaces": {
          "ne-interface": [
            {
              "tp-id": "GigabitEthernet0/0/0/1",
              "interface": {
                "tp-id": "GigabitEthernet0/0/0/1",
                "vrf-name": "bambi",
                "ip-address": "2.2.2.2/24",
                "enable": true
              }
            }
          ]
        },
        "ne-vrfs": {
          "ne-vrf": [
            {
              "vrf-name": "bambi",
              "vrf": {
                "vrf-name": "bambi",
                "import-route-targets": {
                  "route-target": {
                    "as-index": 22,
                    "as": 65001
                  }
                },
                "export-route-targets": {
                  "route-target": {
                    "as-index": 22,
                    "as": 65001
                  }
                }
              }
            }
          ]
        },
        "ne-bgp-vrfs": {
          "ne-bgp-vrf": [
            {
              "vrf-name": "bambi",
              "bgp-vrf": {
                "neighbor-as": 65001,
                "route-policy-out": "RPL_PASS_ALL",
                "vrf-name": "bambi",
                "route-policy-in": "RPL_PASS_ALL",
                "local-as": 65000,
                "route-distinguisher": {
                  "as-index": 10,
                  "as": 65001
                },
                "neighbor-ip": "1.1.1.1/24"
              }
            }
          ]
        }
      }
    }
  ]
}
frinxit$ show operational simulated pe06
Status code: 200
{
  "node": [
    {
      "node-id": "pe06",
      "mock-network-element:ne-fictive-configuration": {
        "ne-interfaces": {
          "ne-interface": [
            {
              "tp-id": "GigabitEthernet0/0/0/1",
              "interface": {
                "tp-id": "GigabitEthernet0/0/0/1",
                "vrf-name": "bambi",
                "ip-address": "2.2.3.2/24",
                "enable": true
              }
            }
          ]
        },
        "ne-vrfs": {
          "ne-vrf": [
            {
              "vrf-name": "bambi",
              "vrf": {
                "vrf-name": "bambi",
                "import-route-targets": {
                  "route-target": {
                    "as-index": 22,
                    "as": 65001
                  }
                },
                "export-route-targets": {
                  "route-target": {
                    "as-index": 22,
                    "as": 65001
                  }
                }
              }
            }
          ]
        },
        "ne-bgp-vrfs": {
          "ne-bgp-vrf": [
            {
              "vrf-name": "bambi",
              "bgp-vrf": {
                "neighbor-as": 65001,
                "route-policy-out": "RPL_PASS_ALL",
                "vrf-name": "bambi",
                "route-policy-in": "RPL_PASS_ALL",
                "local-as": 65000,
                "route-distinguisher": {
                  "as-index": 10,
                  "as": 65001
                },
                "neighbor-ip": "1.1.2.1/24"
              }
            }
          ]
        }
      }
    }
  ]
}
frinxit$ show l3vpn 
show l3vpn operational  show l3vpn service  show l3vpn topologies simulated
frinxit$ show l3vpn service | grep vpn-id
          "vpn-id": "bambi",
                  "vpn-id": "bambi",
                  "vpn-id": "bambi",
frinxit$ show l3vpn service | grep site-id
          "site-id": "ce2",
          "site-id": "ce1",
frinxit$
~~~~
