/**
 * Created by Mirco on 28.02.2017.
 *
 * This js file is the main part of this project, handling all incoming datarequests of all registered web applications
 */
'use strict';

define(function (require) {

  const Database = require('DatabaseRequestHandler');

  const auth0Lock = require('auth0Connector');

  const crossDomainDataManager = {
    origin : location.href,
    dbApi : new Database(),
    knownHosts : [],
    hostSettings : {},
    keys : [],
  };

  // public methods

  crossDomainDataManager.init = function (keys=['type', 'timestamp', 'unit', 'deviceID', 'values']) {
    crossDomainDataManager.keys = keys;
    crossDomainDataManager.setCreateHandler();
    crossDomainDataManager.setReadHandler();
    crossDomainDataManager.setUpdateHandler();
    crossDomainDataManager.setDeleteHandler();
    // return crossDomainDataManager.getKnownHosts()
    //   .then(function (res) {
    //     for ( let i = 0; i < crossDomainDataManager.knownHosts.length; i++) {
    //       crossDomainDataManager.getSettingsOfHost(crossDomainDataManager.knownHosts[i]);
    //     }
    //     return Promise.resolve(crossDomainDataManager.knownHosts);
    //   });
  };

  crossDomainDataManager.connect = function () {
    initializePostApi(crossDomainDataManager);
  };

  crossDomainDataManager.setKnownHosts = function (userID) {
    return crossDomainDataManager.getKnownHosts(userID)
      .then(function (res) {
        for ( let i = 0; i < crossDomainDataManager.knownHosts.length; i++) {
          crossDomainDataManager.getSettingsOfHost(crossDomainDataManager.knownHosts[i], userID);
        }
        return Promise.resolve(crossDomainDataManager.hostSettings);
      });
  };

  crossDomainDataManager.getSettingsOfHost = function (host, userID) {
    var id = host + '|' + userID;
    if (crossDomainDataManager.hostSettings[id]) {
      var keys = Object.keys(crossDomainDataManager.hostSettings[id]);
      var res = {
        '_id' : id,
        'host' : host,
        'userID' : userID
      };
      for ( let i = 0; i < keys.length; i++ ) {
       res[keys[i]] = crossDomainDataManager.hostSettings[id][keys[i]];
      }
      return Promise.resolve(res);
    } else {
      return crossDomainDataManager.dbApi.getSettingsOfHost(host, userID)
        .then(function (doc) {
          var temp = setHostSettingObject(doc);
          var keys = Object.keys(crossDomainDataManager.hostSettings[id]);
          var res = {
            '_id' : id,
            'host' : host,
            'userID' : userID
          };
          for ( let i = 0; i < keys.length; i++ ) {
           res[keys[i]] = crossDomainDataManager.hostSettings[id][keys[i]];
          }
          return Promise.resolve(res);
        });
    }
  };

  crossDomainDataManager.setSettingsOfHost = function (host, userID, method, checked) {
    return crossDomainDataManager.dbApi.setMethodOfHost(host, userID, method, checked)
      .then(function () {
        crossDomainDataManager.getSettingsOfHost(host, userID);
      });
  };

  crossDomainDataManager.getKnownHosts = function (userID) {
    return crossDomainDataManager.dbApi.getKnownHosts()
      .then(function (docs) {
        crossDomainDataManager.knownHosts = crossDomainDataManager.knownHosts.concat(crossDomainDataManager.dbApi.extractKnownHosts(docs, userID));
        return crossDomainDataManager.knownHosts;
      });
  };

  crossDomainDataManager.setCreateHandler = function (method=createHandler) {
    crossDomainDataManager.createHandler = method;
  };

  crossDomainDataManager.setReadHandler = function (method=readHandler) {
    crossDomainDataManager.readHandler = method;
  };

  crossDomainDataManager.setUpdateHandler = function (method = updateHandler) {
    crossDomainDataManager.updateHandler = method;
  };

  crossDomainDataManager.setDeleteHandler = function (method = deleteHandler) {
    crossDomainDataManager.deleteHandler = method;
  };

  crossDomainDataManager.getProfile = function (userID, profile) {
    return crossDomainDataManager.dbApi.getUserProfile(userID)
      .then(function (res) {
        if ( !res ) {
          return crossDomainDataManager.dbApi.setUserProfile(userID, profile);
        } else {
          return Promise.resolve(res);
        }
      })
  };



  // private methods

  const setHostSettingObject = function (doc) {
    let id = doc._id;
    delete doc['_id'];
    delete doc['_rev'];
    delete doc['userID'];
    delete doc['host'];
    crossDomainDataManager.hostSettings[id] = doc;
  };
  /**
   * see https://www.nczonline.net/blog/2010/09/07/learning-from-xauth-cross-domain-localstorage/
   * @param event
   */
  const verifyOrigin = function (origin, method, centerObject, userID) {
    var protocol = origin.split('://') [0];
    if (!protocol || (protocol !== 'https'))
      return Promise.resolve([false, 'Origin has not the right protocol, given:' + protocol + ' , need: https']);
    var id = origin + '|' + userID;
    if ( centerObject.knownHosts.indexOf(origin) > -1 ) {
      if (centerObject.hostSettings[id]) {
        return Promise.resolve([centerObject.hostSettings[id].methods[method], 'Method allowed status: ' + centerObject.hostSettings[id].methods[method]]);
      } else {
        return centerObject.getSettingsOfHost(origin, userID)
          .then(function (settings) {
            return [settings.methods[method], 'Method allowed status: ' + settings.methods[method]];
          })
      }
    } else {
     centerObject.dbApi.insertNewHost(origin, userID);
     return Promise.resolve([false, 'Application registered, Method not allowed']);
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

  const createHandler = function (event, dataObject, userID) {
    let res = {status:'success'};
    for ( let i = 0; i< dataObject.query.dataObjects.length; i ++ ) {
      if( !verifyCreateObject(dataObject.query.dataObjects[i]) ) {
        res = {
          status : 'failure',
          message : 'Object is not in given scheme!'
        };
        makeResponse(event, dataObject, res);
        return;
      }
      dataObject.query.dataObjects[i].userID = userID;
    }
    crossDomainDataManager.dbApi.insertData(dataObject.query.dataObjects)
      .then(function (res) {
        res.data = [];
        makeResponse(event, dataObject, res);
        console.log('Created values: ', dataObject.query);
        return;
      });
  };

  const verifyReadObject = function (query) {
    var keys = Object.keys(query);
    if ( keys.length !== 1 ) {
      return false;
    }
    if ( keys[0] !== 'type' ) {
      return false;
    }
    return true;
  };

  const readHandler = function (event, dataObject, userID) {
    let response = {status:'success'};
    if( !verifyReadObject(dataObject.query) ) {
      response = {
        status : 'failure',
        message : 'Object is not in given scheme!'
      };
      makeResponse(event, dataObject, response);
      return;
    }
    var queryId = dataObject.query.type;
    crossDomainDataManager.dbApi.readData(queryId, userID)
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

  const updateHandler = function (event, dataObject, userID) {
    let response = {status:'success'};
    var oldData = dataObject.query.oldObject;
    var newData = dataObject.query.newObject;
    var type = oldData.type;
    crossDomainDataManager.dbApi.updateDataObject(type, userID, oldData, newData)
      .then(function (res) {
        if ( res.status === 'success' ) {
          res.message = 'Successfully updated data object';
        }
        makeResponse(event, dataObject, res);
      })
  };

  const deleteHandler = function (event, dataObject, userID) {
    let response = {status:'success'};
    if( !verifyReadObject(dataObject.query) ) {
      response = {
        status : 'failure',
        message : 'Object is not in given scheme!'
      };
      makeResponse(event, dataObject, response);
      return;
    }
    var queryId = dataObject.query.type;
    crossDomainDataManager.dbApi.deleteObjectByDataType(queryId, userID)
      .catch(function (err) {
        return {data : []};
      })
      .then(function (res) {
        if ( res.data.length === 0 ) {
          response.message = 'No Data to delete';
        } else {
          response.message = 'Successfully deleted data';
        }
        response.data = res.data;
        makeResponse(event, dataObject, response);
        return;
      })
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
        //TODO send id_token in data field described in bachelor thesis
        var user_token = dataObject.id_token;

        verifyUserToken({id_token: user_token, success : function (userID, profile) {
          crossDomainDataManager.getProfile(userID, profile)
            .then(function (profile) {
              crossDomainDataManager.setKnownHosts(userID)
                .then(function (hosts) {
                  verifyOrigin(event.origin, dataObject.method, centerObject, userID)
                    .then(function (response) {
                      var originVerification = response;
                      if (originVerification[0]) {
                        switch (dataObject.method) {
                          case 'create':
                            crossDomainDataManager.createHandler(event, dataObject, userID);
                                break;
                          case 'read':
                            crossDomainDataManager.readHandler(event, dataObject, userID);
                                break;
                          case 'update':
                            console.log('Updated value: ', dataObject.query);
                            crossDomainDataManager.updateHandler(event, dataObject, userID);
                            //TODO update value in database
                                break;
                          case 'delete':
                            crossDomainDataManager.deleteHandler(event, dataObject, userID);
                                break;
                          default:
                            break;
                        }
                      } else {
                        var res = {
                          status : 'failure',
                          message : originVerification[1]
                        };
                        makeResponse(event, dataObject, res);
                        return;
                      }
                    });
                })
            });
        }, error: function (err) {
          var res = {
            status : 'failure',
            message : 'User authentification failed: ' + err
          };
          makeResponse(event, dataObject, res);
        }});

      };

      if(window.addEventListener){
          window.addEventListener("message", handleRequest, false);
      } else if (window.attachEvent){
          window.attachEvent("onmessage", handleRequest);
      }
  };

  const verifyUserToken = function (params) {
    if (!params.id_token) {
      params.error('Please Specify id_token to verify');
      return;
    }
    var id_token = params.id_token;
    auth0Lock.lock.getProfile(id_token, function (err, profile) {
      if (err) {
        params.error(err.error + ': ' + err.description);
      } else {
        params.success(profile.email, profile);
      }
    });
  };

  return crossDomainDataManager;
});
