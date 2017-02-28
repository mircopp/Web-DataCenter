/**
 * Created by Mirco on 28.02.2017.
 */

define(function (require) {

  const PouchDB = require('pouchdb');
  const Util = require('Util');

  function StorageHub() {
    this.userDB = new PouchDB('known_users');
    this.settingsDB = new PouchDB('settings');
    this.personalData = new PouchDB('data');
    this.utils = new Util();
  }

  StorageHub.prototype = {
    getKnownHosts : function () {
      return this.settingsDB.allDocs();
    },
    handlePromiseKnownHosts : function (documents) {
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
    }
  };

  return StorageHub;
});
