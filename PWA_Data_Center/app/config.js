/**
 * Configuration file for all requirejs dependencies
 * used in order to achieve dynamically loaded javascript files
 */

'use strict';

requirejs.config({
    baseUrl: 'scripts',
    paths: {
      'jquery':                 'lib/jquery-3.1.1',
      'pouchdb':                'lib/pouchdb-6.1.2',
      'Util' :                  'custom/util',
      'DatabaseRequestHandler': 'custom/db-reqhandler',
      'crossDomainManager' :    'custom/crossdom-manager',
      'auth0Connector' :        'custom/auth0connection',
      'auth0-lock' :            '//cdn.auth0.com/js/lock/10.3.0/lock.min'
    },
    shim : {
      'auth0' : {
        exports : 'Auth0'
      }
    }
});

requirejs(['main']);
