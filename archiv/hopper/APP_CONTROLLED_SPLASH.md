# App-Controlled Splash Screen

## Dokumentum Célja

Ez a dokumentum leírja hogyan **irányítja az UI5 alkalmazás** a splash screen megjelenését és eltűnését az **üzleti adatok betöltése** során.

**Verzió:** v3.2
**Implementálva:** 2026-02-15

---

## Koncepció Változás

### RÉGI (v3.1) - UI5 Library Loading Splash ❌

```
Page Load
    ↓
Splash MEGJELENIK (automatikusan)
    ↓
UI5 Library betöltődik (CDN/Local)
    ↓
UI5 Core init
    ↓
Splash ELTŰNIK (automatikusan)
    ↓
UI5 App init
    ↓
Business data loading (??? NINCS SPLASH)
```

**Probléma:** Az app inicializáláskor (amikor az adatok töltődnek) **nincs splash screen**, mert az már eltűnt!

---

### ÚJ (v3.2) - App-Controlled Splash ✅

```
Page Load
    ↓
UI5 Library betöltődik (háttérben, nincs splash)
    ↓
UI5 Core init
    ↓
UI5 App Component init
    ↓
App meghívja: window.SplashScreen.show()
    ↓
Splash MEGJELENIK ✅
    ↓
Business data loading (products, customers, orders, settings)
    ↓
Adatok betöltve
    ↓
App meghívja: window.SplashScreen.hide()
    ↓
Splash ELTŰNIK ✅
    ↓
App használható
```

**Előny:**
- ✅ Splash a **VALÓDI** adatbetöltésnél jelenik meg
- ✅ App irányítja a megjelenést/eltűnést
- ✅ Flexible: app dönti el mikor kész

---

## API Használat

### window.SplashScreen API

```javascript
// Public API methods
window.SplashScreen = {
    show: function()           // Splash megjelenítése
    hide: function(delay)      // Splash eltüntetése (optional delay)
    isVisible: function()      // Látható-e a splash?
};
```

### Példa: Component.js Implementáció

```javascript
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function(UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("myapp.Component", {

        metadata: {
            manifest: "json"
        },

        init: function() {
            UIComponent.prototype.init.apply(this, arguments);

            console.log('[App] Component init started');

            // ========================================
            // SPLASH SCREEN START
            // ========================================
            if (window.SplashScreen) {
                console.log('[App] Starting splash screen...');
                window.SplashScreen.show();
            }

            // ========================================
            // BUSINESS DATA LOADING
            // ========================================
            this.loadApplicationData()
                .then(function(data) {
                    console.log('[App] ✅ All data loaded');

                    // Set data to model
                    var oModel = new JSONModel(data);
                    this.setModel(oModel, "app");

                    // ========================================
                    // SPLASH SCREEN END
                    // ========================================
                    if (window.SplashScreen) {
                        console.log('[App] Hiding splash screen...');
                        window.SplashScreen.hide(500); // 500ms fade-out
                    }

                }.bind(this))
                .catch(function(error) {
                    console.error('[App] ❌ Data loading failed:', error);

                    // Hide splash even on error
                    if (window.SplashScreen) {
                        window.SplashScreen.hide(0); // Immediate hide
                    }
                });
        },

        loadApplicationData: function() {
            return Promise.all([
                this._loadProducts(),
                this._loadCustomers(),
                this._loadOrders(),
                this._loadUserSettings()
            ]).then(function(results) {
                return {
                    products: results[0],
                    customers: results[1],
                    orders: results[2],
                    settings: results[3]
                };
            });
        }

    });

});
```

---

## Splash Screen Metódusok

### 1. show()

**Leírás:** Splash screen megjelenítése

**Használat:**
```javascript
window.SplashScreen.show();
```

**Mi történik:**
```javascript
show: function() {
    var splash = document.getElementById('splash-screen');
    if (splash) {
        // Remove fade-out classes
        splash.classList.remove('fade-out');
        splash.classList.remove('hidden');

        // Make visible
        splash.style.display = 'flex';
        splash.style.opacity = '1';

        // Start video playback
        var video = splash.querySelector('video');
        if (video) {
            video.play();
        }

        console.log('[Splash] ✅ Splash screen SHOWN (app initiated)');
    }
}
```

**Mikor hívd:**
- Component init elején
- Adatok betöltése ELŐTT
- Router navigation-nél (ha új view betölt adatokat)

---

### 2. hide(delay)

**Leírás:** Splash screen eltüntetése

**Paraméterek:**
- `delay` (optional, number) - Késleltetés ms-ban (default: 500ms)

**Használat:**
```javascript
// Default fade-out (500ms)
window.SplashScreen.hide();

// Custom delay
window.SplashScreen.hide(1000); // 1s fade-out

// Immediate hide (no animation)
window.SplashScreen.hide(0);
```

**Mi történik:**
```javascript
hide: function(delay) {
    delay = delay || 500; // Default 500ms

    setTimeout(function() {
        var splash = document.getElementById('splash-screen');
        if (splash) {
            // Add fade-out class
            splash.classList.add('fade-out');

            // Remove from DOM after animation
            setTimeout(function() {
                splash.remove();
                console.log('[Splash] Splash screen removed from DOM');
            }, 1000);
        }
    }, delay);
}
```

