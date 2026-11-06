// ベトナム研修ガイド service worker
const CACHE="vn-guide-v1";
const ASSETS=["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable.png", "apple-touch-icon.png", "food/banhmi.jpg", "food/banhxeo.jpg", "food/bunbo.jpg", "food/buncha.jpg", "food/cafe.jpg", "food/che.jpg", "food/comtam.jpg", "food/goicuon.jpg", "food/hutieu.jpg", "food/pho.jpg", "food/sinhto.jpg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET")return;
  if(u.origin===location.origin){
    // ページ本体はネット優先（更新を反映）、だめならキャッシュ。それ以外はキャッシュ優先
    if(e.request.mode==="navigate"){
      e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put("index.html",cp));return r}).catch(()=>caches.match("index.html",{ignoreSearch:true})));
      return;
    }
    e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return res})));
  }else if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return res}).catch(()=>new Response("",{status:504}))));
  }
});
