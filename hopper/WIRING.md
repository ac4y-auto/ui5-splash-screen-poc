# UI5 Splash Screen POC - Wiring (Mukodesi Folyamat)

## Dokumentum Celja

Ez a dokumentum leirja a modul **belso mukodeset** - hogyan kapcsolodnak ossze a komponensek, milyen sorrendben futnak le a folyamatok, es hogyan kommunikalnak egymassal.

---

## Attekintes

A UI5 Splash Screen POC egy **fiori run** alapu architektuarat hasznal, ahol:
1. **Nincs build lepes** - az `index.html` statikus, kozvetlen a verziokezeloben el
2. **`fiori run`** (a `@sap/ux-ui5-tooling` csomagbol) szolgalja ki az alkalmazast
3. **`fiori-tools-proxy`** middleware oldja fel a `/resources` utvonalat (CDN proxy, backend proxy)
4. **YAML konfigok** vezerlik a kulonbozo modokat (local, CDN, backend)
5. **Smart Start** (`start.js`) automatikusan kezeli a port konfliktusokat

---

## 1. Inditasi Folyamat (Startup Wiring)

### 1.1. Terminal Inditas (npm start)

```
User futtat: npm start
    |
package.json: "start": "npx fiori run --port 8300 --open index.html"
    |
npx fiori run elindul
    |
fiori run = ui5 serve wrapper + fiori-tools-proxy middleware
    |
HTTP server a 8300-as porton
    |
Bongeszo megnyilik: http://localhost:8300/index.html
```

### 1.2. fiori run Mukodese

```
npx fiori run --port 8300 --open index.html [--config ui5-cdn.yaml]
    |
    +-- Beolvassa a YAML konfigot (ui5.yaml / ui5-cdn.yaml / ui5-backend.yaml)
    |
    +-- Elinditja a ui5 serve-ot
    |       |
    |       +-- Statikus fajlokat szolgal ki (webapp: ".")
    |       +-- Manifest, Component.js, view-ok, stb.
    |
    +-- Betolti a customMiddleware-eket a YAML-bol
    |       |
    |       +-- fiori-tools-proxy (ha definialt)
    |               |
    |               +-- /resources --> SAP CDN proxy
    |               +-- /test-resources --> SAP CDN proxy
    |               +-- /sap --> Backend proxy (ha van)
    |
    +-- Megnyitja a bongeszoben: http://localhost:8300/index.html
```

### 1.3. Mod Kivalasztas (YAML Konfigok)

Harom YAML konfig letezik, mindegyik mas mukodesi modot definialt:

```
ui5.yaml (DEFAULT - Local mod)
+-------------------------------------+
| framework:                          |
|   name: SAPUI5                      |
|   version: "1.105.0"               |
|   libraries: [sap.m, sap.ui.core]  |
|                                     |
| server:                             |
|   (nincs customMiddleware)          |
|                                     |
| --> ui5 serve maga oldja fel a      |
|     /resources utvonalat a          |
|     framework konfigbol             |
+-------------------------------------+

ui5-cdn.yaml (CDN mod)
+-------------------------------------+
| framework: ... (azonos)             |
|                                     |
| server:                             |
|   customMiddleware:                 |
|     - fiori-tools-proxy:            |
|         ui5:                        |
|           path: [/resources,        |
|                  /test-resources]   |
|           url: https://sapui5       |
|              .hana.ondemand.com     |
|           version: "1.105.0"       |
|                                     |
| --> fiori-tools-proxy proxyzza a    |
|     /resources kereseket a SAP      |
|     CDN-re                          |
+-------------------------------------+

ui5-backend.yaml (Backend mod)
+-------------------------------------+
| framework: ... (azonos)             |
|                                     |
| server:                             |
|   customMiddleware:                 |
|     - fiori-tools-proxy:            |
|         ui5:                        |
|           path: [/resources, ...]   |
|           url: https://sapui5       |
|              .hana.ondemand.com     |
|           version: "1.105.0"       |
|         backend:                    |
|           - path: /sap              |
|             url: http://192.168     |
|                .1.10:9000           |
|                                     |
| --> CDN proxy + Backend proxy       |
+-------------------------------------+
```

**NPM Script --> YAML Mapping:**

