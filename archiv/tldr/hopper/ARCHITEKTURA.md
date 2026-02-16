# TLDR: Architektúra

> Kivonatok: APP_CONTROLLED_SPLASH.md, ARCHITECTURE_v2.txt, WIRING.md részei

## App-Controlled Splash (v3.2+)

A splash screen-t az alkalmazás irányítja manuálisan:

```
Component.js init()
  → SplashScreen.show()        // splash megjelenik
  → loadApplicationData()      // 4 parallel Promise (~1500ms)
  → SplashScreen.hide(500)     // fade-out
```

**API**: `window.SplashScreen.show()` / `.hide(delay)` / `.isVisible()`

## Server Réteg (v4.0)

```
fiori run (ui5 serve wrapper)
  → YAML config választ módot
  → fiori-tools-proxy middleware kezeli a /resources proxy-t
  → Statikus index.html kiszolgálása
```

## Bootstrap Sorrend (index.html)

1. `splash-screen.css` — stílusok
2. `sap-ui-bootstrap` — SAPUI5 betöltés (`resources/sap-ui-core.js`)
3. `ui5-error-handler.js` — hiba figyelés (script error + 15s timeout)
4. `splash-screen.js` — SplashScreen API regisztráció

## 4 Mód

| Mód | YAML | /resources forrás | Backend |
|-----|------|-------------------|---------|
| Local | `ui5.yaml` | ~/.ui5/ cache | - |
| CDN | `ui5-cdn.yaml` | SAP CDN proxy | - |
| Backend | `ui5-backend.yaml` | SAP CDN proxy | /sap → 192.168.1.10:9000 |
| Hybrid | `ui5-hybrid.yaml` | ~/.ui5/ cache | /sap → 192.168.1.10:9000 |

## Evolúció

v1.0 (monolitikus) → v2.0 (moduláris) → v3.0 (build-based) → v3.2 (app-controlled) → **v4.0 (fiori run, YAML)**
