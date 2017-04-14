/**
 * Created by Mirco on 24.02.2017.
 */

'use strict';

define(function (require) {

  function ContentUtil(storageHub) {
    this.boxes = [];
    this.$ = require('jquery');
    this.dataStorageHub = storageHub;
  }

  ContentUtil.prototype = {

    // Public methods
    insertMdlList: function (containerId, settings) {
      let list = '<ul class="vardemo-list-control mdl-list"> ';
      let listItems = '';
      const keys = Object.keys(settings);
      for ( let i = 0; i < keys.length; i++ ) {
        listItems += '<li class="mdl-list__item"> ' +
        '<span class="mdl-list__item-primary-content"> ' +
        '<i class="material-icons  mdl-list__item-avatar">network_check</i>' +
          keys[i] +
        '</span> ' +
        '<span class="mdl-list__item-secondary-action"> ' +
        '<label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect mdl-data-select" for="' + keys[i] + '_' + containerId + '_' + 'list-switch"> ' +
        '<input type="checkbox" id="' + keys[i] + '_' + containerId + '_' + 'list-switch" class="mdl-checkbox__input" ' + (settings[keys[i]] ? 'checked' : '') + ' /> ' +
        '</label> ' +
        '</span> ' +
        '</li> ';
      }

      list += listItems + '</ul>';
      document.getElementById(containerId).innerHTML += list;
    },

    addEventHandlerForSettingBoxes: function (userID) {
      const that = this;
      this.boxes = document.querySelectorAll('ul .mdl-data-select');
      for ( let i = 0; i < this.boxes.length; i++ ) {
        this.boxes[i].MaterialCheckbox = new MaterialCheckbox(this.boxes[i]);
        let input = this.boxes[i].querySelector('input');
        let handlerMethod = function(event) {
          const temp = that.$(this).attr('id').split('_');
          const host = temp[1];
          const method = temp[0];
          const checked = event.target.checked;
          that.dataStorageHub.setSettingsOfHost(host, userID, method, checked);
        };
        input.addEventListener('change', handlerMethod);
      }
    },

    insertSettingsContainer: function (containerId, name) {
      const container = document.querySelector('#' + containerId);
      if (!container.querySelector('section')) {
        const html = '<section class="section--center mdl-grid">' +
          '</section>';
        container.innerHTML += html;
      }
      const settingsContainer = container.querySelector('section');
      const settings = '<div class="mdl-card mdl-cell mdl-cell--4-col mdl-shadow--4dp"> ' +
        '<div class="mdl-card__title">' +
          '<h2 class="mdl-card__title-text center" style="color: dimgrey ;">' + name + '</h2>' +
        '</div>' +
        '<hr>' +
        '<div class="mdl-card__supporting-text"> ' +
        '<div id="' + name + '">' +
        '</div> ' +
        '</div> ' +
        '</div>';

      settingsContainer.innerHTML += settings;
      return name;
    },

    createIcon : function (host) {
      const container = document.querySelector('#apps');
      if (!container.querySelector('section')) {
        const html = '<section class="section--center mdl-grid">' +
          '</section>';
        container.innerHTML += html;
      }
      const section = container.querySelector('section');
      const icon = '<div class="mdl-card mdl-cell mdl-cell--3-col mdl-shadow--4dp">' +
        '<div class="mdl-card__title">' +
          '<h3 class="mdl-card__title-text center" style="color: dimgrey ; width: inherit;">' + host + '</h3>' +
        '</div>' +
        '<div class="mdl-card__supporting-text wraptocenter"> ' +
        '<img src="' + host + '/icon.png" alt="' + host +'" onerror="javascript:this.src=\'icon.png\'" style="width:100%;">' +
        '</div>' +
        '<div class="mdl-card__actions mdl-shadow--2dp" style="margin-top: 10px"> ' +
          '<a target="_blank" href="' + host + '" class="mdl-button"><i class="material-icons">send</i> Start app</a> ' +
        '</div>' +
        '</div>';
      section.innerHTML += icon;
    }
  };

  return ContentUtil;
});
