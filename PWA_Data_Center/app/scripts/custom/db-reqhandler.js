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

    // working with settings database

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

    // inserting data
    readData: function (dataType, userId) {
      // TODO refinement and user identification
      return this.personalData.get(dataType);
    }
  };

  return DatabaseRequestHandler;
});
