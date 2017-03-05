/*
 * Copyright 2010 Nicholas C. Zakas. All rights reserved.
 * BSD Licensed.
 */
function CrossDomainStorage(origin){
    this.origin = origin;
    this._iframe = null;
    this._iframeReady = false;
    this._queue = [];
    this._requests = {};
    this._id = 0;
    this._callbackMethodHandler = callbackhandler;
    this._callbackMethodHandler.init('snackbar');
}

CrossDomainStorage.prototype = {

    //restore constructor
    constructor: CrossDomainStorage,

    //public interface methods

    init: function(){
      var that = this;
        if (!this._iframe){
            if (window.postMessage && window.JSON){
                this._iframe = document.createElement("iframe");
                this._iframe.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;";
                document.body.appendChild(this._iframe);

                if (window.addEventListener) {
                  this._iframe.addEventListener("load", function () {
                    that._iframeLoaded();
                  }, true);
                  window.addEventListener("message", function(event) {
                    that._handleMessage(event);
                  }, false);
                }
            } else {
                throw new Error("Unsupported browser.");
            }
        }

        this._iframe.src = this.origin;
        return this._iframe;

    },

    requestValue: function(json, callback){
      var request = {
        id: ++this._id
      };
      var keys = Object.keys(json);
      for ( var i = 0; i < keys.length; i++) {
        request[keys[i]] = json[keys[i]];
      }
      var data = {
        request: request,
        callback: callback
      };

      if (this._iframeReady){
          this._sendRequest(data);
      } else {
          this._queue.push(data);
      }

      if (!this._iframe){
          this.init();
      }
    },

    //private methods
    _sendRequest: function(data){
        this._requests[data.request.id] = data;
        this._iframe.contentWindow.postMessage(JSON.stringify(data.request), '*');
    },

    _iframeLoaded: function(){
        this._iframeReady = true;
        if (this._queue.length){
            for (var i=0, len=this._queue.length; i < len; i++){
                this._sendRequest(this._queue[i]);
            }
            this._queue = [];
        }
    },

    _handleMessage: function(event){
        if (event.origin == this.origin){
          var data = JSON.parse(event.data);
          switch ( data.request.method ) {
            case 'create':
              this._callbackMethodHandler.createCallback(data.request, data.response);
                  break;
            case 'read':
              console.log('Read value: ', dataObject.query);
              // TODO work with read response
                  break;
            case 'update':
              console.log('Updated value: ', dataObject.query);
              //TODO handle update response
                  break;
            case 'delete':
              console.log('Deleted value: ', dataObject.query);
              // TODO handle delete respone
                  break;
            default:
              break;
          }
        }
    }

};
