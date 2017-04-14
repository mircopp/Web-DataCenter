/*
 * Copyright 2010 Nicholas C. Zakas. All rights reserved.
 * BSD Licensed.
 */
'use strict';

;(function (root) {

  const privateMethods = {};

  function CrossDataStorageClient(origin, appendix='api') {
    this.origin = origin;
    this.appendix = appendix;
    this._iframe = null;
    this._iframeLoading = true;
    this._queue = [];
    this._requests = {};
    this._id = 0;
    this.init();
  }

  CrossDataStorageClient.prototype = {

    //restore constructor
    constructor: CrossDataStorageClient,

    // Public methods

    init: function () {
      const _this = this;
      if (!this._iframe) {
        if (window.postMessage && window.JSON) {
          this._iframe = document.createElement("iframe");
          this._iframe.style.cssText = "display : none;";
          this._iframe.id = 'iframe_' + this.origin.split('//')[1];
          document.body.appendChild(this._iframe);
          if (window.addEventListener) {
            window.addEventListener("message", function (event) {
              privateMethods._handleMessage(_this, event);
            }, false);
          } else if (this._iframe.attachEvent) {
            window.attachEvent("onmessage", function (event) {
              privateMethods._handleMessage(_this, event);
            });
          }
        } else {
          throw new Error("Unsupported browser.");
        }
      }
      this._iframe.src = this.origin + '/' + this.appendix;
    },

    reConnect: function () {
      this._iframeLoading = true;
      this._iframe.src = this.origin + '/' + this.appendix;
    },

    sendCreateRequest: function (userToken, dataObjects, callbackMethod) {
      const queryObject = {
        dataObjects: dataObjects
      };
      const requestJSON = {
        method: 'create',
        id_token: userToken,
        query: queryObject
      };
      privateMethods._handleRequest(this, requestJSON, callbackMethod);
    },

    sendReadRequest: function (userToken, requestedDataType, callbackMethod) {
      const queryObject = {
        type: requestedDataType
      };
      const requestJSON = {
        method: 'read',
        id_token: userToken,
        query: queryObject
      };
      privateMethods._handleRequest(this, requestJSON, callbackMethod);
    },

    sendUpdateRequest: function (userToken, oldDataObject, newDataObject, callbackMethod) {
      const queryObject = {
        oldObject: oldDataObject,
        newObject: newDataObject
      };
      const requestJSON = {
        method: 'update',
        id_token: userToken,
        query: queryObject
      };
      privateMethods._handleRequest(this, requestJSON, callbackMethod);
    },

    sendDeleteRequest: function (userToken, dataTypeToDelete, callbackMethod) {
      const queryObject = {
        type: dataTypeToDelete
      };
      const requestJSON = {
        method: 'delete',
        id_token: userToken,
        query: queryObject
      };
      privateMethods._handleRequest(this, requestJSON, callbackMethod);
    },

  };


// Private Methods
  privateMethods._handleRequest = function (_this, json, callback) {
    _this.reConnect();
    const request = {
      id: ++_this._id
    };
    const keys = Object.keys(json);
    for (let i = 0; i < keys.length; i++) {
      request[keys[i]] = json[keys[i]];
    }
    const data = {
      request: request,
      callback: callback
    };

    if (_this._iframeLoading) {
      _this._queue.push(data);
    } else {
      privateMethods._sendRequest(_this, data);
    }

    if (!_this._iframe) {
      _this.init();
    }
  };

  privateMethods._sendRequest = function (_this, data) {
    _this._requests[data.request.id] = data;
    _this._iframe.contentWindow.postMessage(JSON.stringify(data.request), '*');
  };

  privateMethods._iframeLoaded = function (_this) {
    _this._iframeLoading = false;
    if (_this._queue.length) {
      for (let i = 0; i < _this._queue.length; i++) {
        privateMethods._sendRequest(_this, _this._queue[i]);
      }
      _this._queue = [];
    }
  };

  privateMethods._handleMessage = function (_this, event) {
    if (event.origin == _this.origin) {
      const data = JSON.parse(event.data);
      if (data.request && data.response) {
        _this._requests[data.request.id].callback(data.request, data.response);
        delete _this._requests[data.request.id];
      } else if (data.message) {
        if (data.message === 'loaded') {
          privateMethods._iframeLoaded(_this);
        }
      }
    }
  };

  /**
   * Export environments.
   */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrossDataStorageClient;
  } else if (typeof exports !== 'undefined') {
    exports.CrossDataStorageClient = CrossDataStorageClient;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return CrossDataStorageClient;
    });
  } else {
    root.CrossDataStorageClient = CrossDataStorageClient;
  }
}(this));
