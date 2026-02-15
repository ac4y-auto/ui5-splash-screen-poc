# Error Handling - UI5 Load Failure

## Dokumentum Célja

Ez a dokumentum leírja hogyan kezeli a modul az **UI5 betöltési hibákat** és milyen user feedback-et ad sikertelen betöltés esetén.

**Verzió:** v3.2
**Implementálva:** 2026-02-15

---

## Probléma Leírása

### Mielőtt (v3.1)

```
User Experience SIKERTELEN betöltéskor:
1. Splash screen látszik (video lejátszás)
2. Alert popup: "Failed to load UI5 from..."
3. User OK-ra kattint
4. Splash TOVÁBBRA IS LÁTSZIK ❌
5. ... 10 másodperc várakozás ...
6. Splash eltűnik (timeout)
7. Üres oldal + console error ❌
```

**Probléma:**
- ❌ Rossz UX: User tudja hogy hiba van, de splash tovább megy
- ❌ 10 másodperc felesleges várakozás
- ❌ Nincs vizuális feedback mi a hiba
- ❌ Nincs actionable javaslat

---

## Megoldás: Error Overlay (v3.2)

### Új Flow

```
User Experience SIKERTELEN betöltéskor:
1. Splash screen látszik (video lejátszás)
2. UI5 betöltés FAIL
3. Splash AZONNAL ELTŰNIK ✅
4. Error Overlay MEGJELENIK ✅
   - Vizuális feedback (⚠️ icon + piros border)
   - Hiba leírás magyarul
   - Forrás megjelenítése (CDN URL)
   - Akciógombok (Újratöltés, Konfig megtekintése)
   - Technikai részletek (expandable)
   - Megoldási javaslatok
5. User tud akciókat végrehajtani ✅
```

---

## Komponensek

### 1. Error Detection (ui5-bootstrap.js)

```javascript
// script.onerror event
script.onerror = function() {
    console.error('[UI5 Bootstrap] Failed to load UI5 from:', config.url);

    // 1. Jelzés: Error flag beállítása
    window.UI5_LOAD_ERROR = true;

    // 2. Splash azonnali eltüntetése
    if (window.SplashScreen && window.SplashScreen.hide) {
        window.SplashScreen.hide(0); // 0 delay = immediate
    }

    // 3. Error overlay megjelenítése
    showErrorOverlay({
        title: 'UI5 Betöltési Hiba',
        message: 'Az UI5 library nem töltődött be...',
        source: config.url,
        environment: config.name,
        technicalDetails: { ... }
    });
};
```

### 2. Splash Screen Error Handling (splash-screen.js)

```javascript
// Polling loop módosítás
var checkUI5Interval = setInterval(function() {
    // Ellenőrzés: Van error?
    if (window.UI5_LOAD_ERROR) {
        clearInterval(checkUI5Interval);
        console.error('[Splash] UI5 load error detected, stopping poller');
        return; // MEGÁLL, nem próbálja tovább
    }

    // Normál UI5 check...
}, 100);

// Timeout módosítás
setTimeout(function() {
    clearInterval(checkUI5Interval);

    // Ha error overlay már megjelent, ne csináljunk semmit
    if (window.UI5_LOAD_ERROR) {
        console.log('[Splash] Timeout but error overlay shown, skipping hide');
        return;
    }

    // Normál timeout kezelés...
}, 10000);
```

### 3. Error Overlay UI (ui5-bootstrap.js)

```javascript
function showErrorOverlay(errorInfo) {
    // 1. Overlay container létrehozása
    var overlay = document.createElement('div');
    overlay.id = 'ui5-load-error-overlay';
    overlay.className = 'error-overlay';

    // 2. HTML content generálás
    overlay.innerHTML = `
        <div class="error-content">
            <div class="error-icon">⚠️</div>
            <h2>${errorInfo.title}</h2>
            <p>${errorInfo.message}</p>

            <!-- Forrás megjelenítése -->
            <div class="error-source">...</div>

            <!-- Akciógombok -->
            <div class="error-actions">
                <button onclick="location.reload()">🔄 Újratöltés</button>
                <button onclick="console.table(window.UI5_CONFIGS)">📋 Konfig</button>
            </div>

            <!-- Technikai részletek (expandable) -->
            <details class="error-details">...</details>

            <!-- Javaslatok -->
            <div class="error-suggestions">...</div>
        </div>
    `;

    // 3. DOM-ba injektálás
    document.body.appendChild(overlay);

    // 4. Fade-in animáció
    setTimeout(function() {
        overlay.classList.add('show');
    }, 10);
}
```

