# Error Handling - UI5 Load Failure

## Dokumentum Celja

Ez a dokumentum leirja hogyan kezeli a modul az **UI5 betoltesi hibakat** es milyen user feedback-et ad sikertelen betoltes eseten.

**Verzio:** v4.0
**Implementalva:** 2026-02-15

---

## Problema Leirasa

### Mielott (v3.1)

```
User Experience SIKERTELEN betolteskor:
1. Splash screen latszik (video lejatszas)
2. Alert popup: "Failed to load UI5 from..."
3. User OK-ra kattint
4. Splash TOVABBRA IS LATSZIK
5. ... 10 masodperc varakozas ...
6. Splash eltunik (timeout)
7. Ures oldal + console error
```

**Problema:**
- Rossz UX: User tudja hogy hiba van, de splash tovabb megy
- 10 masodperc felesleges varakozas
- Nincs vizualis feedback mi a hiba
- Nincs actionable javaslat

---

## Megoldas: Error Overlay (v4.0)

### Uj Flow

```
User Experience SIKERTELEN betolteskor:
1. Splash screen latszik (video lejatszas)
2. UI5 betoltes FAIL (script error VAGY 15s timeout)
3. Splash AZONNAL ELTUNIK
4. Error Overlay MEGJELENIK
   - Vizualis feedback (warning icon + piros border)
   - Hiba leiras magyarul
   - Forras megjelenitese (resources/sap-ui-core.js URL)
   - Akciogombok (Ujratoltes)
   - Technikai reszletek (expandable)
   - Megoldasi javaslatok
5. User tud akciokat vegrehajtani
```

---

## Komponensek

### 1. Error Detection (ui5-error-handler.js)

Az error detection a `ui5-error-handler.js` fajlban van implementalva. Ket mechanizmussal detektalja a hibat:

**A) Script error event** - azonnali hiba (404, halozati hiba):

```javascript
var bootstrapScript = document.getElementById('sap-ui-bootstrap');

bootstrapScript.addEventListener('error', function() {
    clearTimeout(loadTimeout);
    onLoadError('A SAPUI5 library nem toltodott be (halozati hiba vagy nem elerheto forras).');
});
```

**B) 15 masodperces timeout** - ha UI5 nem toltodik be ido alatt:

```javascript
var LOAD_TIMEOUT_MS = 15000; // 15 seconds

var loadTimeout = setTimeout(function() {
    if (typeof sap === 'undefined') {
        onLoadError('A SAPUI5 library nem toltodott be az elvart idon belul (15 mp).');
    }
}, LOAD_TIMEOUT_MS);
```

**C) Load success** - timeout torles sikeres betoltes utan:

```javascript
bootstrapScript.addEventListener('load', function() {
    clearTimeout(loadTimeout);
    console.log('[UI5] SAPUI5 script loaded successfully');
});
```

### 2. Error Handler (ui5-error-handler.js)

```javascript
function onLoadError(message) {
    console.error('[UI5] ' + message);

    // 1. Splash azonnali eltuntetese
    if (window.SplashScreen && window.SplashScreen.hide) {
        window.SplashScreen.hide(0); // 0 delay = immediate
    }

    // 2. Error overlay megjelenitese
    showErrorOverlay({
        title: 'UI5 Betoltesi Hiba',
        message: message,
        source: bootstrapScript.src,
        technicalDetails: {
            url: bootstrapScript.src,
            error: message
        }
    });
}
```

### 3. Splash Screen Error Handling (splash-screen.js)

```javascript
// Polling loop - nem valtozik, az error handler kozvetlenul
// hivja a SplashScreen.hide(0)-t, igy a splash azonnal eltunik.
```

### 4. Error Overlay UI (ui5-error-handler.js)

