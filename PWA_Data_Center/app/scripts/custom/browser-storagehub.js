/**
 * Created by Mirco on 28.02.2017.
 */

define(function (require) {

  const RequestHandler = require('DatabaseRequestHandler');

  const browserDataCenter = {};


  /**
   * see https://www.nczonline.net/blog/2010/09/07/learning-from-xauth-cross-domain-localstorage/
   * @param event
   */
  const verifyOrigin = function (origin, method, centerObject) {
     if ( centerObject.knownHosts.indexOf(origin) > -1 ) {
        allowedMethods = centerObject.hostSettings[origin].methods;
        if ( centerObject.hostSettings[method] ) {
            return true;
        } else {
          return false;
        }
     } else {
       centerObject.dbApi.insertNewHost(origin).then(function () {
         // TODO bug with doubled initialization of request handler!
         centerObject.init();
         return false;
       })
     }
  };



  const initializePostApi = function (centerObject) {
      const handleRequest = function (event) {
        const dataObject = JSON.parse(event.data);
        if (verifyOrigin(event.origin, dataObject.method, centerObject)) {
          switch (dataObject.method) {
            case 'create':
              //TODO insert value into local database
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
  browserDataCenter.init = function () {
    browserDataCenter.dbApi = new RequestHandler();
    browserDataCenter.knownHosts = [];
    browserDataCenter.hostSettings = {};

    return browserDataCenter.dbApi.getKnownHosts()
      .then(function (docs) {
        browserDataCenter.knownHosts = browserDataCenter.knownHosts.concat(browserDataCenter.dbApi.handlePromiseKnownHosts(docs));
      }).then(function () {
        for ( let i = 0; i < browserDataCenter.knownHosts.length; i++) {
          browserDataCenter.dbApi.getSettingsOfHost(browserDataCenter.knownHosts[i]).then(function (doc) {
            let id = doc._id;
            delete doc['_id'];
            delete doc['_rev'];
            browserDataCenter.hostSettings[id] = doc;
          });
        }
      }).then(function () {
        initializePostApi(browserDataCenter);
      });
  };

  return browserDataCenter;
});