**Mikor hívd:**
- Adatok betöltése UTÁN
- Promise resolve-ban
- Hiba esetén (immediate: delay=0)

---

### 3. isVisible()

**Leírás:** Ellenőrzi hogy a splash látható-e

**Használat:**
```javascript
if (window.SplashScreen.isVisible()) {
    console.log('Splash is currently visible');
}
```

**Visszatérési érték:** `boolean`

**Példa használat:**
```javascript
// Conditional data loading
if (!window.SplashScreen.isVisible()) {
    // Splash nincs látva → show it
    window.SplashScreen.show();
}

this.loadData().then(function() {
    if (window.SplashScreen.isVisible()) {
        // Splash még látszik → hide it
        window.SplashScreen.hide();
    }
});
```

---

## Flow Diagramok

### Sikeres Betöltés Flow

```
┌─────────────────────────────────────────────────────┐
│ 1. Page Load                                        │
│    - index.html betöltődik                          │
│    - UI5 bootstrap script injektálódik              │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 2. UI5 Library Loading (háttérben)                  │
│    - sap-ui-core.js letöltés (CDN/Local)           │
│    - UI5 Core inicializálás                         │
│    - sap.ui.getCore().isInitialized() → true       │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 3. UI5 App Component init                          │
│    Component.js → init() meghívódik                 │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 4. App hívja: window.SplashScreen.show()           │
│    ✅ Splash MEGJELENIK                             │
│    - Video lejátszás indul                          │
│    - Fullscreen overlay                             │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 5. Business Data Loading                            │
│    - loadProducts()      (1000ms simulated)         │
│    - loadCustomers()     (1500ms simulated)         │
│    - loadOrders()        ( 800ms simulated)         │
│    - loadUserSettings()  ( 500ms simulated)         │
│                                                     │
│    ⏱️  Total: ~1500ms (longest Promise)            │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 6. Data Loading Complete                            │
│    Promise.all() resolve                            │
│    - JSONModel létrehozás                           │
│    - Model beállítás: setModel(oModel, "app")      │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 7. App hívja: window.SplashScreen.hide(500)        │
│    ✅ Splash ELTŰNIK                                │
│    - Fade-out animáció (500ms)                      │
│    - DOM eltávolítás (1s után)                      │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 8. ✅ App KÉSZ és HASZNÁLHATÓ                       │
│    - UI látható                                     │
│    - Adatok betöltve                                │
│    - User interakció lehetséges                     │
└─────────────────────────────────────────────────────┘
```

---

### Hiba Esetén Flow

```
┌─────────────────────────────────────────────────────┐
│ 1-4. Ugyanaz mint sikeres flow                      │
│      → Splash MEGJELENIK                            │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 5. Business Data Loading                            │
│    - loadProducts()      → ✅ OK                     │
│    - loadCustomers()     → ❌ FAIL (network error)  │
│    - loadOrders()        → ⏹️  CANCELLED            │
│    - loadUserSettings()  → ⏹️  CANCELLED            │
│                                                     │
│    ⏱️  Promise.all() REJECT                        │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 6. Error Handler (catch)                            │
│    console.error('[App] ❌ Data loading failed')    │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 7. App hívja: window.SplashScreen.hide(0)          │
│    ✅ Splash AZONNAL ELTŰNIK                        │
│    - No fade-out (delay=0)                          │
│    - DOM eltávolítás                                │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 8. Error Message Megjelenítése                      │
│    sap.m.MessageBox.error("Nem sikerült...")        │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 9. ⚠️ App RÉSZBEN HASZNÁLHATÓ                       │
│    - UI látható                                     │
│    - Adatok hiányosak                               │
│    - Retry opció user-nek                           │
└─────────────────────────────────────────────────────┘
```

---

## Példa Backend Hívások

### _simulateBackendCall()

```javascript
/**
 * Simulate backend call with delay
 *
 * Valódi projektben ez lenne:
 *   return this.getModel().read("/ProductSet");
 *
 * @param {string} name - Data type name (for logging)
 * @param {number} delay - Simulated network delay in ms
 * @param {*} data - Data to return
 * @returns {Promise}
 */
_simulateBackendCall: function(name, delay, data) {
    console.log('[App] Loading ' + name + '... (simulated ' + delay + 'ms delay)');

    return new Promise(function(resolve) {
        setTimeout(function() {
            console.log('[App] ✅ ' + name + ' loaded');
            resolve(data);
        }, delay);
    });
}
```

### Valódi OData Példa

```javascript
_loadProducts: function() {
    return new Promise(function(resolve, reject) {
        this.getModel().read("/ProductSet", {
            success: function(oData) {
                console.log('[App] ✅ Products loaded');
                resolve(oData.results);
            },
            error: function(oError) {
                console.error('[App] ❌ Products failed:', oError);
                reject(oError);
            }
        });
    }.bind(this));
}
```

---

## Console Output Timeline

