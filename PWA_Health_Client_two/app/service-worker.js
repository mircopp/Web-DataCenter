// This file is intentionally without code.
// It's present so that service worker registration will work when serving from the 'app' directory.
// The version of service-worker.js that's present in the 'dist' directory is automatically
// generated by the 'generate-service-worker' gulp task, and contains code to precache resources.

'use strict';

var cacheName = 'PWA_Data_center_cache';
var systemDependantFiles = [
  '/',
  '/manifest.json',
  '/index.html',
  '/scripts/main.js',
  '/scripts/jquery-3.1.1.js',
  '/styles/main.css',
  '/images/hamburger.svg',
  '/images/touch/apple-touch-icon.png',
  '/images/touch/chrome-touch-icon-192x192.png',
  '/images/touch/icon-128x128.png',
  '/images/touch/ms-touch-icon-144x144-precomposed.png',
  '/scripts/sw/runtime-caching.js',
  '/images/basic3-120_shoes_foot_step_footsteps-512.png',
  '/images/pulse-512.png',
  '/scripts/crossdomainstorage.js',
  '/scripts/callbackmethods.js'


];

var testFiles = [
];

var filesToCache = systemDependantFiles.concat(testFiles);

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});