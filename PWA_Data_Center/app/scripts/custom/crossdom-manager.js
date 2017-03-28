/**
 * Created by Mirco on 28.02.2017.
 *
 * This js file is the main part of this project, handling all incoming datarequests of all registered web applications
 */
'use strict';

define(function (require) {

  const Database = require('DatabaseRequestHandler');

  const crossDomainDataManager = {
    origin : location.href,
    dbApi : new Database(),
    knownHosts : [],
    hostSettings : {},
    keys : []
  };

  // public methods

  crossDomainDataManager.init = function (keys=['type', 'timestamp', 'unit', 'deviceID', 'values']) {
    crossDomainDataManager.keys = keys;
    crossDomainDataManager.setCreateHandler();
    crossDomainDataManager.setReadHandler();
    return crossDomainDataManager.getKnownHosts()
      .then(function (res) {
        for ( let i = 0; i < crossDomainDataManager.knownHosts.length; i++) {
          crossDomainDataManager.getSettingsOfHost(crossDomainDataManager.knownHosts[i]);
        }
        return Promise.resolve(crossDomainDataManager.knownHosts);
      });
  };

  crossDomainDataManager.connect = function () {
    initializePostApi(crossDomainDataManager);
  };

  crossDomainDataManager.getSettingsOfHost = function (host) {
    if (crossDomainDataManager.hostSettings[host]) {
      var keys = Object.keys(crossDomainDataManager.hostSettings[host]);
      var res = {
        '_id' : host
      };
      for ( let i = 0; i < keys.length; i++ ) {
       res[keys[i]] = crossDomainDataManager.hostSettings[host][keys[i]];
      }
      return Promise.resolve(res);
    } else {
      return crossDomainDataManager.dbApi.getSettingsOfHost(host)
        .then(function (doc) {
          setSettingsOfHost(doc);
          var keys = Object.keys(crossDomainDataManager.hostSettings[host]);
          var res = {
            '_id' : host
          };
          for ( let i = 0; i < keys.length; i++ ) {
           res[keys[i]] = crossDomainDataManager.hostSettings[host][keys[i]];
          }
          return Promise.resolve(res);
        });
    }
  };

  crossDomainDataManager.setSettingsOfHost = function (host, method, checked) {
    return crossDomainDataManager.dbApi.setMethodOfHost(host, method, checked);
  };

  crossDomainDataManager.getKnownHosts = function () {
    return crossDomainDataManager.dbApi.getKnownHosts()
      .then(function (docs) {
        crossDomainDataManager.knownHosts = crossDomainDataManager.knownHosts.concat(crossDomainDataManager.dbApi.extractKnownHosts(docs));
        return crossDomainDataManager.knownHosts;
      });
  };

  crossDomainDataManager.setCreateHandler = function (method=createHandler) {
    crossDomainDataManager.createHandler = method;
  };

  crossDomainDataManager.setReadHandler = function (method=readHandler) {
    crossDomainDataManager.readHandler = method;
  };



  // private methods

  const setSettingsOfHost = function (doc) {
    let id = doc._id;
    delete doc['_id'];
    delete doc['_rev'];
    crossDomainDataManager.hostSettings[id] = doc;
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
    for ( let i = 0; i < crossDomainDataManager.keys; i++ ) {
      if ( keys.indexOf(crossDomainDataManager.keys[i]) > -1 ) {
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
          message : 'Object is not in given scheme!'
        };
        makeResponse(event, dataObject, res);
        return;
      }
    }
    crossDomainDataManager.dbApi.insertData(dataObject.query)
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
        message : 'Object is not in given scheme!'
      };
      makeResponse(event, dataObject, response);
      return;
    }
    var queryId = dataObject.query[0].type;
    crossDomainDataManager.dbApi.readData(queryId)
      .catch(function (err) {
        return {data:[]};
      })
      .then(function (res) {
        response.message = 'Successfully fetched data!';
        if ( res.data.length > 0 ) {
          response.data = res.data;

        } else {
          response.status = 'failure';
          response.message = 'No data found!';
          response.data = [];
        }
        makeResponse(event, dataObject, response);
        return;
      });
  };

  const makeResponse = function (event, request, response) {
    var res = {
      request : request,
      response : response
    };
    console.log(JSON.stringify(res));
    event.source.postMessage(JSON.stringify(res), '*');
  };

  const initializePostApi = function (centerObject) {
      const handleRequest = function (event) {
        const dataObject = JSON.parse(event.data);
        if (verifyOrigin(event.origin, dataObject.method, centerObject)) {
          switch (dataObject.method) {
            case 'create':
              crossDomainDataManager.createHandler(event, dataObject);
                  break;
            case 'read':
              crossDomainDataManager.readHandler(event, dataObject);
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
            message : 'Method not allowed'
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

  return crossDomainDataManager;
});