### Sikeres Betöltés

```
[UI5 Bootstrap] Environment: CDN (SAPUI5)
[UI5 Bootstrap] Bootstrap URL: https://sapui5.hana.ondemand.com/...
[UI5 Bootstrap] Bootstrap script injected into DOM
[UI5 Bootstrap] UI5 script loaded successfully
[Splash] Manual control mode - waiting for app to call show()
[App] Component init started
[App] Starting splash screen...
[Splash] ✅ Splash screen SHOWN (app initiated)
[App] Loading application data...
[App] Loading products... (simulated 1000ms delay)
[App] Loading customers... (simulated 1500ms delay)
[App] Loading orders... (simulated 800ms delay)
[App] Loading settings... (simulated 500ms delay)
[App] ✅ settings loaded
[App] ✅ orders loaded
[App] ✅ products loaded
[App] ✅ customers loaded
[App] ✅ All data loaded successfully
[App] Data: { products: [...], customers: [...], orders: [...], settings: {...} }
[App] Hiding splash screen...
[Splash] Hiding splash screen with fade-out...
[Splash] Splash screen removed from DOM
```

**Időzítés:**
- 0ms: Page load
- 500ms: UI5 loaded
- 600ms: App init + Splash SHOW
- 600-2100ms: Data loading (1500ms total)
- 2100ms: Splash HIDE start
- 2600ms: Splash fade-out complete (500ms animation)
- 3600ms: Splash DOM removed (1s after fade-out start)

---

## Best Practices

### 1. Mindig Ellenőrizd hogy Létezik-e

```javascript
// GOOD ✅
if (window.SplashScreen) {
    window.SplashScreen.show();
}

// BAD ❌
window.SplashScreen.show(); // Error if not defined!
```

### 2. Always Hide on Error

```javascript
// GOOD ✅
this.loadData()
    .then(function() {
        if (window.SplashScreen) {
            window.SplashScreen.hide();
        }
    })
    .catch(function(error) {
        // Hide even on error!
        if (window.SplashScreen) {
            window.SplashScreen.hide(0); // Immediate
        }
    });

// BAD ❌
this.loadData()
    .then(function() {
        window.SplashScreen.hide();
    });
// Ha error van, splash örökké látszik!
```

### 3. Use Appropriate Delays

```javascript
// Data loaded successfully → smooth fade-out
window.SplashScreen.hide(500); // 500ms animation

// Error occurred → immediate hide
window.SplashScreen.hide(0); // No delay

// Long process finished → longer fade for polish
window.SplashScreen.hide(1000); // 1s animation
```

### 4. Router Integration

```javascript
// BaseController.js
onRouteMatched: function(oEvent) {
    var sRouteName = oEvent.getParameter("name");

    if (sRouteName === "master") {
        // Master view needs data load
        if (window.SplashScreen) {
            window.SplashScreen.show();
        }

        this.loadMasterData().then(function() {
            if (window.SplashScreen) {
                window.SplashScreen.hide();
            }
        });
    }
}
```

---

## Migráció Útmutató

### Meglévő App Átállítása

**1. Távolítsd el az automatikus splash logikát**
```javascript
// RÉGI - splash-screen.js (v3.1)
// Ez automatikusan indult UI5 load-kor
if (typeof sap !== 'undefined') {
    hideSplashScreen();
}

// ÚJ - splash-screen.js (v3.2)
// Manual control, app hívja a show()-t
console.log('[Splash] Manual control mode');
```

**2. Adj hozzá show/hide hívásokat a Component.js-be**
```javascript
// Component.js
init: function() {
    UIComponent.prototype.init.apply(this, arguments);

    // ADD THIS
    if (window.SplashScreen) {
        window.SplashScreen.show();
    }

    // Your existing data loading
    this.loadData().then(function() {

        // ADD THIS
        if (window.SplashScreen) {
            window.SplashScreen.hide();
        }

    }.bind(this));
}
```

**3. Teszteld az átállítást**
```bash
# Indítsd a szervert
npm start

# Nyisd meg
open http://localhost:8300

# Ellenőrizd a console-t:
# - [Splash] Manual control mode
# - [App] Starting splash screen...
# - [Splash] ✅ Splash screen SHOWN
# - [App] Hiding splash screen...
# - [Splash] Splash screen removed from DOM
```

---

## Összegzés

**v3.2 App-Controlled Splash Előnyei:**

✅ **App Ownership** - App irányítja mikor jelenik meg/tűnik el
✅ **Business Logic Sync** - Splash a VALÓDI adatbetöltésnél van
✅ **Flexible Control** - App dönti el mikor kész
✅ **Error Handling** - App kezeli a hibákat, splash eltűnik
✅ **Router Support** - View navigation-nél is használható
✅ **Clean API** - Egyszerű show/hide/isVisible metódusok

**Használati Esetek:**
- Component init (master data loading)
- Router navigation (view-specific data)
- Lazy loading (module betöltés)
- Long-running operations (batch processing)

**Next Steps:**
- Integráld a WMS app-ba
- Teszteld backend hívásokkal
- Finomhangold az időzítéseket