| NPM Script | Parancs | YAML Konfig |
|---|---|---|
| `start` | `npx fiori run --port 8300 --open index.html` | `ui5.yaml` (default) |
| `start:local` | `npx fiori run --port 8300 --open index.html` | `ui5.yaml` (default) |
| `start:cdn` | `npx fiori run --port 8300 --config ui5-cdn.yaml --open index.html` | `ui5-cdn.yaml` |
| `start:backend` | `npx fiori run --port 8300 --config ui5-backend.yaml --open index.html` | `ui5-backend.yaml` |

---

## 2. Runtime Folyamat (Browser Wiring)

### 2.1. HTML Betoltesi Sorrend

```html
<!-- index.html betoltodik -->

1. <head> betoltes
   |
2. splash-screen.css betoltes
   |
   Splash screen megjelenitesi stilusok
   |
3. sap-ui-bootstrap script tag
   <script id="sap-ui-bootstrap"
       src="resources/sap-ui-core.js"
       data-sap-ui-theme="sap_horizon"
       data-sap-ui-libs="sap.m"
       data-sap-ui-async="true"
       data-sap-ui-onInit="module:sap/ui/core/ComponentSupport"
       data-sap-ui-resourceroots='{"myapp": "./"}'>
   </script>
   |
   Bongeszo keri: GET /resources/sap-ui-core.js
   |
   fiori-tools-proxy elfogja es feloldja:
     - Local mod: ui5 serve szolgalja ki a framework-bol
     - CDN mod: proxyzza https://sapui5.hana.ondemand.com/1.105.0/resources/sap-ui-core.js
     - Backend mod: proxyzza a CDN-t (UI5) + backend-et (/sap)
   |
4. ui5-error-handler.js betoltes
   |
   Error + timeout figyelese a bootstrap script-re
   |
5. splash-screen.js betoltes
   |
   window.SplashScreen API regisztracio
   |
6. <body> betoltes
   |
   <div id="splash-screen"> megjelenik (video + poster)
   |
   <div data-sap-ui-component> --> UI5 ComponentSupport feldolgozza
```

### 2.2. UI5 Bootstrap Folyamat (Statikus Script Tag)

```
Bongeszo betolti az index.html-t
    |
<script id="sap-ui-bootstrap" src="resources/sap-ui-core.js" ...>
    |
HTTP keres: GET http://localhost:8300/resources/sap-ui-core.js
    |
fiori run / fiori-tools-proxy fogadja
    |
    +-- Local mod: ui5 serve feloldja a SAPUI5 framework-bol
    |                (node_modules/@ui5 vagy .ui5 cache)
    |
    +-- CDN mod: fiori-tools-proxy proxyzza
    |              https://sapui5.hana.ondemand.com/1.105.0/resources/sap-ui-core.js
    |
    +-- Backend mod: fiori-tools-proxy proxyzza a CDN-t
    |
sap-ui-core.js megerkezett
    |
SAPUI5 inicializalas indul
    |
data-sap-ui-onInit="module:sap/ui/core/ComponentSupport"
    |
ComponentSupport megkeresi a <div data-sap-ui-component>-et
    |
Betolti: myapp.Component (data-name="myapp")
    |
Component.js init() lefut
```

**Fontos kulonbseg a regi architekturától:**

| Regi (build.js) | Uj (fiori run) |
|---|---|
| Dinamikus script tag (ui5-bootstrap.js) | Statikus `<script>` tag az index.html-ben |
| `config.js` + `getCurrentEnv()` | YAML konfig + fiori-tools-proxy |
| `window.UI5_ENVIRONMENT` globalis | Nincs globalis - a proxy transzparensen oldja fel |
| `build.js` generalja az index.html-t | `index.html` statikus, kozvetlenul szerkesztheto |
| `http-server` szolgalja ki | `fiori run` (ui5 serve) szolgalja ki |

### 2.3. Splash Screen Logika (splash-screen.js)

```javascript
// splash-screen.js mukodese - App-Controlled mod

1. DOMContentLoaded Event
   |
   Video playbackRate = 0.2 (5x lassabb)

2. window.SplashScreen API regisztracio
   |
   +-- show()   --> Splash screen megjelenitese
   +-- hide()   --> Splash screen elrejtese (fade-out)
   +-- isVisible() --> Lathatosag lekerdezese

3. NINCS automatikus poller/watchdog!
   Az UI5 alkalmazas (Component.js) iranyitja:

   Component.init()
       |
       SplashScreen.show()          // Splash megjelenik
       |
       loadApplicationData()        // Uzleti adatok betoltese
       |                            // (products, customers, orders, settings)
       |                            // Parhuzamos Promise.all()
       |
       +-- Siker:
       |   SplashScreen.hide(500)   // 500ms fade-out
       |
       +-- Hiba:
           SplashScreen.hide(0)     // Azonnali elrejtes
           MessageBox.error(...)    // Hibauzenet
```

