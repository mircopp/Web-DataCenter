/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  // var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
  //     // [::1] is the IPv6 localhost address.
  //     window.location.hostname === '[::1]' ||
  //     // 127.0.0.1/8 is considered localhost for IPv4.
  //     window.location.hostname.match(
  //       /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  //     )
  //   );
  //
  // if ('serviceWorker' in navigator &&
  //     (window.location.protocol === 'https:' || isLocalhost)) {
  //   navigator.serviceWorker.register('service-worker.js')
  //   .then(function(registration) {
  //     // updatefound is fired if service-worker.js changes.
  //     registration.onupdatefound = function() {
  //       // updatefound is also fired the very first time the SW is installed,
  //       // and there's no need to prompt for a reload at that point.
  //       // So check here to see if the page is already controlled,
  //       // i.e. whether there's an existing service worker.
  //       if (navigator.serviceWorker.controller) {
  //         // The updatefound event implies that registration.installing is set:
  //         // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
  //         var installingWorker = registration.installing;
  //
  //         installingWorker.onstatechange = function() {
  //           switch (installingWorker.state) {
  //             case 'installed':
  //               // At this point, the old content will have been purged and the
  //               // fresh content will have been added to the cache.
  //               // It's the perfect time to display a "New content is
  //               // available; please refresh." message in the page's interface.
  //               break;
  //
  //             case 'redundant':
  //               throw new Error('The installing ' +
  //                               'service worker became redundant.');
  //
  //             default:
  //               // Ignore
  //           }
  //         };
  //       }
  //     };
  //   }).catch(function(e) {
  //     console.error('Error during service worker registration:', e);
  //   });
  // }

  // Your custom JavaScript goes here
  var domainManager = new CrossDomainStorage('https://localhost:3000');
  domainManager.init();
  callbackhandler.init('snackbar');
  console.log('initialized');

  document.getElementById('push').onclick = function () {
    domainManager.init();
    domainManager.requestValue({method:'create', query: [{"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-13 13:32:37", "deviceID": "123456789abc", "values": {"val": 72}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-14 13:32:37", "deviceID": "123456789abc", "values": {"val": 88}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-15 13:32:37", "deviceID": "123456789abc", "values": {"val": 112}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-16 13:32:37", "deviceID": "123456789abc", "values": {"val": 63}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-17 13:32:37", "deviceID": "123456789abc", "values": {"val": 88}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-18 13:32:37", "deviceID": "123456789abc", "values": {"val": 111}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-19 13:32:37", "deviceID": "123456789abc", "values": {"val": 71}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-20 13:32:37", "deviceID": "123456789abc", "values": {"val": 67}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-21 13:32:37", "deviceID": "123456789abc", "values": {"val": 113}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-22 13:32:37", "deviceID": "123456789abc", "values": {"val": 103}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-23 13:32:37", "deviceID": "123456789abc", "values": {"val": 60}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-24 13:32:37", "deviceID": "123456789abc", "values": {"val": 102}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-25 13:32:37", "deviceID": "123456789abc", "values": {"val": 104}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-26 13:32:37", "deviceID": "123456789abc", "values": {"val": 144}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-27 13:32:37", "deviceID": "123456789abc", "values": {"val": 135}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-02-28 13:32:37", "deviceID": "123456789abc", "values": {"val": 81}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-03-01 13:32:37", "deviceID": "123456789abc", "values": {"val": 81}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-03-02 13:32:37", "deviceID": "123456789abc", "values": {"val": 136}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-03-03 13:32:37", "deviceID": "123456789abc", "values": {"val": 119}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-03-04 13:32:37", "deviceID": "123456789abc", "values": {"val": 66}}, {"type": "Heartrate", "unit": "bpm", "timestamp": "2017-03-05 13:32:37", "deviceID": "123456789abc", "values": {"val": 103}}]}, callbackhandler.createCallback);
  }
})();
