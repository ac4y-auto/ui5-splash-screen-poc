# Splash Screen Integration Guide

## Architektúra áttekintés

A splash screen rendszer **3 rétegből** áll, amelyek egymástól függetlenül védik az alkalmazást:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. splash-screen.css      → Azonnali splash megjelenítés    │
│                              (CSS, nincs JS függőség)        │
├─────────────────────────────────────────────────────────────┤
│ 2. ui5-error-handler.js   → UI5 framework betöltési hiba    │
│                              (180 mp timeout + script error) │
├─────────────────────────────────────────────────────────────┤
│ 3. splash-screen.js       → Manuális vezérlés + fallback    │
│                              (60 mp biztonsági timeout +     │
│                               error overlay backend hibára)  │
└─────────────────────────────────────────────────────────────┘
```

### Hibakezelési rétegek:

| Réteg | Mit figyel? | Mikor aktiválódik? | Overlay? |
|-------|------------|-------------------|----------|
| **ui5-error-handler.js** | UI5 framework (`sap-ui-core.js`) nem töltődik be | CDN/szerver nem elérhető, 404, hálózati hiba | UI5 Betöltési Hiba |
| **splash-screen.js fallback** | Az app nem hívta meg `SplashScreen.hide()`-ot 60 mp-en belül | Backend timeout, elakadt Promise, Component hiba | Alkalmazás Betöltési Hiba |
| **Component.ts catch** | Backend hívás exception-t dob | REST API hiba, ETIMEDOUT | `MessageBox.error()` |

---

## Minimális Integráció (3 lépés)

### 1. Fájlok másolása a projektbe

Másold át ezeket a fájlokat az alkalmazásod `webapp/` könyvtárába (vagy `webapp/css/` alá):

```
webapp/
├── css/
│   ├── splash-screen.js              ← JS logika (manuális vezérlés + 60s fallback + error overlay)
│   ├── splash-screen.css             ← Stílusok (splash + error overlay)
│   └── ui5-error-handler.js          ← UI5 betöltési hibakezelő (180s timeout)
├── images/
│   ├── splash-video.mp4              ← Videó (opcionális)
│   └── splash-poster.jpeg            ← Fallback kép (opcionális)
```

### 2. index.html módosítás

**ELŐTTE:**
```html
<!DOCTYPE html>
<html>
<head>
    <script id="sap-ui-bootstrap"
        src="resources/sap-ui-core.js"
        data-sap-ui-theme="sap_horizon"
        ...>
    </script>
</head>
<body class="sapUiBody">
    <div data-sap-ui-component ...></div>
</body>
</html>
```

**UTÁNA:**
```html
<!DOCTYPE html>
<html>
<head>
    <!-- SPLASH SCREEN: 1/4 - CSS betöltése (head-be!) -->
    <link rel="stylesheet" href="css/splash-screen.css">

    <!-- UI5 bootstrap -->
    <script id="sap-ui-bootstrap"
        src="resources/sap-ui-core.js"
        data-sap-ui-theme="sap_horizon"
        ...>
    </script>

    <!-- SPLASH SCREEN: 2/4 - UI5 betöltési hibakezelő -->
    <script src="css/ui5-error-handler.js"></script>
</head>
<!-- SPLASH SCREEN: 3/4 - "loading" class hozzáadva -->
<body class="sapUiBody loading">

    <!-- SPLASH SCREEN: 3/4 - HTML struktúra -->
    <div id="splash-screen">
        <video id="splash-video" autoplay muted loop playsinline
               poster="images/splash-poster.jpeg">
            <source src="images/splash-video.mp4" type="video/mp4">
        </video>
    </div>

    <!-- App container (változatlan) -->
    <div data-sap-ui-component ...></div>

    <!-- SPLASH SCREEN: 4/4 - JavaScript vezérlő (body végén!) -->
    <script src="css/splash-screen.js"></script>
