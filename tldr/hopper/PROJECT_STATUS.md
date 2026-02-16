# TLDR: Project Status

## v4.1.0 | Production Ready (95%)

### Kész
- App-controlled splash (SplashScreen API: show/hide/isVisible)
- Error overlay (script error + 180s timeout) ✅ FRISSÍTVE
- Szimulált data loading (4 endpoint, ~1500ms, Promise.all)
- Smart Start (port check) + Purge (külön process killer)
- fiori run + YAML (4 mód: Local, CDN, Backend, Hybrid)
- PORT validation (command injection fix)
- Dokumentáció (~15,000+ sor)
- **WMS-INTEGRATION-INSTANT csomag** (automatikus telepítő) ✅ ÚJ
- **Konfigurálható verzió** (timeout paraméterek) ✅ ÚJ
- **wms-splash-test integráció** (példa projekt) ✅ ÚJ
- **Kritikus bugfix-ek** (splash azonnal látható) ✅ ÚJ

### Hiányzik
- WMS backend integráció (valódi API-k)
- Progress bar + loading üzenetek
- E2E / unit tesztek
- CI/CD pipeline

### Teljesítmény
- Splash: ~2.5s | UI5 load: ~200ms | Data load: ~1500ms | Total: ~2.7s
- CDN mód: ~3s teljes betöltés (tesztelve)

### Tech stack
- SAPUI5 1.105.0 (ONLY) | fiori run | fiori-tools-proxy | Node 18+ | ES5

### v4.1.0 Változások (2026-02-16)
- Splash CSS fix: azonnal látható (display: flex, opacity: 1)
- Error timeout: 15s → 180s (3 perc)
- WMS-INTEGRATION-INSTANT: 9 fájl, install.sh
- Konfigurálható verzió: window.SplashConfig támogatás
- wms-splash-test projekt integrálva
- Dokumentáció bővítve: 5 új útmutató
