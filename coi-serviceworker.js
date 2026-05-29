/*! coi-serviceworker v0.1.6 - Guido Zuidhof, licensed under MIT */
if (typeof window === 'undefined') {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
  
  self.addEventListener("fetch", function (event) {
    // DO NOT intercept cross-origin requests (CDNs, APIs, Fonts)
    // This prevents the browser from applying connect-src CSP to script/style tags.
    if (!event.request.url.startsWith(self.location.origin)) {
      return;
    }

    if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
      return;
    }
    
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 0) {
            return response;
          }
          
          const newHeaders = new Headers(response.headers);
          newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
          newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
          
          const body = (response.status === 204 || response.status === 205 || response.status === 304) ? null : response.body;

          return new Response(body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        })
        .catch((e) => console.error(e))
    );
  });
} else {
  (() => {
    // You can customize the behavior of this script through a global `coi` variable.
    const coi = {
      shouldRegister: () => true,
      shouldDeregister: () => false,
      doReload: () => window.location.reload(),
      quiet: false,
      ...window.coi
    };
    
    let n = navigator;
    if (coi.shouldDeregister() && n.serviceWorker) {
      n.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }

    // If we're already crossOriginIsolated, we don't need to do anything
    if (n.serviceWorker && window.crossOriginIsolated !== true && coi.shouldRegister()) {
      n.serviceWorker.register(window.document.currentScript.src).then(
        (registration) => {
          if (!coi.quiet) console.log("COI Service worker registered.");
          registration.addEventListener("updatefound", () => {
            if (!coi.quiet) console.log("Reloading page to apply COOP/COEP headers...");
            coi.doReload();
          });
          // If the registration is active, but it's not controlling the page
          if (registration.active && !n.serviceWorker.controller) {
            if (!coi.quiet) console.log("Reloading page to make Service Worker take control.");
            coi.doReload();
          }
        },
        (err) => {
          if (!coi.quiet) console.error("COI Service worker registration failed:", err);
        }
      );
    }
  })();
}
