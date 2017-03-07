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
    origin : location.origin,
    keys : []
  };


  crossDomainManager.init = function (keys=['type', 'timestamp', 'unit', 'deviceID', 'values']) {
    crossDomainManager.keys = keys;
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
        crossDomainManager.setCreateHandler();
        crossDomainManager.setReadHandler();
        return Promise.resolve([crossDomainManager.iframes, crossDomainManager.knownHosts]);
      });
  };

  crossDomainManager.setCreateHandler = function (method=createHandler) {
    crossDomainManager.createHandler = method;
  };

  crossDomainManager.setReadHandler = function (method=readHandler) {
    crossDomainManager.readHandler = method;
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

  const verifyCreateObject = function (object) {
    var keys = Object.keys(object);
    for ( let i = 0; i < crossDomainManager.keys; i++ ) {
      if ( keys.indexOf(crossDomainManager.keys[i]) > -1 ) {
        continue;
      } else {
        return false;
      }
    }
    return true;
  };

  const createHandler = function (event, dataObject) {
    let res = {status:'success'};
    for ( let i = 0; i< dataObject.query.length; i ++ ) {
      if( !verifyCreateObject(dataObject.query[i]) ) {
        res = {
          status : 'failure',
          error : 'Object is not in given scheme!'
        };
        makeResponse(event, dataObject, res);
        return;
      }
    }
    crossDomainManager.dbApi.insertData(dataObject.query)
      .then(function (res) {
        res.data = [];
        makeResponse(event, dataObject, res);
        console.log('Created values: ', dataObject.query);
        return;
      });
  };

  const verifyReadObject = function (query) {
    if ( query.length !== 1 ) {
      return false;
    }
    var keys = Object.keys(query[0]);
    if ( keys.length !== 1 ) {
      return false;
    }
    if ( keys[0] !== 'type' ) {
      return false;
    }
    return true;
  };

  const readHandler = function (event, dataObject) {
    let response = {status:'success'};
    if( !verifyReadObject(dataObject.query) ) {
      response = {
        status : 'failure',
        error : 'Object is not in given scheme!'
      };
      makeResponse(event, dataObject, response);
      return;
    }
    var queryId = dataObject.query[0].type;
    crossDomainManager.dbApi.readData(queryId)
      .then(function (res) {
        response.message = 'Successfully fetched data';
        response.data = res.data;
        makeResponse(event, dataObject, response);
        console.log('Found values: ', res);
        return;
      });
  };

  const makeResponse = function (event, request, response) {
    var res = {
      request : request,
      response : response
    };
    event.source.postMessage(JSON.stringify(res), '*');
  };

  const initializePostApi = function (centerObject) {
      const handleRequest = function (event) {
        const dataObject = JSON.parse(event.data);
        if (verifyOrigin(event.origin, dataObject.method, centerObject)) {
          switch (dataObject.method) {
            case 'create':
              crossDomainManager.createHandler(event, dataObject);
                  break;
            case 'read':
              crossDomainManager.readHandler(event, dataObject);
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
          makeResponse(event, dataObject, res);
          return;
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
