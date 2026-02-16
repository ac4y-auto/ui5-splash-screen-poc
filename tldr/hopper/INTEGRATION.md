# TLDR: WMS Integration

## WMS-INTEGRATION-INSTANT csomag

**Helye:** `WMS-INTEGRATION-INSTANT/`

**Tartalom:**
- `install.sh` — automatikus telepítő (ui5-error-handler.js + CSS + JS + assets)
- `README.md` — teljes útmutató (6.1 KB)
- `QUICKSTART.md` — 5 perces gyors útmutató
- `splash-screen.css` — frissített CSS (azonnal látható)
- `splash-screen.js` — splash logika
- `ui5-error-handler.js` — 180s timeout
- `index.html` — WMS-kompatibilis példa
- `Component.ts.patch` — diff a Component.ts módosításokhoz
- `index.html.diff` — diff az index.html módosításokhoz

## Gyors használat

```bash
cd WMS-INTEGRATION-INSTANT
bash install.sh
```

Majd manuálisan a Component.ts-ben:
```typescript
this.initCompany().then( oUser => {
    if ((window as any).SplashScreen) {
        (window as any).SplashScreen.hide();
    }
    this.getRouter().initialize();
});
```

## wms-splash-test státusz

**Projekt:** `/Volumes/DevAPFS/work/ui5/wms-splash-test/sapui5-wms-main/wms/`

**Integráció:** ✅ Kész
- Asset fájlok → `webapp/images/`
- CSS + JS → `webapp/css/`
- index.html módosítva (backup: index.html.backup)
- Component.ts módosítva

**Következő lépés:**
```bash
cd /Volumes/DevAPFS/work/ui5/wms-splash-test/sapui5-wms-main/wms
npm install
npm start
```

## Kritikus változások v4.1.0

1. **splash-screen.css** — `display: flex`, `opacity: 1` (azonnal látható)
2. **ui5-error-handler.js** — timeout 15s → 180s
3. **install.sh** — ui5-error-handler.js másolás hozzáadva (line 70-71)

## Konfigurálható verzió

**Fájlok:**
- `splash-screen-configurable.js`
- `ui5-error-handler-configurable.js`

**Használat:**
```html
<script>
    window.SplashConfig = {
        videoPlaybackRate: 0.2,
        hideDelay: 500,
        fadeOutDuration: 1000,
        debug: true
    };

    window.UI5ErrorConfig = {
        loadTimeoutMs: 180000,
        debug: true
    };
</script>
```

## Dokumentáció

| Fájl | Leírás |
|------|--------|
| `INTEGRATION_GUIDE.md` | 3 lépéses integráció (minimális + konfigurálható) |
| `COMPARISON.md` | Eredeti vs konfigurálható verzió |
| `SESSION_SUMMARY.md` | Teljes changelog + TODO |
