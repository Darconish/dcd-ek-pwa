const C='dcd-ek-safe-v8';
const A=['./','index.html','manifest.webmanifest','icon.svg'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(C)
      .then(c=>c.addAll(A))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;

  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request)
        .then(r=>{
          const z=r.clone();
          caches.open(C).then(c=>{
            c.put(e.request,z.clone()).catch(()=>{});
            c.put('index.html',z).catch(()=>{});
          });
          return r;
        })
        .catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached=>{
      const network=fetch(e.request)
        .then(r=>{
          if(r&&r.ok){
            const z=r.clone();
            caches.open(C).then(c=>c.put(e.request,z).catch(()=>{}));
          }
          return r;
        })
        .catch(()=>cached);
      return cached||network;
    })
  );
});