```javascript
function showErrorOverlay(errorInfo) {
    // 1. Overlay container letrehozasa
    var overlay = document.createElement('div');
    overlay.id = 'ui5-load-error-overlay';
    overlay.className = 'error-overlay';

    // 2. HTML content generalas
    overlay.innerHTML =
        '<div class="error-content">' +
            '<div class="error-icon">warning</div>' +
            '<h2>' + errorInfo.title + '</h2>' +
            '<p>' + errorInfo.message + '</p>' +

            // Forras megjelenitese
            '<div class="error-source">' +
                '<strong>Forras:</strong>' +
                '<code>' + errorInfo.source + '</code>' +
            '</div>' +

            // Akciogombok
            '<div class="error-actions">' +
                '<button class="btn-primary" onclick="location.reload()">' +
                    'Oldal ujratoltese' +
                '</button>' +
            '</div>' +

            // Technikai reszletek (expandable)
            '<details class="error-details">' +
                '<summary>Technikai reszletek</summary>' +
                '<pre>' + JSON.stringify(errorInfo.technicalDetails, null, 2) + '</pre>' +
            '</details>' +

            // Javaslatok
            '<div class="error-suggestions">' +
                '<h3>Lehetseges megoldasok:</h3>' +
                '<ul>' +
                    '<li>Ellenorizd az internet kapcsolatot</li>' +
                    '<li>Ellenorizd, hogy a fejlesztoi szerver fut-e (fiori run)</li>' +
                    '<li>Nezd meg a konzolt tovabbi hibakert (F12)</li>' +
                '</ul>' +
            '</div>' +
        '</div>';

    // 3. DOM-ba injektalas
    document.body.appendChild(overlay);

    // 4. Fade-in animacio
    setTimeout(function() {
        overlay.classList.add('show');
    }, 10);
}
```

### 5. Error Overlay Styles (splash-screen.css)

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

/* ... tovabbi stilusok ... */
```

---

## Error Overlay Elemei

### 1. Error Icon
- **Animacio:** Pulse (2s loop)

### 2. Title
- **Szoveg:** "UI5 Betoltesi Hiba"
- **Szin:** `#ff6b6b` (piros)
- **Font:** 24px, 600 weight

### 3. Message
- **Szoveg:** Az aktualis hibauzenet (script error vagy timeout)
- **Szin:** `#ccc` (vilagosszurke)
- **Font:** 16px

### 4. Error Source Box
- **Background:** Fekete (`rgba(0, 0, 0, 0.4)`)
- **Border-left:** 4px piros
- **Tartalom:**
  - Source URL (a `sap-ui-bootstrap` script `src` attributuma)
  - Teljes URL (`<code>` tag)

### 5. Action Buttons

#### Ujratoltes (Primary)
```html
<button class="btn-primary" onclick="location.reload()">
    Oldal ujratoltese
</button>
```
- **Style:** Lila gradient (`#667eea` -> `#764ba2`)
- **Hover:** Lift effect (translateY -2px)

> **Megjegyzes:** v4.0-ban mar nincs "Konfiguracio megtekintese" gomb, mert
> a korabbi `window.UI5_CONFIGS` es environment rendszer megszunt.
> A konfiguracio most a yaml fajlokban van (ui5.yaml / ui5-cdn.yaml / ui5-backend.yaml).

### 6. Technical Details (Expandable)
```html
<details class="error-details">
    <summary>Technikai reszletek</summary>
    <pre>{
  "url": "http://localhost:8300/resources/sap-ui-core.js",
  "error": "A SAPUI5 library nem toltodott be..."
}</pre>
</details>
```
- **Default:** Collapsed (zart)
- **Kattintasra:** Expandalodik
- **Style:** Zold console-szeru monospace font

### 7. Suggestions (Megoldasi javaslatok)
- **Background:** Sarga tint (`rgba(255, 193, 7, 0.1)`)
- **Border-left:** 4px sarga
- **Tartalom:**
  - Internet kapcsolat ellenorzese
  - Fejlesztoi szerver futasanak ellenorzese (fiori run)
  - Console check (F12)

---

## Hibatipusok es Megjelenitesuk

