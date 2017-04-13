/**
 * Created by Mirco on 28.02.2017.
 *
 * This js file is the main part of this project, handling all incoming datarequests of all registered web applications
 */
'use strict';

define(function (require) {

  const DataStorage = require('datastorage');
  const Auth0Configurator = require('auth0configurator');

  const privateMethods = {};
  const eventHandlerMethods = {};
  const verifiers = {};

  // Constructor
  function CrossDataStorageHub() {
    this.origin = location.href;
    this.dataStorage = new DataStorage();
    this.auth0Configurator = new Auth0Configurator('BjG2eeVb5DiafM9I8Jf5GPpBTKxE4MXY', 'mircopp.eu.auth0.com');
    this.hostSettings = {};
    this.keys = [];
  }

  // public methods
  CrossDataStorageHub.prototype.connect = function (keys = ['type', 'unit', 'timestamp', 'applicationID', 'values']) {
    this.keys = keys;
    this.setCreateHandler();
    this.setReadHandler();
    this.setUpdateHandler();
    this.setDeleteHandler();
    privateMethods.initializePostApi(this);
  };

  // Getter methods
  CrossDataStorageHub.prototype.getKnownHosts = function (userID) {
    const _this = this;
    return this.dataStorage.getKnownHosts()
      .then(function (docs) {
        return _this.dataStorage.extractKnownHosts(docs, userID);
      });
  };

  CrossDataStorageHub.prototype.getSettingsOfHost = function (host, userID) {
    const id = host + '|' + userID;
    const res = {
      '_id': id,
      'host': host,
      'userID': userID
    };
    if (this.hostSettings[id]) {
      const keys = Object.keys(this.hostSettings[id]);
      for (let i = 0; i < keys.length; i++) {
        res[keys[i]] = this.hostSettings[id][keys[i]];
      }
      return Promise.resolve(res);
    } else {
      const _this = this;
      return this.dataStorage.getSettingsOfHost(host, userID)
        .then(function (doc) {
          privateMethods.setHostSettingObject(_this, doc);
          const keys = Object.keys(_this.hostSettings[id]);
          for (let i = 0; i < keys.length; i++) {
            res[keys[i]] = _this.hostSettings[id][keys[i]];
          }
          return Promise.resolve(res);
        });
    }
  };


  // Setter methods
  CrossDataStorageHub.prototype.setKnownHosts = function (userID) {
    const _this = this;
    return this.getKnownHosts(userID)
      .then(function (res) {
        var promises = [];
        for (let i = 0; i < res.length; i++) {
          promises.push(_this.getSettingsOfHost(res[i], userID));
        }
        return Promise.all(promises);
      });
  };

  CrossDataStorageHub.prototype.setSettingsOfHost = function (host, userID, method, checked) {
    var _this = this;
    return this.dataStorage.setMethodOfHost(host, userID, method, checked)
      .then(function () {
        _this.getSettingsOfHost(host, userID);
      });
  };

  CrossDataStorageHub.prototype.setProfile = function (userID, profile) {
    var _this = this;
    return this.dataStorage.getUserProfile(userID)
      .then(function (res) {
        if (!res) {
          return _this.dataStorage.setUserProfile(userID, profile);
        } else {
          return Promise.resolve(res);
        }
      })
  };

  CrossDataStorageHub.prototype.setCreateHandler = function (method = eventHandlerMethods.defaultCreateHandler) {
    this.createHandler = method;
  };

  CrossDataStorageHub.prototype.setReadHandler = function (method = eventHandlerMethods.defaultReadHandler) {
    this.readHandler = method;
  };

  CrossDataStorageHub.prototype.setUpdateHandler = function (method = eventHandlerMethods.defaultUpdateHandler) {
    this.updateHandler = method;
  };

  CrossDataStorageHub.prototype.setDeleteHandler = function (method = eventHandlerMethods.defaultDeleteHandler) {
    this.deleteHandler = method;
  };


  // private methods
  privateMethods.initializePostApi = function (_this) {
    const handleRequest = function (event) {
      const dataObject = JSON.parse(event.data);
      const user_token = dataObject.id_token;
      verifiers.verifyUserToken(_this, {
        id_token: user_token, success: function (userID, profile) {
          _this.setProfile(userID, profile)
            .then(function (profile) {
              _this.setKnownHosts(userID)
                .then(function () {
                  verifiers.verifyOrigin(_this, event.origin, dataObject.method, userID)
                    .then(function (response) {
                      const originVerification = response;
                      if (originVerification.status) {
                        switch (dataObject.method) {
                          case 'create':
                            _this.createHandler(_this, event, dataObject, userID);
                            break;
                          case 'read':
                            _this.readHandler(_this, event, dataObject, userID);
                            break;
                          case 'update':
                            _this.updateHandler(_this, event, dataObject, userID);
                            break;
                          case 'delete':
                            _this.deleteHandler(_this, event, dataObject, userID);
                            break;
                          default:
                            break;
                        }
                      } else {
                        const res = {
                          status: 'failure',
                          message: originVerification.message
                        };
                        privateMethods.makeResponse(event, dataObject, res);
                        return;
                      }
                    });
                })
            });
        }, error: function (err) {
          var res = {
            status: 'failure',
            message: 'User authentification failed: ' + err
          };
          privateMethods.makeResponse(event, dataObject, res);
        }
      });

    };

    if (window.addEventListener) {
      window.addEventListener("message", handleRequest, false);
    } else if (window.attachEvent) {
      window.attachEvent("onmessage", handleRequest);
    }
  };

  privateMethods.makeResponse = function (event, request, response) {
    var res = {
      request: request,
      response: response
    };
    event.source.postMessage(JSON.stringify(res), '*');
  };

  privateMethods.setHostSettingObject = function (_this, doc) {
    let id = doc._id;
    delete doc['_id'];
    delete doc['_rev'];
    delete doc['userID'];
    delete doc['host'];
    _this.hostSettings[id] = doc;
  };


  // Verifying methods
  verifiers.verifyOrigin = function (_this, origin, method, userID) {
    var id = origin + '|' + userID;
    const hosts = Object.keys(_this.hostSettings);
    if (hosts.indexOf(id) > -1) {
      if (_this.hostSettings[id]) {
        return Promise.resolve({
          status: _this.hostSettings[id].methods[method],
          message: 'Method allowed status: ' + _this.hostSettings[id].methods[method]
        });
      } else {
        return _this.getSettingsOfHost(origin, userID)
          .then(function (settings) {
            return {status: settings.methods[method], message: 'Method allowed status: ' + settings.methods[method]};
          })
      }
    } else {
      _this.dataStorage.insertNewHost(origin, userID);
      return Promise.resolve({status: false, message: 'Application registered, Method not allowed'});
    }
  };

  verifiers.verifyCreateObject = function (_this, object) {
    var keys = Object.keys(object);
    for (let i = 0; i < _this.keys.length; i++) {
      if (keys.indexOf(_this.keys[i]) > -1) {
        continue;
      } else {
        return false;
      }
    }
    return true;
  };

  verifiers.verifyUserToken = function (_this, params) {
    if (!params.id_token) {
      params.error('Please Specify id_token to verify');
      return;
    }
    const id_token = params.id_token;
    _this.auth0Configurator.getLock().getProfile(id_token, function (err, profile) {
      if (err) {
        params.error(err.error + ': ' + err.description);
      } else {
        params.success(profile.email, profile);
      }
    });
  };


  // Event handler methods
  eventHandlerMethods.defaultCreateHandler = function (_this, event, dataObject, userID) {
    let res = {status: 'success'};
    for (let i = 0; i < dataObject.query.dataObjects.length; i++) {
      if (!verifiers.verifyCreateObject(_this, dataObject.query.dataObjects[i])) {
        res = {
          status: 'failure',
          message: 'Object is not in given scheme!'
        };
        privateMethods.makeResponse(event, dataObject, res);
        return;
      }
      dataObject.query.dataObjects[i].userID = userID;
    }
    _this.dataStorage.insertData(dataObject.query.dataObjects)
      .then(function (res) {
        res.data = [];
        privateMethods.makeResponse(event, dataObject, res);
        console.log('Created values: ', dataObject.query);
        return;
      });
  };

  eventHandlerMethods.defaultReadHandler = function (_this, event, dataObject, userID) {
    const queryId = dataObject.query.type;
    _this.dataStorage.readData(queryId, userID)
      .then(function (res) {
        const response = {status: 'success'};
        response.dataObjects = res.dataObjects;
        if (res.dataObjects.length > 0) {
          response.message = 'Successfully fetched data!';
        } else {
          response.status = 'failure';
          response.message = 'No data found!';
        }
        privateMethods.makeResponse(event, dataObject, response);
        return;
      });
  };

  eventHandlerMethods.defaultUpdateHandler = function (_this, event, dataObject, userID) {
    const oldData = dataObject.query.oldObject;
    const newData = dataObject.query.newObject;
    const type = oldData.type;
    _this.dataStorage.updateDataObject(type, userID, oldData, newData)
      .then(function (res) {
        const response = res;
        if (res.status === 'success') {
          res.message = 'Successfully updated data object';
        }
        privateMethods.makeResponse(event, dataObject, response);
      })
  };

  eventHandlerMethods.defaultDeleteHandler = function (_this, event, dataObject, userID) {
    const queryId = dataObject.query.type;
    _this.dataStorage.deleteObjectByDataType(queryId, userID)
      .catch(function (err) {
        return {dataObjects: []};
      })
      .then(function (res) {
        const response = {
          status: 'success'
        };
        response.dataObjects = res.dataObjects;
        if (res.dataObjects.length === 0) {
          response.status = 'failure';
          response.message = 'No Data to delete';
        } else {
          response.message = 'Successfully deleted data';
        }
        privateMethods.makeResponse(event, dataObject, response);
        return;
      })
  };


  return CrossDataStorageHub;
});
