/* ReadyEnough Pocket offline shell, no tracking or background distress transmission. */
const CACHE='readyenough-pocket-v1';
const FILES=['./','./index.html','./icon.svg','./manifest.webmanifest','../radio-guide.html'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('readyenough-pocket-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const r=event.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin)return;if(r.mode==='navigate'&&u.pathname.endsWith('/app/index.html')){event.respondWith(fetch(r).then(resp=>{if(resp.ok){const copy=resp.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put('./index.html',copy)))}return resp}).catch(()=>caches.match('./index.html')));return}event.respondWith(caches.match(r).then(hit=>hit||fetch(r)))});
