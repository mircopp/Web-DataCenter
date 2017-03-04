/**
 * Created by Mirco on 28.02.2017.
 *
 * This js file is the main part of this project, handling all incoming datarequests of all registered web applications
 */
'use strict';

define(function (require) {

  const Database = require('DatabaseRequestHandler');
  const Util = require('Util');


  const crossDomainManager = {
    util: new Util(),
    iframes: {},
    origin : location.origin
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
          crossDomainManager.iframes[crossDomainManager.knownHosts[i]] = (crossDomainManager.util.createIFrame(crossDomainManager.knownHosts[i]));
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
        return Promise.resolve([crossDomainManager.iframes, crossDomainManager.knownHosts]);
      });
  };



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

  const makeResponse = function (host, request, response) {
    var res = {
      request : request,
      response : response
    };
    var iFrame = crossDomainManager.iframes[host];
    iFrame.contentWindow.postMessage(JSON.stringify(res), host);
  };

  const initializePostApi = function (centerObject) {
      const handleRequest = function (event) {
        const dataObject = JSON.parse(event.data);
        if (verifyOrigin(event.origin, dataObject.method, centerObject)) {
          switch (dataObject.method) {
            case 'create':
              var response = {
                status: 'success',
                data : []
              };
              makeResponse(event.origin, dataObject, response);
              console.log('Created value: ', dataObject.query);
              //TODO insert value into local database
                  break;
            case 'read':
              console.log('Read value: ', dataObject.query);
              // TODO read value from database
                  break;
            case 'update':
              console.log('Updated value: ', dataObject.query);
              //TODO update value in database
                  break;
            case 'delete':
              console.log('Deleted value: ', dataObject.query);
              // TODO delete value in database
                  break;
            default:
              break;
          }
        } else {
          var res = {
            status : 'failure',
            error : 'Method not allowed'
          };
          makeResponse(event.origin, dataObject, res);
        }
      };

      if(window.addEventListener){
          window.addEventListener("message", handleRequest, false);
      } else if (window.attachEvent){
          window.attachEvent("onmessage", handleRequest);
      }
  };

  return crossDomainManager;
});
