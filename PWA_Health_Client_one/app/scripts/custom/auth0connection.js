/**
 * Created by Mirco on 30.03.2017.
 */

'use strict';

(function (root) {

  function Auth0Configurator(clientID, domain, config = {auth: {params: {scope: 'openid email'}}, closable: false}) {
    this.lock = new Auth0Lock(clientID, domain, config);
  }

  const privateFunctions = {};

  // Public functions
  Auth0Configurator.prototype.connect = function (profileButton, logoutButton, username, callbackFunction) {
    this.profileButton = profileButton;
    this.logoutButton = logoutButton;
    this.username = username;
    this.callback = callbackFunction;

    const _this = this;
    this.lock.on('authenticated', function (authResult) {
      localStorage.setItem('id_token', authResult.idToken);
      // redirect
      privateFunctions.on_logged_in(_this);
    });

    $('#' + this.logoutButton).click(function (e) {
      e.preventDefault();
      privateFunctions.logout();
    });

    if (!localStorage.getItem('id_token') && !localStorage.getItem('profile')) {
      $('main').hide();
      $('#' + this.profileButton).hide();
      this.lock.show();
    } else {
      privateFunctions.on_logged_in(this);
    }
  };

  Auth0Configurator.prototype.getLock = function () {
    return this.lock;
  };

  // Private Functions
  privateFunctions.on_logged_in = function (_this) {
    document.getElementById(_this.profileButton).setAttribute('style', 'display: block');
    privateFunctions.retrieve_profile(_this);
    $('main').show();
    _this.lock.hide();
  };

  privateFunctions.retrieve_profile = function (_this) {
    const id_token = localStorage.getItem('id_token');
    if (id_token) {
      _this.lock.getProfile(id_token, function (err, profile) {
        if (err) {
          alert('Error while retrieving profile information');
          privateFunctions.logout();
        } else {
          localStorage.setItem('profile', JSON.stringify(profile));
          // Display user information
          privateFunctions.show_profile_info(_this, profile);
          _this.callback();
        }
      });
    } else {
      privateFunctions.logout();
    }
  };

  privateFunctions.logout = function () {
    if (!localStorage.getItem('id_token')) {
      window.location.href = '/';
    } else {
      localStorage.removeItem('id_token');
      localStorage.removeItem('profile');
      window.location.href = '/';
    }
  };

  privateFunctions.show_profile_info = function (_this, profile) {
    document.getElementById(_this.username).innerHTML = profile.email;
    $('.avatar').attr('src', profile.picture).show();
  };

  /*
  Export the module for various environments.
   */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth0Configurator;
  } else if (typeof exports !== 'undefined') {
    exports.Auth0Configurator = Auth0Configurator;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return Auth0Configurator;
    });
  } else {
    root.Auth0Configurator = Auth0Configurator;
  }
}(this));
