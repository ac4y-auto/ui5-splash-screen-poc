# 🎯 INTEGRATION PLAN - UI5 Splash Screen Beépítés

**Cél**: A splash screen **professzionális, egységbezárt** beépítése egyUI5 alkalmazásba
**Példa projekt**: `C:\work\ui5-20260212\sapui5-wms`
**Mintaprojekt**: `C:\work\ui5\ui5-themes-gb-change-poc` (theme switching POC)

---

## 🎨 INSPIRÁCIÓ: Theme POC Megközelítés

### Mi működött jól a Theme POC-ban?

1. **✅ Egységbezárt API** - `Component.switchTheme(themeId)`
2. **✅ Központi konfiguráció** - manifest.json
3. **✅ Profi UI5 integráció** - sap.ui.core.Theming API
4. **✅ Könnyen használható** - bárhonnan meghívható
5. **✅ Lifecycle aware** - Component.init()-ben inicializálódik

### Amit átveszünk:
- **Komponens szintű API**
- **Manifest konfiguráció**
- **Lifecycle integration**
- **Centralizált logika**

---

## 🏗️ JAVASOLT ARCHITEKTÚRA

### 1. **SplashScreen Modul** (új komponens)

```
webapp/
├── splash/
│   ├── SplashScreen.js          # Core splash screen controller
│   ├── splash-video.mp4         # Video asset
│   ├── splash-poster.jpeg       # Poster asset
│   └── splash.css               # Splash styles
```

### 2. **Component.js Integráció**

```javascript
sap.ui.define([
    "sap/ui/core/UIComponent",
    "ntt/wms/splash/SplashScreen"  // Import splash module
], function (UIComponent, SplashScreen) {
    "use strict";

    return UIComponent.extend("ntt.wms.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            // SPLASH SCREEN - Show before UI5 initialization
            SplashScreen.show();

            // Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // Initialize the router
            this.getRouter().initialize();

            // SPLASH SCREEN - Hide after app ready
            SplashScreen.hide();
        }
    });
});
```

### 3. **SplashScreen.js API**

```javascript
sap.ui.define([], function () {
    "use strict";

    /**
     * Splash Screen Controller
     * @namespace ntt.wms.splash
     */
    var SplashScreen = {

        /**
         * Show splash screen
         * @public
         */
        show: function () {
            // Inject splash HTML
            // Start video playback
            // Show with fade-in
        },

        /**
         * Hide splash screen with animation
         * @public
         * @param {number} [delay=500] - Delay in ms before hiding
         */
        hide: function (delay) {
            // Fade-out animation
            // Remove from DOM
        },

        /**
         * Configure splash screen
         * @public
         * @param {object} config - Configuration object
         */
        configure: function (config) {
            // Video path
            // Poster path
            // Delay timing
            // Animation duration
        }
    };

    return SplashScreen;
});
```

---

## 📦 BEÉPÍTÉSI MÓDOK

### Opció A: **Komponens szintű** (JAVASOLT ⭐)

**Előnyök**:
- ✅ Clean separation of concerns
- ✅ Újrafelhasználható
- ✅ Könnyen konfigurálható
- ✅ UI5 best practices

**Implementáció**:
```javascript
// Component.js
init: function() {
    SplashScreen.show();
    UIComponent.prototype.init.apply(this, arguments);
    this.getRouter().initialize();
    SplashScreen.hide(500);
}
```

---

### Opció B: **index.html szintű** (Legacy support)

**Előnyök**:
- ✅ Gyorsabb megjelenés (HTML parsing előtt)
- ✅ Független UI5-től
- ✅ Legacy app támogatás

**Hátrányok**:
- ❌ HTML módosítás szükséges
- ❌ Nehezebb karbantartás
- ❌ Nem "UI5-ös" megoldás

**Implementáció**:
```html
<!-- index.html -->
<head>
    <link rel="stylesheet" href="splash/splash.css">
</head>
<body>
    <!-- Splash Screen HTML -->
    <div id="splash-screen">
        <video id="splash-video" ...>
    </div>

    <script src="splash/splash.js"></script>
    <script id="sap-ui-bootstrap" src="..."></script>
</body>
```

---

### Opció C: **Hybrid** (Legjobb mindkét világból ⭐⭐⭐)