### 4. Error Overlay Styles (splash-screen.css)

```css
/* Error Overlay Container */
.error-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.95);
    z-index: 10001; /* Above splash (9999) */
    opacity: 0;
    transition: opacity 0.3s ease-in;
    backdrop-filter: blur(10px);
}

.error-overlay.show {
    opacity: 1;
}

/* Error Content Box */
.error-content {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    border: 2px solid #ff6b6b;
    border-radius: 12px;
    padding: 40px;
    max-width: 600px;
    box-shadow: 0 20px 60px rgba(255, 107, 107, 0.3);
}

/* Animated Icon */
.error-icon {
    font-size: 64px;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

/* ... további stílusok ... */
```

---

## Error Overlay Elemei

### 1. Error Icon (⚠️)
- **Méret:** 64px
- **Animáció:** Pulse (2s loop)
- **Szín:** Natív emoji sárga

### 2. Title
- **Szöveg:** "UI5 Betöltési Hiba"
- **Szín:** `#ff6b6b` (piros)
- **Font:** 24px, 600 weight

### 3. Message
- **Szöveg:** "Az UI5 library nem töltődött be a következő forrásból:"
- **Szín:** `#ccc` (világosszürke)
- **Font:** 16px

### 4. Error Source Box
- **Background:** Fekete (`rgba(0, 0, 0, 0.4)`)
- **Border-left:** 4px piros
- **Tartalom:**
  - Forrás név (pl. "CDN (SAPUI5)")
  - Teljes URL (`<code>` tag)

### 5. Action Buttons

#### Újratöltés (Primary)
```html
<button class="btn-primary" onclick="location.reload()">
    🔄 Oldal újratöltése
</button>
```
- **Style:** Lila gradient (`#667eea` → `#764ba2`)
- **Hover:** Lift effect (translateY -2px)

#### Konfiguráció (Secondary)
```html
<button class="btn-secondary" onclick="console.table(window.UI5_CONFIGS)">
    📋 Konfiguráció megtekintése
</button>
```
- **Style:** Átlátszó fehér (`rgba(255, 255, 255, 0.1)`)
- **Akció:** Console-ba kiírja az összes UI5_CONFIG-ot

### 6. Technical Details (Expandable)
```html
<details class="error-details">
    <summary>Technikai részletek (kattints a megjelenítéshez)</summary>
    <pre>{
  "environment": "cdn",
  "url": "https://sapui5.hana.ondemand.com/...",
  "error": "Failed to load resource (network error or 404)"
}</pre>
</details>
```
- **Default:** Collapsed (zárt)
- **Kattintásra:** Expandálódik
- **Style:** Zöld console-szerű monospace font

### 7. Suggestions (Megoldási javaslatok)
- **Background:** Sárga tint (`rgba(255, 193, 7, 0.1)`)
- **Border-left:** 4px sárga
- **Tartalom:**
  - Internet kapcsolat ellenőrzése
  - Másik mód kipróbálása (Local/Backend)
  - Backend elérhetőség check
  - Console check (F12)

---

## Hibatípusok és Megjelenítés

### 1. CDN Unavailable (404/Network Error)

**Példa scenario:**
- SAP CDN offline
- Internet kapcsolat megszakadt
- Firewall blokkolja

**Error info:**
```javascript
{
    title: 'UI5 Betöltési Hiba',
    environment: 'CDN (SAPUI5)',
    source: 'https://sapui5.hana.ondemand.com/resources/sap-ui-core.js',
    error: 'Failed to load resource (network error or 404)'
}
```

**Javaslat:**
- Ellenőrizd az internet kapcsolatot
- Próbáld meg Local Mode-ot

---

### 2. Backend Server Offline

**Példa scenario:**
- Backend szerver (192.168.1.10:9000) nem elérhető
- Backend mode használatakor

