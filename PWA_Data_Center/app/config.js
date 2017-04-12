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
      'datastorage':            'custom/datastorage',
      'crossdatastoragehub' :   'custom/crossdatastoragehub',
      'auth0configurator' :     'custom/auth0connection'
    },
    shim : {
      'auth0' : {
        exports : 'Auth0'
      }
    }
});

requirejs(['main']);