**Megközelítés**:
1. **HTML-ben** - Splash screen markup (gyors megjelenés)
2. **Component.js-ben** - Lifecycle management (hide timing)

**Előnyök**:
- ✅ Azonnali splash megjelenés
- ✅ UI5 lifecycle aware hiding
- ✅ Profi integráció
- ✅ Production-ready

**Implementáció**:

```html
<!-- index.html - Splash markup injected -->
<head>
    <style>
        #splash-screen { /* inline styles */ }
    </style>
</head>
<body>
    <div id="splash-screen">
        <video id="splash-video" autoplay loop muted playsinline poster="splash/splash-poster.jpeg">
            <source src="splash/splash-video.mp4" type="video/mp4">
        </video>
    </div>

    <!-- UI5 Bootstrap -->
    <script id="sap-ui-bootstrap" src="..."></script>
</body>
```

```javascript
// Component.js - Lifecycle control
sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
    "use strict";

    return UIComponent.extend("ntt.wms.Component", {

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.getRouter().initialize();

            // Hide splash after router ready
            this._hideSplashScreen();
        },

        _hideSplashScreen: function () {
            setTimeout(function() {
                var splash = document.getElementById("splash-screen");
                if (splash) {
                    splash.classList.add("fade-out");
                    setTimeout(function() {
                        splash.remove();
                    }, 1000);
                }
            }, 500);
        }
    });
});
```

---

## 🎯 AJÁNLOTT MEGOLDÁS: **Opció C (Hybrid)**

### Miért?

1. **Gyors megjelenés** - HTML szinten, azonnal látható
2. **UI5 integráció** - Component lifecycle-hoz kötött eltűnés
3. **Egyszerű** - Nincs külön modul, inline kezelés
4. **Production-ready** - Tesztelt, működik

---

## 📋 IMPLEMENTÁCIÓS LÉPÉSEK

### 1. Fájlok előkészítése

```bash
# WMS projekt
cd C:\work\ui5-20260212\sapui5-wms\wms\webapp

# Splash assets másolása
mkdir splash
cp C:\work\ui5\ui5-splash-screen-poc\splash-video.mp4 splash/
cp C:\work\ui5\ui5-splash-screen-poc\splash-poster.jpeg splash/
```

### 2. index.html módosítás

**Hozzáadandó** (HEAD-ben):
```html
<style>
    /* Splash Screen Styles - Inline for fast load */
    #splash-screen {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background-color: #000;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 1s ease-out;
    }
    #splash-screen.fade-out {
        opacity: 0;
        pointer-events: none;
    }
    #splash-video {
        width: 100%; height: 100%;
        object-fit: cover;
    }
</style>
```

**Hozzáadandó** (BODY elején):
```html
<body class="sapUiBody sapUiSizeCompact" id="content">
    <!-- Splash Screen -->
    <div id="splash-screen">
        <video id="splash-video" autoplay loop muted playsinline poster="splash/splash-poster.jpeg">
            <source src="splash/splash-video.mp4" type="video/mp4">
        </video>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            var video = document.getElementById('splash-video');
            if (video) video.playbackRate = 0.2; // Slow motion
        });
    </script>

    <!-- Existing content -->
    <div data-sap-ui-component ...>
```

### 3. Component.js létrehozása/módosítása

**WMS projektben nincs Component.js!** Alternatívák:

#### 3a. Ha van Component.js:
```javascript
// Component.js - init() végén
_hideSplashScreen: function () {
    setTimeout(function() {
        var splash = document.getElementById("splash-screen");
        if (splash) {
            splash.classList.add("fade-out");
            setTimeout(function() {
                splash.remove();
            }, 1000);
        }
    }, 500);
}
```

#### 3b. Ha NINCS Component.js (WMS eset):
**locate-reuse-libs.js módosítása** vagy **új init script**:

```javascript
// webapp/splash-init.js (új fájl)
(function() {
    "use strict";

    // Wait for UI5 Core ready
    sap.ui.getCore().attachInit(function() {
        console.log("[Splash] UI5 Core ready, hiding splash screen...");

        setTimeout(function() {
            var splash = document.getElementById("splash-screen");
            if (splash) {
                splash.classList.add("fade-out");
                setTimeout(function() {
                    splash.remove();
                    console.log("[Splash] Splash screen removed");
                }, 1000);
            }
        }, 500);
    });
})();
```