**Error info:**
```javascript
{
    title: 'UI5 Betöltési Hiba',
    environment: 'Backend (192.168.1.10:9000)',
    source: 'http://192.168.1.10:9000/resources/sap-ui-core.js',
    error: 'Failed to load resource (network error or 404)'
}
```

**Javaslat:**
- Ellenőrizd a backend szerver elérhetőségét
- Ping 192.168.1.10
- Próbáld meg CDN vagy Local mode-ot

---

### 3. CORS Error (Hybrid Mode)

**Példa scenario:**
- Proxy nincs beállítva
- Hybrid mode használatakor CORS hiba

**Error info:**
```javascript
{
    title: 'UI5 Betöltési Hiba',
    environment: 'Hybrid (Local Proxy)',
    source: '/backend-proxy/resources/sap-ui-core.js',
    error: 'Failed to load resource (CORS policy)'
}
```

**Javaslat:**
- Ellenőrizd a proxy konfigurációt
- Nézd meg a HYBRID_MODE_GUIDE.md-t
- Próbáld meg Backend mode-ot közvetlenül

---

## Tesztelés

### Manual Test - Invalid URL

**Test file:** `test-error-overlay.html`

```html
<script>
    // Force error by using invalid URL
    UI5_CONFIGS.cdn.url = 'https://invalid-url.example.com/sap-ui-core.js';
</script>
<script src="ui5-bootstrap.js"></script>
```

**Futtatás:**
```bash
# 1. Indítsd a szervert
npm start

# 2. Nyisd meg a test oldalt
open http://localhost:8300/test-error-overlay.html

# 3. Várható eredmény:
# - Splash screen megjelenik
# - ~1s múlva UI5 betöltés FAIL
# - Splash AZONNAL eltűnik
# - Error overlay MEGJELENIK
```

### Automated Test (Cypress)

```javascript
// cypress/e2e/error-overlay.cy.js

describe('Error Overlay', () => {
    it('should show error overlay when UI5 fails to load', () => {
        cy.visit('/test-error-overlay.html');

        // Splash screen megjelenik
        cy.get('#splash-screen').should('be.visible');

        // Error overlay megjelenik (max 3s)
        cy.get('.error-overlay', { timeout: 3000 })
            .should('be.visible')
            .and('have.class', 'show');

        // Splash screen eltűnt
        cy.get('#splash-screen').should('not.exist');

        // Error overlay tartalom ellenőrzése
        cy.get('.error-content h2')
            .should('contain', 'UI5 Betöltési Hiba');

        cy.get('.error-source code')
            .should('contain', 'invalid-url.example.com');

        // Akciógombok láthatóak
        cy.get('.btn-primary').should('contain', 'Újratöltés');
        cy.get('.btn-secondary').should('contain', 'Konfiguráció');
    });

    it('should reload page when clicking reload button', () => {
        cy.visit('/test-error-overlay.html');

        cy.get('.error-overlay', { timeout: 3000 }).should('be.visible');

        // Spy on window.location.reload
        cy.window().then((win) => {
            cy.stub(win.location, 'reload').as('reload');
        });

        cy.get('.btn-primary').click();
        cy.get('@reload').should('be.called');
    });
});
```

---

## User Flows

### Flow 1: Error → Reload

```
1. User látja az error overlay-t
2. Megérti mi a probléma (CDN offline)
3. Kattint: "🔄 Oldal újratöltése"
4. Oldal újratölt
5a. Ha CDN visszajött → ✅ Sikeres betöltés
5b. Ha CDN még mindig offline → Error overlay újra
```

### Flow 2: Error → Config Check → Mode Switch

```
1. User látja az error overlay-t
2. Kattint: "📋 Konfiguráció megtekintése"
3. Console megnyílik, látja az összes mode-ot
4. Bezárja az overlay-t (ESC vagy kívülre kattintás)
5. URL-ben módosít: ?env=local
6. Oldal újratölt Local mode-ban
7. ✅ Sikeres betöltés (local UI5)
```

### Flow 3: Error → Technical Details → Debug

