// Rupa: penyimpan offline. Naikkan VERSI setiap kali file aplikasi diperbarui.
const VERSI = "rupa-app-v1";
const INTI = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
const LUAR = "rupa-luar-v1"; // font Google dan mesin AI dari CDN

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSI).then((c) => c.addAll(INTI)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  const simpan = [VERSI, LUAR, "rupa-model-v1"];
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => !simpan.includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // file model AI dikelola langsung oleh aplikasi
  if (url.origin === location.origin && /\.(onnx|bin)$/.test(url.pathname)) return;
  // halaman utama: coba internet dulu agar selalu versi terbaru, kalau offline pakai simpanan
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((r) => { const c = r.clone(); caches.open(VERSI).then((k) => k.put("index.html", c)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  // file lain: pakai simpanan dulu, lalu ambil dari internet dan simpan
  const nama = url.origin === location.origin ? VERSI : LUAR;
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => {
    if (r && (r.ok || r.type === "opaque")) { const c = r.clone(); caches.open(nama).then((k) => k.put(req, c)); }
    return r;
  })));
});
