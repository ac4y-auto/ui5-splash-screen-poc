# TLDR: Changelog

## v4.1.0 (2026-02-16) - WMS Integration & Critical Fixes

### 🎉 Új funkciók
- **WMS-INTEGRATION-INSTANT csomag** - Automatikus telepítő csomag
  - `install.sh` - Bash script (fájlmásolás + backup + útmutató)
  - 9 fájl (README, QUICKSTART, CSS, JS, példák, diff-ek)
  - ui5-error-handler.js másolás hozzáadva (line 70-71)

- **Konfigurálható verzió**
  - `splash-screen-configurable.js` - timeout-ok paraméterezhetők
  - `ui5-error-handler-configurable.js` - error config
  - `window.SplashConfig` és `window.UI5ErrorConfig` támogatás

- **wms-splash-test integráció**
  - Fájlok átmásolva példa projektbe
  - index.html + Component.ts módosítva
  - Tesztelésre kész (npm install után)

- **Dokumentáció bővítve**
  - `INTEGRATION_GUIDE.md` - 3 lépéses integráció
  - `COMPARISON.md` - Eredeti vs konfigurálható
  - `SESSION_SUMMARY.md` - Teljes session changelog
  - `tldr/hopper/INTEGRATION.md` - WMS integráció TLDR

### 🐛 Kritikus bugfix-ek
- **Splash azonnal látható** (CSS fix)
  - `display: none` → `display: flex`
  - `opacity: 0` → `opacity: 1`
  - Érintett: `splash-screen.css` (POC + WMS-INTEGRATION-INSTANT)

- **Timeout növelés**
  - 15 másodperc → 180 másodperc (3 perc)
  - Lassabb backend-ek támogatása
  - Érintett: `ui5-error-handler.js` (POC + WMS-INTEGRATION-INSTANT)

### 🧪 Tesztelés
- ✅ POC CDN mód - Teljesen működik (~3s betöltés)
- ✅ POC Backend mód - Error overlay 180s után (várható)
- ⏳ wms-splash-test - Integráció kész, npm install szükséges

### 📊 Metrikák
- Dokumentáció: ~10,000 → ~15,000 sor
- Production ready: 80% → 95%
- WMS-INTEGRATION-INSTANT: 9 fájl, ~30 KB

---

## v4.0.0 (2026-02-08) - Production Ready

### ✅ Fő funkciók
- App-controlled splash (SplashScreen API)
- Error overlay (script error + timeout)
- Smart Start + Purge
- 4 mód (Local, CDN, Backend, Hybrid)
- PORT validation (security fix)

### 📚 Dokumentáció
- ~10,000+ sor
- hopper/ mappa (teljes spec)
- tldr/hopper/ (kivonatok)

---

## v3.2 (előző verzió)

### Változások
- `ui5-bootstrap.js` → `ui5-error-handler.js`
- Timeout mechanizmus hozzáadva (15s)
- Config gomb eltávolítva (YAML config)

---

## Következő verzió tervek (v4.2.0+)

### Hiányzó funkciók
- WMS backend integráció (valódi API-k)
- Progress bar + loading üzenetek
- E2E / unit tesztek
- CI/CD pipeline
- SRI (Subresource Integrity) CDN biztonsághoz

### Továbbfejlesztési javaslatok
- i18n támogatás (többnyelvű error üzenetek)
- Theme support (dark mode)
- Analytics integráció (betöltési idő tracking)