**index.html-ben hozzáadni**:
```html
<script src="./splash-init.js"></script>
```

---

## 🔧 KONFIGURÁCIÓS LEHETŐSÉGEK

### manifest.json bővítés (opcionális)

```json
{
    "sap.app": {
        "splash": {
            "enabled": true,
            "videoPath": "splash/splash-video.mp4",
            "posterPath": "splash/splash-poster.jpeg",
            "playbackRate": 0.2,
            "hideDelay": 500,
            "fadeOutDuration": 1000
        }
    }
}
```

### Config olvasás Component.js-ben:

```javascript
init: function() {
    var splashConfig = this.getManifestEntry("/sap.app/splash");
    if (splashConfig && splashConfig.enabled) {
        this._hideSplashScreen(splashConfig);
    }
}
```

---

## ⚠️ FIGYELEMBE VEENDŐ

### 1. **Video méret**
- splash-video.mp4: 908KB
- Javasolt optimalizálás: < 500KB
- WebM formátum is (kisebb méret)

### 2. **Betöltési idő**
- Poster azonnal megjelenik
- Video streaming (nem kell teljes letöltés)

### 3. **Browser kompatibilitás**
- autoplay policy (muted kötelező)
- playsinline iOS-hez

### 4. **Performance**
- Inline CSS (gyorsabb)
- Video poster (fallback)
- Lazy removal (nem blocking)

---

## 📊 ÖSSZEHASONLÍTÁS

| Megoldás | Gyorsaság | UI5 integráció | Egyszerűség | Karbantartás |
|----------|-----------|----------------|-------------|--------------|
| **Komponens (A)** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **HTML (B)** | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Hybrid (C)** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

**Ajánlás**: **Opció C (Hybrid)** ⭐⭐⭐

---

## 🎬 DEMO IMPLEMENTÁCIÓ

### Minimal Working Example (MWE):

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        #splash-screen {
            position: fixed; top: 0; left: 0;
            width: 100%; height: 100%;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            transition: opacity 1s ease-out;
        }
        #splash-screen.fade-out { opacity: 0; }
        #splash-video { width: 100%; height: 100%; object-fit: cover; }
    </style>
</head>
<body>
    <div id="splash-screen">
        <video id="splash-video" autoplay loop muted playsinline poster="splash/poster.jpeg">
            <source src="splash/video.mp4" type="video/mp4">
        </video>
    </div>

    <script>
        document.getElementById('splash-video').playbackRate = 0.2;
    </script>

    <script id="sap-ui-bootstrap" src="resources/sap-ui-core.js" ...></script>

    <script>
        sap.ui.getCore().attachInit(function() {
            setTimeout(function() {
                var splash = document.getElementById("splash-screen");
                splash.classList.add("fade-out");
                setTimeout(function() { splash.remove(); }, 1000);
            }, 500);
        });
    </script>
</body>
</html>
```

---

## 📝 GYAKORLATI vs OPERATÍV TENNIVALÓK

### Gyakorlati tennivalók (egyszeri, projekt setup):
1. ✅ Splash assets másolása (`splash/` mappa)
2. ✅ `index.html` módosítása (style + markup hozzáadása)
3. ✅ `splash-init.js` létrehozása (ha nincs Component.js)
4. ✅ Tesztelés (CDN, backend, local módban)
5. ✅ Git commit

### Operatív tennivalók (rendszeres karbantartás):
1. 🔄 Video optimalizálás (ha méret probléma)
2. 🔄 Browser compatibility tesztelés
3. 🔄 Performance monitoring (betöltési idő)
4. 🔄 Asset frissítés (új logo, videó)

---

## 🚀 KÖVETKEZŐ LÉPÉSEK

1. **POC kész** ✅ - `ui5-splash-screen-poc` projekt
2. **Tervezés kész** ✅ - Ez a dokumentum
3. **Implementáció** ⏳ - WMS projektbe beépítés
4. **Tesztelés** ⏳ - Három mód (CDN, backend, local)
5. **Dokumentáció** ⏳ - README frissítés

---

**Létrehozva**: 2026-02-12
**Verzió**: 1.0
**Státusz**: Planning Complete ✅

**Következő**: Implementáció a WMS projektben (user jóváhagyás után)
