/*
 * This file is influenced by various ideas of a Shared LocalStorage of different authors.
 * The links to their articles, repositories etc. are mentioned below:
 *
 ** https://www.nczonline.net/blog/2010/09/07/learning-from-xauth-cross-domain-localstorage/
 ** https://jcubic.wordpress.com/2014/06/20/cross-domain-localstorage/
 ** https://github.com/zendesk/cross-storage
 *
 * @author: Mirco Pyrtek on 19.04.2017
 *
 */
'use strict';

(function (root) {

  const privateMethods = {};

  /**
   *
   * @param {string} origin               The origin of the WebDataCenter.
   * @param {string} appendix             The appendix identifying the location of the api within the WebDataCenter.
   * @constructor
   *
   * @property {string} origin            The origin of the WebDataCenter.
   * @property {string} appendix          The appendix identifying the location of the api within the WebDataCenter.
   * @property {object} _iframe           The iframe element pointing to the api of the WebDataCenter.
   * @property {boolean} _iframeLoading   Status of loading process of the current iframe element.
   * @property {array} _queue             The priority queue containing all requests cached while iframe is loading.
   * @property {object} _requests         The object containing all sended requests with an id mapping on the callback function.
   * @property {int} _id                  The id counter.
   *
   */
  function CrossDataStorageClient(origin, appendix = 'api') {
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

    /**
     * Init the iframe element and handler functions.
     */
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

    /**
     * Reload the iframe in order to get the newest version.
     */
    reConnect: function () {
      this._iframeLoading = true;
      this._iframe.src = this.origin + '/' + this.appendix;
    },

    /**
     * Send a create request via cross-messaging api.
     * @param {string} userToken          The user token gained by OAuth 2.0.
     * @param {object} dataObjects        The data objects zu create.
     * @param {function} callbackMethod   The callback handler after finishing the process.
     */
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

    /**
     * Send a read request via cross-messaging api.
     * @param {string} userToken          The user token gained by OAuth 2.0.
     * @param {string} requestedDataType  The type of data used to be requested.
     * @param {function} callbackMethod   The callback handler after finishing the process.
     */
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

    /**
     * Send an update request via cross-messaging api.
     * @param {string} userToken          The user token gained by OAuth 2.0.
     * @param {object} oldDataObject      The old data object that needs to be updated.
     * @param {object} newDataObject      The new data object.
     * @param {function} callbackMethod   The callback handler after finishing the process.
     */
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

    /**
     * Send a delete request via cross-messaging api.
     * @param {string} userToken          The user token gained by OAuth 2.0.
     * @param {string} dataTypeToDelete   The type of data that needs to be deleted.
     * @param {function} callbackMethod   The callback handler after finishing the process.
     */
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


  /*
  Private Methods
   */

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


  /*
  Export the module for various environments.
   */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrossDataStorageClient;
  } else if (typeof exports !== 'undefined') {
    exports.CrossDataStorageClient = CrossDataStorageClient;
  } else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return CrossDataStorageClient;
    });
  } else {
    root.CrossDataStorageClient = CrossDataStorageClient;
  }
}(this));
