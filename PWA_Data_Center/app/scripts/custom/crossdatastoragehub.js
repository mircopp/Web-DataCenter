/**
 * Created by Mirco on 28.02.2017.
 *
 * This js file is the main part of this project, handling all incoming datarequests of all registered web applications
 */
'use strict';

define(function (require) {

  const DataStorage = require('datastorage');
  const auth0Configurator = require('auth0configurator');

  const privateMethods = {};
  const eventHandlerMethods = {};
  const verifiers = {};

  // Constructor
  function CrossDataStorageHub() {
    this.origin = location.href;
    this.dataStorage = new DataStorage();
    this.auth0Configurator = auth0Configurator;
    this.hostSettings = {};
    this.keys = [];
  }

  // public methods
  CrossDataStorageHub.prototype.connect = function (keys = ['userID', 'type', 'unit', 'timestamp', 'applicationID', 'values']) {
    this.keys = keys;
    this.setCreateHandler();
    this.setReadHandler();
    this.setUpdateHandler();
    this.setDeleteHandler();
    privateMethods.initializePostApi(this);
  };

  // Getter methods
  CrossDataStorageHub.prototype.getKnownHosts = function (userID) {
    const _that = this;
    return this.dataStorage.getKnownHosts()
      .then(function (docs) {
        return _that.dataStorage.extractKnownHosts(docs, userID);
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
      const _that = this;
      return this.dataStorage.getSettingsOfHost(host, userID)
        .then(function (doc) {
          privateMethods.setHostSettingObject(_that, doc);
          const keys = Object.keys(_that.hostSettings[id]);
          for (let i = 0; i < keys.length; i++) {
            res[keys[i]] = _that.hostSettings[id][keys[i]];
          }
          return Promise.resolve(res);
        });
    }
  };


  // Setter methods
  CrossDataStorageHub.prototype.setKnownHosts = function (userID) {
    const _that = this;
    return this.getKnownHosts(userID)
      .then(function (res) {
        var promises = [];
        for (let i = 0; i < res.length; i++) {
          promises.push(_that.getSettingsOfHost(res[i], userID));
        }
        return Promise.all(promises);
      });
  };

  CrossDataStorageHub.prototype.setSettingsOfHost = function (host, userID, method, checked) {
    var _that = this;
    return this.dataStorage.setMethodOfHost(host, userID, method, checked)
      .then(function () {
        _that.getSettingsOfHost(host, userID);
      });
  };

  CrossDataStorageHub.prototype.setProfile = function (userID, profile) {
    var _that = this;
    return this.dataStorage.getUserProfile(userID)
      .then(function (res) {
        if (!res) {
          return _that.dataStorage.setUserProfile(userID, profile);
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
  privateMethods.initializePostApi = function (_that) {
    const handleRequest = function (event) {
      const dataObject = JSON.parse(event.data);
      const user_token = dataObject.id_token;
      verifiers.verifyUserToken(_that, {
        id_token: user_token, success: function (userID, profile) {
          _that.setProfile(userID, profile)
            .then(function (profile) {
              _that.setKnownHosts(userID)
                .then(function () {
                  verifiers.verifyOrigin(_that, event.origin, dataObject.method, userID)
                    .then(function (response) {
                      const originVerification = response;
                      if (originVerification.status) {
                        switch (dataObject.method) {
                          case 'create':
                            _that.createHandler(_that, event, dataObject, userID);
                            break;
                          case 'read':
                            _that.readHandler(_that, event, dataObject, userID);
                            break;
                          case 'update':
                            _that.updateHandler(_that, event, dataObject, userID);
                            break;
                          case 'delete':
                            _that.deleteHandler(_that, event, dataObject, userID);
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

  privateMethods.setHostSettingObject = function (_that, doc) {
    let id = doc._id;
    delete doc['_id'];
    delete doc['_rev'];
    delete doc['userID'];
    delete doc['host'];
    _that.hostSettings[id] = doc;
  };


  // Verifying methods
  verifiers.verifyOrigin = function (_that, origin, method, userID) {
    var id = origin + '|' + userID;
    const hosts = Object.keys(_that.hostSettings);
    if (hosts.indexOf(id) > -1) {
      if (_that.hostSettings[id]) {
        return Promise.resolve({
          status: _that.hostSettings[id].methods[method],
          message: 'Method allowed status: ' + _that.hostSettings[id].methods[method]
        });
      } else {
        return _that.getSettingsOfHost(origin, userID)
          .then(function (settings) {
            return {status: settings.methods[method], message: 'Method allowed status: ' + settings.methods[method]};
          })
      }
    } else {
      _that.dataStorage.insertNewHost(origin, userID);
      return Promise.resolve({status: false, message: 'Application registered, Method not allowed'});
    }
  };

  verifiers.verifyCreateObject = function (_that, object) {

    var keys = Object.keys(object);
    for (let i = 0; i < _that.keys; i++) {
      if (keys.indexOf(_that.keys[i]) > -1) {
        continue;
      } else {
        return false;
      }
    }
    return true;
  };

  verifiers.verifyUserToken = function (_that, params) {
    if (!params.id_token) {
      params.error('Please Specify id_token to verify');
      return;
    }
    const id_token = params.id_token;
    _that.auth0Configurator.lock.getProfile(id_token, function (err, profile) {
      if (err) {
        params.error(err.error + ': ' + err.description);
      } else {
        params.success(profile.email, profile);
      }
    });
  };


  // Event handler methods
  eventHandlerMethods.defaultCreateHandler = function (_that, event, dataObject, userID) {
    let res = {status: 'success'};
    for (let i = 0; i < dataObject.query.dataObjects.length; i++) {
      if (!verifiers.verifyCreateObject(_that, dataObject.query.dataObjects[i])) {
        res = {
          status: 'failure',
          message: 'Object is not in given scheme!'
        };
        privateMethods.makeResponse(event, dataObject, res);
        return;
      }
      dataObject.query.dataObjects[i].userID = userID;
    }
    _that.dataStorage.insertData(dataObject.query.dataObjects)
      .then(function (res) {
        res.data = [];
        privateMethods.makeResponse(event, dataObject, res);
        console.log('Created values: ', dataObject.query);
        return;
      });
  };

  eventHandlerMethods.defaultReadHandler = function (_that, event, dataObject, userID) {
    const queryId = dataObject.query.type;
    _that.dataStorage.readData(queryId, userID)
      .catch(function (err) {
        return {data: []};
      })
      .then(function (res) {
        const response = {status: 'success'};
        response.data = res.data;
        if (res.data.length > 0) {
          response.message = 'Successfully fetched data!';
        } else {
          response.status = 'failure';
          response.message = 'No data found!';
        }
        privateMethods.makeResponse(event, dataObject, response);
        return;
      });
  };

  eventHandlerMethods.defaultUpdateHandler = function (_that, event, dataObject, userID) {
    const oldData = dataObject.query.oldObject;
    const newData = dataObject.query.newObject;
    const type = oldData.type;
    _that.dataStorage.updateDataObject(type, userID, oldData, newData)
      .then(function (res) {
        const response = res;
        if (res.status === 'success') {
          res.message = 'Successfully updated data object';
        }
        privateMethods.makeResponse(event, dataObject, response);
      })
  };

  eventHandlerMethods.defaultDeleteHandler = function (_that, event, dataObject, userID) {
    const queryId = dataObject.query.type;
    _that.dataStorage.deleteObjectByDataType(queryId, userID)
      .catch(function (err) {
        return {data: []};
      })
      .then(function (res) {
        const response = {
          status: 'success'
        };
        response.data = res.data;
        if (res.data.length === 0) {
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
