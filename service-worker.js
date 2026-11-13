/* SoundCheck Service Worker. Version wird bei jedem Build neu gesetzt. */
var VERSION="sc-20261113-172046";
var CORE=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/icon-512-maskable.png","icons/apple-touch-icon.png","icons/favicon.ico","icons/favicon-32.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(CORE.map(function(u){ return new Request(u,{cache:"reload"}); })); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){ return Promise.all(keys.filter(function(k){ return k!==VERSION; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch",function(e){
  var req=e.request; if(req.method!=="GET") return;
  var url=new URL(req.url); if(url.origin!==self.location.origin) return;
  /* Seiten: zuerst Netz (immer aktuell), offline aus dem Cache */
  if(req.mode==="navigate"||url.pathname.endsWith("/")||url.pathname.endsWith(".html")){
    e.respondWith(fetch(req,{cache:"no-store"}).then(function(res){ var cp=res.clone(); caches.open(VERSION).then(function(c){ c.put("index.html",cp); }); return res; })
      .catch(function(){ return caches.match("index.html").then(function(r){ return r||caches.match("./"); }); }));
    return;
  }
  /* Icons und Manifest: Cache zuerst, sonst Netz */
  e.respondWith(caches.match(req).then(function(r){ return r||fetch(req); }));
});