### 2.4. Error Handler Mukodese (ui5-error-handler.js)

```javascript
// ui5-error-handler.js - Ket hibadetekcio

1. Script Error Event
   |
   bootstrapScript.addEventListener('error', ...)
   |
   Ha a sap-ui-core.js NEM toltodik be (halozati hiba, 404, stb.)
   |
   --> onLoadError() meghivasa
   |
   --> Error overlay megjelenites (cimerrel, ujratoltesi gombbal)
   --> SplashScreen.hide(0) meghivasa (ha letezik)

2. Timeout Fallback (15 masodperc)
   |
   setTimeout(function() {
       if (typeof sap === 'undefined') {
           onLoadError('...')
       }
   }, 15000)
   |
   Ha 15 masodperc utan sincs 'sap' globalis objektum
   |
   --> onLoadError() meghivasa
   --> Error overlay megjelenik

3. Sikeres betoltes
   |
   bootstrapScript.addEventListener('load', ...)
   |
   clearTimeout(loadTimeout)
   |
   console.log('[UI5] SAPUI5 script loaded successfully')
```

**Error Overlay tartalma:**
- Cim: "UI5 Betoltesi Hiba"
- Hibauzenet (halozati hiba vagy timeout)
- Forras URL
- "Oldal ujratoltese" gomb
- Technikai reszletek (JSON, kinyithato)
- Lehetseges megoldasok listaja

### 2.5. Teljes Runtime Flow Diagram

```
+-------------------------------------------------------------+
| Browser: index.html betoltes                                 |
+-------------------------------------------------------------+
                         |
+-------------------------------------------------------------+
| 1. splash-screen.css --> Splash stilusok                     |
| 2. sap-ui-bootstrap script tag                               |
|    src="resources/sap-ui-core.js"                            |
| 3. ui5-error-handler.js --> Error + timeout figyeles         |
| 4. splash-screen.js --> SplashScreen API regisztracio        |
+-------------------------------------------------------------+
                         |
         +---------------+---------------+
         |                               |
+---------------------+       +---------------------+
| sap-ui-core.js      |       | <body> rendereles   |
| betoltes             |       |                     |
| (fiori-tools-proxy   |       | #splash-screen      |
|  feloldja)           |       |   video + poster    |
|                     |       |                     |
| Ha HIBA:            |       | data-sap-ui-        |
|  error-handler      |       |   component         |
|  overlay            |       |   (UI5 container)   |
+---------------------+       +---------------------+
         |                               |
         +---------------+---------------+
                         |
+-------------------------------------------------------------+
| SAPUI5 inicializalas                                         |
|                                                              |
| data-sap-ui-onInit = ComponentSupport                        |
| --> <div data-sap-ui-component data-name="myapp">            |
| --> myapp.Component betoltese                                |
+-------------------------------------------------------------+
                         |
+-------------------------------------------------------------+
| Component.init()                                             |
|                                                              |
| 1. SplashScreen.show()  --> Video elindul                    |
| 2. loadApplicationData() --> Promise.all([                   |
|      products (1000ms),                                      |
|      customers (1500ms),                                     |
|      orders (800ms),                                         |
|      settings (500ms)                                        |
|    ])                                                        |
| 3. .then() --> SplashScreen.hide(500)                        |
+-------------------------------------------------------------+
                         |
+-------------------------------------------------------------+
| Splash Screen fade-out animacio (1s CSS transition)          |
|                                                              |
| opacity: 1 --> 0                                             |
| body.loading --> body (class eltavolitva)                    |
+-------------------------------------------------------------+
                         |
+-------------------------------------------------------------+
| Splash Screen eltavolitasa DOM-bol                           |
|                                                              |
| splash.remove()                                              |
+-------------------------------------------------------------+
                         |
+-------------------------------------------------------------+
| UI5 Alkalmazas lathato es hasznalhato                        |
+-------------------------------------------------------------+
```

---

## 3. Kornyezet Specifikus Wiring

### 3.1. Local Mode Wiring (Default)

