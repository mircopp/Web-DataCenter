/**
 * Created by Mirco on 28.02.2017.
 */
'use strict';

define(function (require) {

  const PouchDB = require('pouchdb');

  function DatabaseRequestHandler() {
    this.userDB = new PouchDB('known_users');
    this.settingsDB = new PouchDB('settings');
    this.personalData = new PouchDB('data');
  }

  DatabaseRequestHandler.prototype = {

    getKnownHosts : function () {
      return this.settingsDB.allDocs();
    },
    extractKnownHosts : function (documents) {
      const res = [];
      for ( let i = 0; i < documents.rows.length; i++ ) {
        res.push(documents.rows[i].id);
      }
      return res;
    },
    getSettingsOfHost : function (hostName) {
      return this.settingsDB.get(hostName);
    },
    insertNewHost : function (hostName) {
      return this.settingsDB.put({
        _id : hostName,
        methods : {
          create : false,
          read : false,
          update: false,
          delete: false
        }
      });
    },
    setMethodOfHost: function (host, method, setting) {
      var db = this.settingsDB;
      return db.get(host)
        .then(function (doc) {
          doc.methods[method] = setting;
          return db.put(doc);
      });
    },

    readData: function (dataType, userId='test@test.com') {
      // TODO refinement and user identification
      return this.personalData.get(dataType);
    },

    insertData :  function (dataObjects) {
      var that = this;
      if (dataObjects.length > 0 ) {
        return that.readData(dataObjects[0].type)
          .catch(function (err) {
            return {data: []};
          })
          .then(function (doc) {
            var response = {'status': 'success', 'message': null, 'error' : null, doc: doc, duplicates: [], insertedValues : [], type : null};
            if ( dataObjects.length > 0 ) {
              var type = dataObjects[0].type;
              for ( let i = 0; i < dataObjects.length; i++ ) {
                if ( dataObjects[i].type !== type ) {
                  response.status = 'failure';
                  response.error = response.message = 'Please only send data of same type';
                  return Promise.resolve(response);
                }
              }
            } else {
              response.status = 'success';
              response.message = 'No update needed';
              return Promise.resolve(response);
            }
            response.type = dataObjects[0].type;
            for ( let i = 0; i < dataObjects.length; i++ ) {
              if (contains(doc.data, dataObjects[i])) {
                console.log('contains');
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
                var type = res.type;
                for (let i = 0; i < dataObjects.length; i++) {
                  res.doc.data.push(dataObjects[i]);
                }
                res.doc._id = type;
                that.personalData.put(res.doc);
                res.message = 'Successfully inserted';
              }
            }
            console.log(res.doc);
            return Promise.resolve(res);
          });
      }
    }
  };

  const contains = function (collection, object) {
    for ( let i = 0; i < collection.length; i++ ) {
      var dataPoint = collection[i];
      if ( compare(dataPoint, object) ) {
        return true;
      }
    }
    return false;
  };

  const compare = function (data1, data2) {
    var keys1 = Object.keys(data1);
    var keys2 = Object.keys(data2);
    if ( !compareSchemes(keys1, keys2) ) {
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
  const compareSchemes = function (scheme1, scheme2) {
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

  return DatabaseRequestHandler;
});