### 1. Script Error (404/Network Error)

**Pelda scenario:**
- fiori run nem fut, nincs szerver
- Halozati hiba
- CDN nem elerheto (ui5-cdn.yaml hasznalatakor)

**Error info:**
```javascript
{
    title: 'UI5 Betoltesi Hiba',
    message: 'A SAPUI5 library nem toltodott be (halozati hiba vagy nem elerheto forras).',
    source: 'http://localhost:8300/resources/sap-ui-core.js',
    technicalDetails: {
        url: 'http://localhost:8300/resources/sap-ui-core.js',
        error: '...'
    }
}
```

**Javaslat:**
- Ellenorizd az internet kapcsolatot
- Inditsd el a fiori run szervert

---

### 2. Timeout (15 masodperc)

**Pelda scenario:**
- Lassú halozat
- CDN valaszol de nagyon lassan
- Reszleges betoltes utan befagy

**Error info:**
```javascript
{
    title: 'UI5 Betoltesi Hiba',
    message: 'A SAPUI5 library nem toltodott be az elvart idon belul (15 mp).',
    source: 'http://localhost:8300/resources/sap-ui-core.js',
    technicalDetails: {
        url: 'http://localhost:8300/resources/sap-ui-core.js',
        error: '...'
    }
}
```

**Javaslat:**
- Ellenorizd a halozati sebesseg
- Probald ujra

---

### 3. Backend Server Offline (ui5-backend.yaml modban)

**Pelda scenario:**
- Backend szerver (192.168.1.10:9000) nem elerheto
- fiori-tools-proxy nem tudja proxyzni a /resources utvonalat

**Javaslat:**
- Ellenorizd a backend szerver elerhetoseget
- Probald meg CDN vagy Local mode-ot (ui5-cdn.yaml vagy ui5.yaml)

---

## Teszteles

### Manual Test - Invalid URL

**Test file:** `test-error-overlay.html`

**Futtatas:**
```bash
# 1. Inditsd a szervert
npm start

# 2. Nyisd meg a test oldalt
open http://localhost:8300/test-error-overlay.html

# 3. Varhato eredmeny:
# - Splash screen megjelenik
# - ~1s mulva UI5 betoltes FAIL (script error)
# - Splash AZONNAL eltunik
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

        // Splash screen eltunt
        cy.get('#splash-screen').should('not.exist');

        // Error overlay tartalom ellenorzese
        cy.get('.error-content h2')
            .should('contain', 'UI5 Betoltesi Hiba');

        // Akciogombok lathatoek
        cy.get('.btn-primary').should('contain', 'Ujratoltes');
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

### Flow 1: Error -> Reload

```
1. User latja az error overlay-t
2. Megeri mi a problema (szerver nem fut)
3. Kattint: "Oldal ujratoltese"
4. Oldal ujratolt
5a. Ha szerver fut -> Sikeres betoltes
5b. Ha szerver meg nem fut -> Error overlay ujra
```

### Flow 2: Error -> Technical Details -> Debug

```
1. User latja az error overlay-t
2. Kattint: "Technikai reszletek" (expandable)
3. Latja a JSON reszleteket:
   - url: "http://localhost:8300/resources/sap-ui-core.js"
   - error: "..."