```
npm start   VAGY   npm run start:local
    |
npx fiori run --port 8300 --open index.html
    |
Beolvassa: ui5.yaml (default)
    |
ui5 serve elindul
    |
Nincs fiori-tools-proxy middleware
    |
GET /resources/sap-ui-core.js
    |
ui5 serve feloldja a SAPUI5 framework-bol:
    - framework.name: SAPUI5
    - framework.version: "1.105.0"
    - Letoltve a ~/.ui5/framework/ cache-be
    |
SAPUI5 betoltodik (local cache-bol)
    |
Component init --> SplashScreen.show()
    |
Adatok betoltese...
    |
SplashScreen.hide(500)
```

### 3.2. CDN Mode Wiring

```
npm run start:cdn
    |
npx fiori run --port 8300 --config ui5-cdn.yaml --open index.html
    |
Beolvassa: ui5-cdn.yaml
    |
ui5 serve + fiori-tools-proxy elindul
    |
fiori-tools-proxy konfig:
    ui5.path: [/resources, /test-resources]
    ui5.url: https://sapui5.hana.ondemand.com
    ui5.version: "1.105.0"
    |
GET /resources/sap-ui-core.js
    |
fiori-tools-proxy elfogja:
    --> Proxy: https://sapui5.hana.ondemand.com/1.105.0/resources/sap-ui-core.js
    |
SAPUI5 betoltodik (CDN-rol proxyzva)
    |
Component init --> SplashScreen.show()
    |
Adatok betoltese...
    |
SplashScreen.hide(500)
```

### 3.3. Backend Mode Wiring

```
npm run start:backend
    |
npx fiori run --port 8300 --config ui5-backend.yaml --open index.html
    |
Beolvassa: ui5-backend.yaml
    |
ui5 serve + fiori-tools-proxy elindul
    |
fiori-tools-proxy konfig:
    ui5.path: [/resources, /test-resources]
    ui5.url: https://sapui5.hana.ondemand.com
    ui5.version: "1.105.0"
    backend:
      - path: /sap
        url: http://192.168.1.10:9000
    |
GET /resources/sap-ui-core.js
    --> Proxy: https://sapui5.hana.ondemand.com/1.105.0/resources/sap-ui-core.js
    |
GET /sap/opu/odata/...
    --> Proxy: http://192.168.1.10:9000/sap/opu/odata/...
    |
SAPUI5 betoltodik (CDN-rol) + Backend adatok elerhetok
    |
Component init --> SplashScreen.show()
    |
Adatok betoltese (valodi backend hivások)
    |
SplashScreen.hide(500)
```

---

## 4. Smart Start Wiring (start.js)

### 4.1. Smart Start Folyamat

```javascript
// start.js mukodese

1. Konfiguráció
   |
   PORT = process.env.PORT || 8300
   PROJECT_MARKER = 'ui5-splash-screen-poc'
   configFile = process.argv[2]  // Opcionalis: 'ui5-cdn.yaml', 'ui5-backend.yaml'

2. Port Ellenorzes
   |
   lsof -ti:8300 -sTCP:LISTEN   (macOS/Linux)
   netstat -ano | findstr :8300  (Windows)
   |
   Visszaadja a PID-et (vagy null ha szabad)

3a. Ha PID letezik --> Process Azonositas
    |
    ps -p ${PID} -o command=     (macOS/Linux)
    wmic process ... CommandLine  (Windows)
    |
    Megnezi hogy tartalmazza-e:
    - "ui5-splash-screen-poc" (PROJECT_MARKER)
    - "fiori" (fiori run process)
    - "ui5 serve"
    |
    Ha PROJEKT processz --> Kill
        kill -9 ${PID}
        Varakozas (max 3 masodperc, polling)
        Port ujra ellenorzes
    |
    Ha MAS processz --> Hiba + Leallas
        "Port is used by another application"
        process.exit(1)

3b. Ha PID === null --> Port szabad

4. fiori run Inditas
   |
   spawn('npx', ['fiori', 'run', '--port', '8300', '--open', 'index.html'])
   |
   Ha configFile letezik:
       spawn('npx', ['fiori', 'run', '--port', '8300',
                      '--config', configFile, '--open', 'index.html'])
   |
   Environment beallitas:
       UI5_SPLASH_PROJECT = 'ui5-splash-screen-poc'
       PORT = '8300'
   |
   stdio: 'inherit' (output a terminalba megy)

5. Process Management
   |
   server.on('error') --> Hiba kiiras + exit
   server.on('exit')  --> Exit code ellenorzes
   SIGINT (Ctrl+C)    --> server.kill('SIGINT') + exit
```