```
1. User látja az error overlay-t
2. Kattint: "Technikai részletek" (expandable)
3. Látja a JSON részleteket:
   - environment: "cdn"
   - url: "https://..."
   - error: "Failed to load resource"
4. Megérti hogy CDN hiba
5. Megoldja a problémát (VPN, internet)
6. Kattint: "🔄 Oldal újratöltése"
7. ✅ Sikeres betöltés
```

---

## Architektúra Változások

### Signal Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ UI5 Bootstrap (ui5-bootstrap.js)                    │
└─────────────────────────────────────────────────────┘
                    ↓
        script.onerror() trigger
                    ↓
        ┌───────────────────────┐
        │ window.UI5_LOAD_ERROR │ = true
        └───────────────────────┘
                    ↓
        ┌───────────────────────────────────────┐
        │ window.SplashScreen.hide(0)           │
        │ (Splash azonnali eltüntetés)          │
        └───────────────────────────────────────┘
                    ↓
        ┌───────────────────────────────────────┐
        │ showErrorOverlay(errorInfo)           │
        │ (Error overlay megjelenítés)          │
        └───────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ Splash Screen (splash-screen.js)                    │
│ - Poller detektálja: window.UI5_LOAD_ERROR         │
│ - Poller LEÁLL                                      │
│ - Timeout SKIPELI a hide-ot                        │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ DOM State                                           │
│ ❌ #splash-screen (REMOVED)                         │
│ ✅ .error-overlay (VISIBLE)                         │
└─────────────────────────────────────────────────────┘
```

---

## Verziókezelés

| Verzió | Dátum | Módosítás |
|--------|-------|-----------|
| v3.1 | 2026-02-14 | Alert popup megoldás (rossz UX) |
| v3.2 | 2026-02-15 | Error overlay implementálva |

---

## Függőségek

| Fájl | Módosítás | Verzió |
|------|-----------|--------|
| ui5-bootstrap.js | Error detection + overlay | v3.2 |
| splash-screen.js | Error flag check | v3.2 |
| splash-screen.css | Error overlay styles | v3.2 |
| test-error-overlay.html | Manual test | v3.2 |

---

## Következő Lépések (v3.3+)

### Javaslat 1: Retry Mechanizmus
```javascript
// Auto-retry with exponential backoff
var retryCount = 0;
var maxRetries = 3;

function retryUI5Load() {
    if (retryCount < maxRetries) {
        var delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(function() {
            retryCount++;
            console.log('[UI5 Bootstrap] Retry attempt', retryCount);
            location.reload();
        }, delay);
    } else {
        showErrorOverlay(...);
    }
}
```

### Javaslat 2: Fallback CDN
```javascript
// Try alternative CDN if primary fails
var cdnFallbacks = [
    'https://sapui5.hana.ondemand.com/...',
    'https://openui5.hana.ondemand.com/...',
    '/vendor/sapui5/sap-ui-core.js'  // Local vendored copy
];

var currentCDNIndex = 0;

script.onerror = function() {
    currentCDNIndex++;
    if (currentCDNIndex < cdnFallbacks.length) {
        console.log('[UI5 Bootstrap] Trying fallback CDN', currentCDNIndex);
        script.src = cdnFallbacks[currentCDNIndex];
    } else {
        showErrorOverlay(...);
    }
};
```

### Javaslat 3: Error Reporting (Analytics)
```javascript
// Send error to analytics
script.onerror = function() {
    if (window.gtag) {
        gtag('event', 'ui5_load_error', {
            environment: env,
            url: config.url,
            userAgent: navigator.userAgent
        });
    }

    showErrorOverlay(...);
};
```

---

## Összegzés

**v3.2 Error Handling Jellemzői:**

✅ **Azonnali Feedback** - Splash eltűnik hibánál, nem 10s várakozás
✅ **Vizuális Error State** - Szép error overlay (nem alert popup)
✅ **Actionable UI** - Gombok: Reload, Config check
✅ **Technical Details** - Expandable JSON debug info
✅ **User Suggestions** - Konkrét megoldási javaslatok
✅ **Tesztelhető** - test-error-overlay.html test file
✅ **Dokumentált** - Teljes flow és komponens leírás

**User Impact:**
- Jobb UX betöltési hiba esetén
- Nem "elakad" a splash screenen
- Gyorsabban megérti mi a probléma
- Tud akciókat végrehajtani (reload, config check)