4. Megeri hogy szerver/CDN hiba
5. Megoldja a problemat (szerver inditas, halozat)
6. Kattint: "Oldal ujratoltese"
7. Sikeres betoltes
```

---

## Architektura Valtozasok (v3.2 -> v4.0)

### Fontos Kulonbsegek

| Jellemzo | v3.2 (regi) | v4.0 (uj) |
|----------|-------------|------------|
| **Error detection fajl** | `ui5-bootstrap.js` | `ui5-error-handler.js` |
| **Detection mechanizmus** | Csak script.onerror | script error event + 15s timeout |
| **Environment info** | `config.name`, `config.url` | Nincs - csak `bootstrapScript.src` |
| **Config button** | Van (console.table) | Nincs (yaml-bol jon a config) |
| **Error overlay source** | Environment nev + URL | Csak URL |
| **UI5 config rendszer** | `window.UI5_CONFIGS` + `window.UI5_ENVIRONMENT` | Nincs - yaml fajlok + fiori-tools-proxy |

### Signal Flow Diagram (v4.0)

```
+---------------------------------------------------------+
| index.html                                              |
|   <script src="resources/sap-ui-core.js">               |
|   <script src="ui5-error-handler.js">                   |
+---------------------------------------------------------+
                    |
        ui5-error-handler.js
        Listens on:
          1. bootstrapScript 'error' event
          2. 15 second setTimeout
                    |
        +-------------------------------+
        | script error OR timeout       |
        +-------------------------------+
                    |
        +-------------------------------+
        | onLoadError(message)          |
        |   - SplashScreen.hide(0)      |
        |   - showErrorOverlay(...)     |
        +-------------------------------+
                    |
+---------------------------------------------------------+
| DOM State                                               |
|   #splash-screen (HIDDEN)                               |
|   .error-overlay (VISIBLE)                              |
+---------------------------------------------------------+
```

---

## Verziokkezeles

| Verzio | Datum | Modositas |
|--------|-------|-----------|
| v3.1 | 2026-02-14 | Alert popup megoldas (rossz UX) |
| v3.2 | 2026-02-15 | Error overlay implementalva (ui5-bootstrap.js) |
| v4.0 | 2026-02-15 | Migracio ui5-error-handler.js-re, fiori run architektura |

---

## Fuggosegek

| Fajl | Szerepe | Verzio |
|------|---------|--------|
| ui5-error-handler.js | Error detection + overlay | v4.0 |
| splash-screen.js | Splash API (SplashScreen.hide hivas) | v4.0 |
| splash-screen.css | Error overlay styles | v3.2+ |
| test-error-overlay.html | Manual test | v3.2+ |

**Torolve v4.0-ban:**
- `ui5-bootstrap.js` - Korabban ez tartalmazta az error detection-t es overlay-t
- `config.js` - Korabban ez tartalmazta az environment konfigot (UI5_CONFIGS)

---

## Kovetkezo Lepesek (v4.1+)

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
            console.log('[UI5] Retry attempt', retryCount);
            location.reload();
        }, delay);
    } else {
        showErrorOverlay(...);
    }
}
```

### Javaslat 2: Error Reporting (Analytics)
```javascript
// Send error to analytics
bootstrapScript.addEventListener('error', function() {
    if (window.gtag) {
        gtag('event', 'ui5_load_error', {
            url: bootstrapScript.src,
            userAgent: navigator.userAgent
        });
    }
    onLoadError('...');
});
```

---

## Osszegzes

**v4.0 Error Handling Jellemzoi:**

- **Azonnali Feedback** - Splash eltunik hibanal, nem 10s varakozas
- **Ket detekcios mechnizmus** - Script error event + 15 masodperces timeout
- **Vizualis Error State** - Szep error overlay (nem alert popup)
- **Actionable UI** - Reload gomb
- **Technical Details** - Expandable JSON debug info
- **User Suggestions** - Konkret megoldasi javaslatok
- **Tesztelheto** - test-error-overlay.html test file
- **Dokumentalt** - Teljes flow es komponens leiras

**v3.2-rol v4.0-ra valo atallasnali fontos valtozasok:**
- Error detection athelyezve `ui5-bootstrap.js`-bol `ui5-error-handler.js`-be
- Nincs tobb environment/config hivatkozas az error overlay-ben
- Nincs "Konfiguracio megtekintese" gomb (nem letezik mar UI5_CONFIGS)
- Timeout hozzaadva (15 masodperc) a script error event melle

**User Impact:**
- Jobb UX betoltesi hiba eseten
- Nem "elakad" a splash screenen
- Gyorsabban megeri mi a problema
- Tud akciokat vegrehajtani (reload, debug)