### 4.2. Process Identification Logic

```javascript
// start.js - isProjectProcess() fuggveny

function isProjectProcess(pid) {
    // 3-szintu azonositas

    // 1. Szint: PROJECT_MARKER
    if (cmdLine.includes('ui5-splash-screen-poc')) {
        return true  // Biztos projekt processz
    }

    // 2. Szint: fiori run
    if (cmdLine.includes('fiori')) {
        return true  // Valoszinuleg projekt processz
    }

    // 3. Szint: ui5 serve
    if (cmdLine.includes('ui5 serve')) {
        return true  // Valoszinuleg projekt processz
    }

    // Egyeb: Nem projekt processz
    return false
}
```

**Peldak:**

| Process Command Line | Azonositas | Akcio |
|---|---|---|
| `npx fiori run --port 8300` | Projekt | Kill |
| `node /path/ui5-splash-screen-poc/start.js` | Projekt | Kill |
| `ui5 serve --port 8300` | Projekt | Kill |
| `Google Chrome Helper` | Nem projekt | **NEM** kill |
| `Code Helper (Plugin)` | Nem projekt | **NEM** kill |

### 4.3. Smart Start vs Manual Start

```
+-------------------------------------------------------------+
| Manual Mode (npm start)                                      |
+-------------------------------------------------------------+
| npm start                                                    |
|     |                                                        |
| npx fiori run --port 8300 --open index.html                  |
|     |                                                        |
| Ha port foglalt --> EADDRINUSE HIBA --> Leall                |
+-------------------------------------------------------------+

+-------------------------------------------------------------+
| Smart Start Mode (npm run smart-start)                       |
+-------------------------------------------------------------+
| npm run smart-start                                          |
|     |                                                        |
| node start.js                                                |
|     |                                                        |
| Port ellenorzes --> Kill ha projekt --> fiori run indit       |
+-------------------------------------------------------------+
```

**NPM Script --> Smart Start Mapping:**

| NPM Script | Parancs | Konfig |
|---|---|---|
| `smart-start` | `node start.js` | `ui5.yaml` (default) |
| `smart-start:local` | `node start.js` | `ui5.yaml` (default) |
| `smart-start:cdn` | `node start.js ui5-cdn.yaml` | `ui5-cdn.yaml` |
| `smart-start:backend` | `node start.js ui5-backend.yaml` | `ui5-backend.yaml` |

---

## 5. VSCode Launch Wiring

### 5.1. F5 Launch Folyamat

```json
// .vscode/launch.json (pelda)

{
    "name": "UI5 Splash - CDN Mode (Smart Start)",
    "runtimeExecutable": "npm",
    "runtimeArgs": ["run", "smart-start:cdn"]
}
```

**Folyamat:**

```
User nyom F5-ot VSCode-ban
    |
VSCode kiolvassa a launch.json-t
    |
Kivalasztja: "UI5 Splash - CDN Mode (Smart Start)"
    |
VSCode futtatja:
    npm run smart-start:cdn
    |
    node start.js ui5-cdn.yaml
    |
start.js elindul (lasd: 4.1. Smart Start Folyamat)
    |
    Port ellenorzes
    |
    fiori run --port 8300 --config ui5-cdn.yaml --open index.html
    |
Server elindul
    |
serverReadyAction trigger:
    pattern: "http://localhost:([0-9]+)" detektalva
    |
VSCode automatikusan megnyitja:
    http://localhost:8300/index.html
    |
Bongeszo megnyilik, alkalmazas lathato
```

---

## 6. Edge Case Handling Wiring

### 6.1. UI5 Betoltesi Hiba (Error Handler)

```
SAPUI5 CDN offline VAGY halozati hiba
    |
sap-ui-bootstrap <script> error event
    |
ui5-error-handler.js detektalja
    |
onLoadError() meghivasa
    |
+-- SplashScreen.hide(0) (ha letezik)
|
+-- showErrorOverlay() meghivasa
    |
    Error overlay megjelenik:
    +-----------------------------------+
    | [!] UI5 Betoltesi Hiba            |
    |                                   |
    | A SAPUI5 library nem toltodott    |
    | be (halozati hiba...)             |
    |                                   |
    | Forras: resources/sap-ui-core.js  |
    |                                   |
    | [Oldal ujratoltese]               |
    |                                   |
    | > Technikai reszletek...          |
    | > Lehetseges megoldasok...        |
    +-----------------------------------+
```

