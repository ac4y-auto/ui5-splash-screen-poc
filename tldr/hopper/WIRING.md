# TLDR: Wiring (Működési Folyamat)

## 2 rétegű architektúra
1. **Server layer**: `fiori run` + `fiori-tools-proxy` (YAML vezérelt)
2. **Runtime layer**: statikus index.html + App-Controlled Splash + Error Handler

## Indítási flow
```
npm start → package.json → npx fiori run --port 8300
  → YAML config beolvasás → ui5 serve + middleware-ek
  → http://localhost:8300/index.html megnyitás
```

## Bootstrap sorrend (index.html)
1. `splash-screen.css` — stílusok
2. `sap-ui-bootstrap` script — `resources/sap-ui-core.js` (proxy feloldja)
3. `ui5-error-handler.js` — error + 15s timeout figyelés
4. `splash-screen.js` — `window.SplashScreen` API regisztráció
5. `<body>` — #splash-screen (video) + data-sap-ui-component (UI5 app)

## Runtime flow
```
SAPUI5 init → ComponentSupport → Component.js init()
  → SplashScreen.show()
  → loadApplicationData() [4 parallel Promise, ~1500ms]
  → SplashScreen.hide(500) [fade-out]
  → splash.remove() [DOM cleanup]
```

## Proxy feloldás (/resources kérés)
- **Local**: ui5 serve → ~/.ui5/framework/ cache
- **CDN**: fiori-tools-proxy → sapui5.hana.ondemand.com
- **Backend**: CDN proxy + /sap → 192.168.1.10:9000
- **Hybrid**: local framework + /sap → 192.168.1.10:9000

## Hiba flow
```
script error VAGY 15s timeout
  → ui5-error-handler.js: onLoadError()
  → SplashScreen.hide(0)
  → showErrorOverlay() [cím, üzenet, retry gomb, tech details]
```

## Fájl kapcsolatok
```
YAML → fiori run → index.html → sap-ui-bootstrap (proxy feloldja)
                                → ui5-error-handler.js (error figyelés)
                                → splash-screen.js (SplashScreen API)
                                → Component.js (show/hide hívások)
```
