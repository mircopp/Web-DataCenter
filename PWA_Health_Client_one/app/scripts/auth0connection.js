/**
 * Created by Mirco on 30.03.2017.
 */

'use strict';

var auth0Connector = {
  lock : new Auth0Lock('BjG2eeVb5DiafM9I8Jf5GPpBTKxE4MXY', 'mircopp.eu.auth0.com', {auth: {params: {scope: 'openid email'}}, closable: false})
};

auth0Connector.lock.on('authenticated', function(authResult) {
  localStorage.setItem('id_token', authResult.idToken);
  // redirect
  window.location.href = '/';
});

auth0Connector.setInitialState = function (callback) {
  if(!localStorage.getItem('id_token')&&!localStorage.getItem('profile')){
    $('main').hide();
    $('#profile-button').hide();
    auth0Connector.lock.show();
  }
  else{
    on_logged_in(callback);
  }
};

$('#btn-logout').click(function(e) {
  e.preventDefault();
  logout();
});

var on_logged_in = function (callback) {
  document.getElementById('profile-button').setAttribute('style', 'display: block');
  retrieve_profile(callback);
  auth0Connector.lock.hide();
};

//retrieve the profile:
var retrieve_profile = function(callback) {
  var id_token = localStorage.getItem('id_token');
  if (id_token) {
    auth0Connector.lock.getProfile(id_token, function (err, profile) {
      if (err) {
        alert('Error while retrieving profile information');
        logout();
      } else {
        localStorage.setItem('profile', JSON.stringify(profile));
        // Display user information
        show_profile_info(profile);
        callback();
      }
    });
  } else {
    logout();
  }
};

var logout = function() {
  if (!localStorage.getItem('id_token')) {
    window.location.href = '/';
  } else {
    localStorage.removeItem('id_token');
    localStorage.removeItem('profile');
    window.location.href = '/';
  }
};

  var show_profile_info = function(profile){
  document.getElementById('username').innerHTML = profile.email;
  $('.avatar').attr('src', profile.picture).show();
};