### 6.2. UI5 Betoltesi Timeout

```
SAPUI5 betoltese lassu (>15 masodperc)
    |
ui5-error-handler.js timeout trigger
    |
setTimeout(15000) lejart
    |
typeof sap === 'undefined' --> true
    |
onLoadError('...nem toltodott be az elvart idon belul (15 mp).')
    |
Error overlay megjelenik (azonos mint 6.1.)
```

### 6.3. Adatok Betoltesi Hiba (Component.js)

```
Component.init()
    |
SplashScreen.show()
    |
loadApplicationData()
    |
Promise.all([...]) --> REJECT (egy vagy tobb backend hivas sikertelen)
    |
.catch(function(error) {
    |
    SplashScreen.hide(0)        // Azonnali elrejtes
    |
    MessageBox.error(...)       // Hibauzenet dialog
})
```

### 6.4. Port Conflict Handling

```javascript
// start.js - Port used by other app

lsof -ti:8300 -sTCP:LISTEN
    |
Visszaadja: 12345 (Chrome Helper)
    |
isProjectProcess(12345)
    |
cmdLine = "Google Chrome Helper..."
    |
Nem tartalmazza: "ui5-splash-screen-poc"
Nem tartalmazza: "fiori"
Nem tartalmazza: "ui5 serve"
    |
return false
    |
console.error('Port 8300 is used by another application')
console.error('PORT=9000 npm run smart-start')
    |
process.exit(1)
```

### 6.5. Port Release Varakozas

```javascript
// start.js - Port release waiting

if (killProcess(pid)) {
    // Polling loop: max 3 masodperc
    const start = Date.now()
    while (Date.now() - start < 3000) {
        if (!getPortPID(DEFAULT_PORT)) {
            break  // Port szabad!
        }
    }
}
```

**Miert fontos?**

A process kill utan az OS-nek kell ido a port felszabaditasara:
- macOS/Linux: ~100-500ms
- Windows: ~500-1000ms

Nelkule "EADDRINUSE" hibat kapnank.

---

## 7. Fajl Kapcsolatok (File Dependencies)

### 7.1. Dependency Graph

```
ui5.yaml / ui5-cdn.yaml / ui5-backend.yaml
    |
    +-- fiori run beolvassa
    |
    +-- Meghatarozza: milyen middleware-ek futnak
    |   (fiori-tools-proxy konfiguracio)
    |
    +-- Meghatarozza: SAPUI5 framework verzio
        |
        v
index.html (STATIKUS)
    |
    +-- splash-screen.css (stilusok)
    |
    +-- sap-ui-bootstrap script
    |       src="resources/sap-ui-core.js"
    |       |
    |       fiori-tools-proxy feloldja (YAML alapjan)
    |
    +-- ui5-error-handler.js
    |       |
    |       Figyeli a bootstrap script-et
    |       (error event + timeout)
    |
    +-- splash-screen.js
    |       |
    |       window.SplashScreen API
    |
    +-- <body>
            |
            +-- #splash-screen (video + poster)
            +-- data-sap-ui-component
                    |
                    ComponentSupport --> Component.js
                                              |
                                              manifest.json
                                              |
                                              view/App.view.xml
                                              controller/App.controller.js
```

### 7.2. Runtime Dependency Chain

```
1. index.html
   +-> Statikus, standard SAP bootstrap
   +-> src="resources/sap-ui-core.js" (relativ URL)

2. YAML konfig (ui5.yaml / ui5-cdn.yaml / ui5-backend.yaml)
   +-> fiori run beolvassa inditaskor
   +-> Meghatarozza hogyan oldodik fel a /resources utvonal

3. fiori-tools-proxy (ha definialt a YAML-ban)
   +-> Elfogja: /resources, /test-resources kereseket
   +-> Proxyzza: SAP CDN (vagy local cache)
   +-> Elfogja: /sap kereseket (ha backend definialt)
   +-> Proxyzza: Backend szerver

4. ui5-error-handler.js
   +-> Figyeli: #sap-ui-bootstrap script error/load event
   +-> Figyeli: 15 masodperces timeout
   +-> Meghivja: SplashScreen.hide() hiba eseten

5. splash-screen.js
   +-> Regisztralja: window.SplashScreen API
   +-> Varja: Component.js show()/hide() hivasokat

6. Component.js
   +-> Hasznlja: window.SplashScreen.show()
   +-> Betolt: uzleti adatokat (Promise.all)
   +-> Hasznlja: window.SplashScreen.hide()
```