</body>
</html>
```

> **FONTOS elhelyezési sorrend:**
> - `splash-screen.css` → `<head>`-ben, minden más előtt (azonnali megjelenés)
> - `ui5-error-handler.js` → `<head>`-ben, a `sap-ui-bootstrap` UTÁN
> - `splash-screen.js` → `<body>` végén, a splash HTML div UTÁN

### 3. Component.js / Component.ts módosítás

**JavaScript (Component.js):**
```javascript
init: function() {
    UIComponent.prototype.init.apply(this, arguments);

    this.loadApplicationData()
        .then(function() {
            // ✅ SPLASH END (adatok betöltve)
            if (window.SplashScreen) {
                window.SplashScreen.hide();
            }
            this.getRouter().initialize();
        }.bind(this))
        .catch(function(error) {
            // ✅ Hiba esetén is elrejtés (azonnal, delay nélkül)
            if (window.SplashScreen) {
                window.SplashScreen.hide(0);
            }
            // Saját hibakezelés...
        });
}
```

**TypeScript (Component.ts):**
```typescript
public init(): void {
    super.init();

    this.initCompany().then(oUser => {
        // ✅ Splash screen elrejtése az inicializáció végén
        if ((window as any).SplashScreen) {
            (window as any).SplashScreen.hide();
        }
        this.getRouter().initialize();
    }).catch((err: any) => {
        // ✅ Hiba esetén is rejtsd el a splash screen-t
        if ((window as any).SplashScreen) {
            (window as any).SplashScreen.hide(0);
        }
        MessageBox.error(err.message);
    });
}
```

---

## Splash Screen API

### `window.SplashScreen.show()`
Splash megjelenítése. A splash alapból látható (CSS), ezt csak akkor kell hívni, ha korábban elrejtettük.

### `window.SplashScreen.hide(delay)`
Splash elrejtése fade-out animációval.
- `delay` (opcionális): Várakozás a fade-out előtt (ms). Default: 500ms.
- `hide(0)`: Azonnali elrejtés (hiba esetén ajánlott).
- Automatikusan törli a fallback timeout-ot.

### `window.SplashScreen.isVisible()`
Visszaadja, hogy a splash látható-e (`true`/`false`).

---

## Időzítések és konfigurálható értékek

| Paraméter | Alapértelmezett | Fájl | Leírás |
|-----------|----------------|------|--------|
| **Video sebesség** | `0.2` (5x lassabb) | `splash-screen.js` | `video.playbackRate = 0.2` |
| **Hide delay** | `500` ms | `splash-screen.js` | `delay` paraméter a `hide()` hívásban |
| **Fade-out** | `1000` ms (1s) | `splash-screen.css` | `transition: opacity 1s ease-out` |
| **Fallback timeout** | `60000` ms (60s) | `splash-screen.js` | `FALLBACK_TIMEOUT_MS = 60000` |
| **UI5 load timeout** | `180000` ms (3 perc) | `ui5-error-handler.js` | `LOAD_TIMEOUT_MS = 180000` |

---

## Összefoglalás: Mi módosul a meglévő alkalmazásban?

### Módosítandó fájlok (2 db):

1. **index.html** — CSS link + 2 script tag + `loading` class + splash div
2. **Component.js/ts** — `SplashScreen.hide()` hívás a then/catch ágakban

### Új fájlok (3+2 db):

- `splash-screen.js` (kötelező)
- `splash-screen.css` (kötelező)
- `ui5-error-handler.js` (kötelező)
- `splash-video.mp4` (opcionális)
- `splash-poster.jpeg` (opcionális fallback)

**Teljes impact:** 2 módosított + 3-5 új fájl.

---

## Troubleshooting

### Splash nem jelenik meg
- Ellenőrizd: `<div id="splash-screen">` létezik az index.html-ben
- Ellenőrizd: `splash-screen.css` betöltődött (`<head>`-ben van?)
- Ellenőrizd: CSS-ben `display: flex` és `opacity: 1` van

### Splash nem tűnik el
- Ellenőrizd: `window.SplashScreen.hide()` meghívódik a Component-ben
- Ellenőrizd: a Promise (then/catch) tényleg resolve/reject-ol
- A fallback timeout (60 mp) biztonsági hálóként mindenképpen elrejti
- Console-ban keresd a `[Splash]` prefix-es üzeneteket

### Splash a fallback timeout-tal tűnik el (60 mp)
- A backend szerver valószínűleg nem elérhető vagy túl lassú
- A Component.ts catch ága nem kapta el a hibát időben
- Megoldás: a backend REST hívásokban állíts be saját timeout-ot

### Error overlay jelenik meg (UI5 hiba)
- Az `ui5-error-handler.js` aktiválódott → a UI5 framework nem töltődött be
- Ellenőrizd a CDN/szerver elérhetőségét
- Console-ban nézd meg a részleteket (F12)

### Error overlay jelenik meg (Backend hiba, 60 mp után)
- A `splash-screen.js` fallback timeout-ja aktiválódott
- A backend szerver nem elérhető
- Ellenőrizd a backend szerver státuszát és a proxy konfigurációt
