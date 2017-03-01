/**
 * Created by Mirco on 28.02.2017.
 *
 * This js file is the main part of this project, handling all incoming datarequests of all registered web applications
 */
'use strict';

define(function (require) {

  const Database = require('DatabaseRequestHandler');

  const crossDomainManager = {};


  /**
   * see https://www.nczonline.net/blog/2010/09/07/learning-from-xauth-cross-domain-localstorage/
   * @param event
   */
  const verifyOrigin = function (origin, method, centerObject) {
     if ( centerObject.knownHosts.indexOf(origin) > -1 ) {
        if ( centerObject.hostSettings[origin].methods[method] ) {
            return true;
        } else {
          return false;
        }
     } else {
       centerObject.dbApi.insertNewHost(origin);
       return false;
     }
  };

  const initializePostApi = function (centerObject) {
      const handleRequest = function (event) {
        const dataObject = JSON.parse(event.data);
        if (verifyOrigin(event.origin, dataObject.method, centerObject)) {
          switch (dataObject.method) {
            case 'create':
              //TODO insert value into local database
              return 'test';
                  break;
            case 'read':
              // TODO read value from database
                  break;
            case 'update':
              //TODO update value in database
                  break;
            case 'delete':
              // TODO delete value in database
                  break;
            default:
              break;
          }
        } else {
          // TODO what if method not allowed
          throw 'Method not allowed';
        }
      };

      if(window.addEventListener){
          window.addEventListener("message", handleRequest, false);
      } else if (window.attachEvent){
          window.attachEvent("onmessage", handleRequest);
      }
  };
  crossDomainManager.init = function () {
    crossDomainManager.dbApi = new Database();
    crossDomainManager.knownHosts = [];
    crossDomainManager.hostSettings = {};
    return crossDomainManager.dbApi.getKnownHosts()
      .then(function (docs) {
        crossDomainManager.knownHosts = crossDomainManager.knownHosts.concat(crossDomainManager.dbApi.extractKnownHosts(docs));
      })
      .then(function () {
        for ( let i = 0; i < crossDomainManager.knownHosts.length; i++) {
          crossDomainManager.dbApi.getSettingsOfHost(crossDomainManager.knownHosts[i]).then(function (doc) {
            let id = doc._id;
            delete doc['_id'];
            delete doc['_rev'];
            crossDomainManager.hostSettings[id] = doc;
          });
        }
      })
      .then(function () {
        initializePostApi(crossDomainManager);
      });
  };

  return crossDomainManager;
});