---

## 8. Git Workflow Wiring

### 8.1. Verziokezelt Fajlok

```
+-------------------------------------------------------------+
| VERZIOKEZELT (Git-ben)                                       |
+-------------------------------------------------------------+
| index.html              (STATIKUS - kozvetlenul szerkesztheto)|
| ui5.yaml                (Local mod konfig)                   |
| ui5-cdn.yaml            (CDN mod konfig)                     |
| ui5-backend.yaml        (Backend mod konfig)                 |
| start.js                (SMART START)                        |
| ui5-error-handler.js    (ERROR HANDLER)                      |
| splash-screen.js        (SPLASH LOGIKA)                      |
| splash-screen.css       (STILUSOK)                           |
| Component.js            (UI5 COMPONENT)                      |
| manifest.json           (APP MANIFEST)                       |
| view/App.view.xml       (UI5 VIEW)                           |
| controller/App.ctrl.js  (UI5 CONTROLLER)                     |
| splash-video.mp4        (VIDEO)                              |
| splash-poster.jpeg      (POSTER)                             |
| package.json            (NPM KONFIGURACIO)                   |
+-------------------------------------------------------------+

+-------------------------------------------------------------+
| NEM VERZIOKEZELT (.gitignore-ban)                            |
+-------------------------------------------------------------+
| node_modules/           (NPM fuggosegek)                     |
| .ui5/                   (UI5 framework cache)                |
+-------------------------------------------------------------+
```

**Fontos kulonbseg a regi architekturatol:**

| Regi | Uj |
|---|---|
| `index.html` GENERALT (gitignore) | `index.html` STATIKUS (verziokezelt) |
| `index.template.html` FORRAS | Nincs template - kozvetlenul szerkesztheto |
| `build.js` GENERATOR | Nincs build - nem kell generator |
| `config.js` KONFIG | YAML fajlok vezerlik a modokat |
| `ui5-bootstrap.js` LOGIKA | Nincs - statikus script tag |

### 8.2. Developer Workflow

```
Developer modosit
    |
index.html (kozvetlenul szerkeszti, nincs build)
    |
git add index.html
git commit -m "Update index.html"
    |
git push
    |
Masik developer git pull
    |
npm start
    |
fiori run szolgalja ki az index.html-t
    |
Mindenki ugyanazt a verziót hasznlja
```

---

## 9. Proxy Resolution Wiring (fiori-tools-proxy)

### 9.1. Request Flow CDN Modban

```
Bongeszo keres: GET /resources/sap-ui-core.js
    |
    v
fiori run (Express server, port 8300)
    |
    v
Middleware chain:
    1. compression
    2. fiori-tools-proxy (afterMiddleware: compression)
    3. static file serving (ui5 serve)
    |
    v
fiori-tools-proxy ellenorzi:
    URL eleje = /resources ?  --> IGEN
    |
    v
Proxy keres:
    GET https://sapui5.hana.ondemand.com/1.105.0/resources/sap-ui-core.js
    |
    v
SAP CDN valaszol: 200 OK + sap-ui-core.js tartalom
    |
    v
fiori-tools-proxy tovabbitja a bongeszobe
    |
    v
Bongeszo megkapja a sap-ui-core.js-t
```

### 9.2. Request Flow Backend Modban

```
Bongeszo keres: GET /sap/opu/odata/sap/API_BUSINESS_PARTNER
    |
    v
fiori-tools-proxy ellenorzi:
    URL eleje = /sap ?  --> IGEN (backend konfig)
    |
    v
Proxy keres:
    GET http://192.168.1.10:9000/sap/opu/odata/sap/API_BUSINESS_PARTNER
    |
    v
Backend szerver valaszol: 200 OK + OData valasz
    |
    v
fiori-tools-proxy tovabbitja a bongeszobe
```

### 9.3. Request Flow Local Modban

