// Calmdeck offline cache. Build 3a381f6912
const CACHE='keel-3a381f6912';
const ASSETS=['./','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  const key=req.mode==='navigate'?'./':req;
  // Pages: network first, so updates show up immediately when online; cached copy when offline.
  if(req.mode==='navigate'){
    e.respondWith(caches.open(CACHE).then(c=>fetch(req).then(res=>{if(res.ok)c.put(key,res.clone());return res}).catch(()=>c.match(key,{ignoreSearch:true}))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(c=>c.match(key,{ignoreSearch:true}).then(hit=>{
    const net=fetch(req).then(res=>{if(res.ok)c.put(key,res.clone());return res}).catch(()=>hit);
    return hit||net;
  })));
});
