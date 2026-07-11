const CACHE="hausbau-cockpit-v4-4";
const ASSETS=[
  "./?v=41","index.html?v=41","styles-v41.css","config-v41.js",
  "app-v41.js","storage-v41.js","manifest.json",
  "icon-192.png","icon-512.png","apple-touch-icon.png","favicon.png"
];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  const appFile=url.origin===self.location.origin &&
    (url.pathname.endsWith("/")||url.pathname.endsWith("/index.html")||
     url.pathname.endsWith("/styles-v41.css")||url.pathname.endsWith("/config-v41.js")||
     url.pathname.endsWith("/app-v41.js")||url.pathname.endsWith("/storage-v41.js"));

  if(appFile){
    event.respondWith(
      fetch(event.request,{cache:"no-store"})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
          return response;
        })
        .catch(()=>caches.match(event.request))
    );
    return;
  }

  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
});