```
Bongeszo keres: GET /resources/sap-ui-core.js
    |
    v
fiori run (Express server, port 8300)
    |
    v
Middleware chain:
    1. compression
    2. (nincs fiori-tools-proxy)
    3. ui5 serve framework resolution
    |
    v
ui5 serve ellenorzi a YAML framework konfigot:
    name: SAPUI5
    version: "1.105.0"
    |
    v
Feloldja: ~/.ui5/framework/packages/@sapui5/distribution/1.105.0/resources/sap-ui-core.js
    (vagy letolti ha meg nincs cache-elve)
    |
    v
Bongeszo megkapja a sap-ui-core.js-t
```

---

## 10. Teljes Rendszer Flow (End-to-End)

```
+-------------------------------------------------------------+
| 1. INDITAS (Terminal vagy VSCode F5)                         |
|                                                              |
|    npm start                                                 |
|    npm run start:cdn                                         |
|    npm run smart-start:cdn                                   |
+-------------------------------------------------------------+
                         |
+-------------------------------------------------------------+
| 2. SMART START (ha smart-start-ot hasznalunk)                |
|    - Port ellenorzes                                         |
|    - Kill ha projekt processz                                |
|    - Varakozas port felszabadulasra                          |
+-------------------------------------------------------------+
                         |
+-------------------------------------------------------------+
| 3. FIORI RUN                                                 |
|    - YAML konfig beolvasasa                                  |
|    - ui5 serve inditas                                       |
|    - fiori-tools-proxy inicializalas (ha YAML-ban van)       |
|    - HTTP server a 8300-as porton                            |
|    - Bongeszo megnyitasa                                     |
+-------------------------------------------------------------+
                         |
+-------------------------------------------------------------+
| 4. BROWSER LOAD                                              |
|    - index.html betoltes (statikus)                          |
|    - splash-screen.css betoltes                              |
|    - sap-ui-bootstrap script tag feldolgozas                 |
|      GET /resources/sap-ui-core.js                           |
|      (fiori-tools-proxy feloldja)                            |
|    - ui5-error-handler.js betoltes (error + timeout)         |
|    - splash-screen.js betoltes (SplashScreen API)            |
+-------------------------------------------------------------+
                         |
+-------------------------------------------------------------+
| 5. SAPUI5 LOADING                                            |
|    - sap-ui-core.js betoltodott                              |
|    - SAPUI5 inicializalas                                    |
|    - ComponentSupport felismeri data-sap-ui-component-et     |
|    - myapp.Component betoltese                               |
+-------------------------------------------------------------+
                         |
+-------------------------------------------------------------+
| 6. APP INIT + SPLASH                                         |
|    - Component.init() lefut                                  |
|    - SplashScreen.show() --> Video elindul                   |
|    - loadApplicationData() --> Promise.all([...])            |
|    - ~1500ms varakozas (leglassabb backend hivas)            |
+-------------------------------------------------------------+
                         |
+-------------------------------------------------------------+
| 7. SPLASH HIDE                                               |
|    - Adatok betoltodtek                                      |
|    - SplashScreen.hide(500)                                  |
|    - Fade-out animacio (1s CSS transition)                   |
|    - Splash screen DOM eltavolitas                           |
+-------------------------------------------------------------+
                         |
+-------------------------------------------------------------+
| 8. APPLICATION READY                                         |
|    - UI5 alkalmazas lathato                                  |
|    - User interakcio lehetseges                              |
|    - KESZ                                                    |
+-------------------------------------------------------------+
```

---

## Osszefoglalas

A modul egy **2-retegu** architektuarat hasznal:

1. **Server Layer**: `fiori run` + `fiori-tools-proxy` (YAML konfigok vezerlik)
2. **Runtime Layer**: Statikus index.html + App-Controlled Splash Screen + Error Handler

A regi 3-retegu architektura (Build + Runtime + Port Management) leegyszerusodott:
- **Nincs Build Layer** - az index.html statikus, nem kell generalni
- **A YAML konfig** helyettesiti a `config.js` + `build.js` + `window.UI5_ENVIRONMENT` lancot
- **A fiori-tools-proxy** transzparensen oldja fel a `/resources` utvonalat

A komponensek **lazán csatoltak**, de jol definialt interfeszeken kommunikalnak:
- `src="resources/sap-ui-core.js"` --> fiori-tools-proxy feloldja (YAML alapjan)
- `window.SplashScreen` --> App-Controlled API (show/hide/isVisible)
- `bootstrapScript` error/load eventek --> Error overlay
- `data-sap-ui-component` --> UI5 ComponentSupport automatikus betoltes

Ez lehetove teszi a **fuggetlen fejlesztest** es **konnyu bovithetoseget**.
