importScripts(
  'js/idb.min.js',
  'js/idb-helper.js',
  'js/dbhelper.js'
);

const staticCacheName = 'mws-restaurant-cache-v1';
let filesToCache = [
  '/',
  'css/styles.css',
  'css/styles.min.css',
  'index.html',
  'restaurant.html',
  'js/dbhelper.js',
  'js/idb-helper.js',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant-info.js'
];

for (let i = 1; i <= 10; ++i) {
  filesToCache.push(`img/${i}.jpg`);
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
      })
      .catch((error) => {
        console.error('Failed to cache', error);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          return caches.open(staticCacheName).then(cache => {
            cache.put(event.request.url, response.clone());
            return response;
          });
        });

      }).catch(err => {
      console.error("Error fetching ", err);
      return err;
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [staticCacheName];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'initialSync') {
    event.waitUntil(DBHelper.init().then(IDBWrapper.sync()));
  }
});