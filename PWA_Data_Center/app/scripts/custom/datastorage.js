/**
 * Created by Mirco on 28.02.2017.
 */
'use strict';

define(function (require) {

  const PouchDB = require('pouchdb');

  const privateMethods = {};

  function DataStorage() {
    this.userDB = new PouchDB('UserDB');
    this.settingsDB = new PouchDB('SettingsDB');
    this.personalData = new PouchDB('DataDB');
  }

  DataStorage.prototype = {

    // Public Methods

    getUserProfile : function (userID) {
      return this.userDB.get(userID)
        .catch(function (err) {
          return null;
        })
    },

    setUserProfile : function (userID, profile) {
      profile._id = userID;
      return this.userDB.put(profile);
    },

    getKnownHosts : function () {
      return this.settingsDB.allDocs();
    },

    extractKnownHosts : function (documents, userID) {
      const res = [];
      for ( let i = 0; i < documents.rows.length; i++ ) {
        var current = documents.rows[i].id.split('|');
        if (userID){
          if (current[1] && (current[1] === userID)) {
            res.push(current[0]);
          }
        } else {
          res.push(current[0]);
        }
      }
      return res;
    },

    getSettingsOfHost : function (hostName, userID) {
      return this.settingsDB.get(hostName + '|' + userID);
    },

    insertNewHost : function (hostName, userID) {
      return this.settingsDB.put({
        _id : hostName + '|' + userID,
        host: hostName,
        userID : userID,
        methods : {
          create : false,
          read : false,
          update: false,
          delete: false
        }
      });
    },

    setMethodOfHost: function (host, userID, method, setting) {
      var db = this.settingsDB;
      return db.get(host + '|' + userID)
        .catch(function (err) {
          return {
            _id : hostName + '|' + userID,
            host: hostName,
            userID : userID,
            methods : {
              create : false,
              read : false,
              update: false,
              delete: false
            }
          }
        })
        .then(function (doc) {
          doc.methods[method] = setting;
          return db.put(doc);
      });
    },

    readData: function (dataType, userId) {
      return this.personalData.get(dataType + '|' + userId)
        .catch(function (err) {
          return {
            _id : dataType + '|' + userId,
            dataObjects : []
          }
        });
    },

    deleteObjectByDataType : function (dataType, userID) {
      var response;
      var that = this;
      return this.readData(dataType, userID)
        .then(function (doc) {
          response = doc;
          var id = dataType + '|' + userID;
          if ( doc.dataObjects.length > 0 ) {
            that.personalData.remove(doc);
          }
          return response;
        });
    },

    insertData :  function (dataObjects) {
      var that = this;
      if (dataObjects.length > 0 ) {
        var id = dataObjects[0].type + '|' + dataObjects[0].userID;
        var dataType = dataObjects[0].type;
        var userID = dataObjects[0].userID;
        return that.readData(dataType, userID)
          .then(function (doc) {
            var response = {'status': 'success', 'message': null, 'error' : null, doc: doc, duplicates: [], insertedValues : [], type : null};
            if ( dataObjects.length > 0 ) {
              var type = dataObjects[0].type;
              var userID = dataObjects[0].userID;
              for ( let i = 0; i < dataObjects.length; i++ ) {
                if ( dataObjects[i].type !== type || dataObjects[i].userID !== userID ) {
                  response.status = 'failure';
                  response.error = response.message = 'Please only send data of same user and type';
                  return Promise.resolve(response);
                }
              }
            } else {
              response.status = 'success';
              response.message = 'No update needed';
              return Promise.resolve(response);
            }
            response._id = id;
            for ( let i = 0; i < dataObjects.length; i++ ) {
              if (privateMethods.contains(doc.dataObjects, dataObjects[i])) {
                response.duplicates.push(dataObjects.splice(i,1));
                --i;
              } else {
               continue;
              }
            }
            response.insertedValues = dataObjects;
            if ( dataObjects.length > 0 ) {
              response.status = 'success';
              response.message = 'Ready to insert';
              return Promise.resolve(response);
            } else {
              response.status = 'success';
              response.message = 'No update needed';
              return Promise.resolve(response);
            }
          })
          .then(function (res) {
            if (res.status === 'success') {
              if (res.message === 'Ready to insert') {
                var id = res._id;
                for (let i = 0; i < dataObjects.length; i++) {
                  res.doc.dataObjects.push(dataObjects[i]);
                }
                res.doc._id = id;
                that.personalData.put(res.doc);
                res.message = 'Successfully inserted';
              }
            }
            return Promise.resolve(res);
          });
      }
    },

    updateDataObject : function (dataType, userID, oldData, newData) {
      var id = dataType + '|' + userID;
      var response = {};
      var that = this;
      return this.personalData.get(id)
        .then(function (doc) {
          var dataObjects = doc.dataObjects;
          for ( var i = 0; i < dataObjects.length; i++ ) {
            if (privateMethods.compare(dataObjects[i], oldData)) {
              doc.dataObjects[i] = newData;
              that.personalData.put(doc);
              response.status = 'success';
              return Promise.resolve(response)
            }
          }
          response.status = 'failure';
          response.message = 'Object not existing';
          return Promise.resolve(response);
        })
    }
  };

  // Private Methods

  privateMethods.contains = function (collection, object) {
    for ( let i = 0; i < collection.length; i++ ) {
      var dataPoint = collection[i];
      if ( privateMethods.compare(dataPoint, object) ) {
        return true;
      }
    }
    return false;
  };

  privateMethods.compare = function (data1, data2) {
    var keys1 = Object.keys(data1);
    var keys2 = Object.keys(data2);
    if ( !privateMethods.compareSchemes(keys1, keys2) ) {
      return false;
    }
    for ( let i = 0; i < keys1.length; i++ ) {
      if ( typeof data1[keys1[i]] == 'object' ) {
        continue;
      }
      if ( data1[keys1[i]] !== data2[keys1[i]] ) {
        return false;
      } else {
        continue;
      }
    }
    return true;
  };

  privateMethods.compareSchemes = function (scheme1, scheme2) {
    if ( scheme1.length !== scheme2.length ) {
      return false;
    }
    for ( let i = 0; i < scheme1.length; i++ ) {
      let temp = scheme1[i];
      if ( !(scheme2.indexOf(temp) > -1) ) {
        return false;
      } else {
        continue;
      }
    }
    return true;
  };

  return DataStorage;
});
