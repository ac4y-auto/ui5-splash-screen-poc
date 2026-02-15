# UI5 Splash Screen POC - Wiring (Működési Folyamat)

## Dokumentum Célja

Ez a dokumentum leírja a modul **belső működését** - hogyan kapcsolódnak össze a komponensek, milyen sorrendben futnak le a folyamatok, és hogyan kommunikálnak egymással.

---

## Áttekintés

A UI5 Splash Screen POC egy **build-based** architektúrát használ, ahol:
1. **Build időben** eldől melyik környezet (CDN/Local/Backend/Hybrid) fog futni
2. **Runtime-ban** a splash screen kezeli a betöltési folyamatot
3. **Smart Start** automatikusan kezeli a port konfliktusokat

---

## 1. Indítási Folyamat (Startup Wiring)

### 1.1. Terminal Indítás (npm start)

```
User futtat: npm start
    ↓
package.json: "start": "npm run smart-start:cdn"
    ↓
package.json: "smart-start:cdn": "node start.js cdn"
    ↓
start.js elindul
```

### 1.2. Smart Start Folyamat

```javascript
// start.js működése

1. Port Ellenőrzés
   ↓
   lsof -ti:8300 -sTCP:LISTEN
   ↓
   Visszaadja a PID-et (vagy null ha szabad)

2. Ha PID létezik → Process Azonosítás
   ↓
   ps -p ${PID} -o command=
   ↓
   Megnézi hogy tartalmazza-e:
   - "ui5-splash-screen-poc" (PROJECT_MARKER)
   - "http-server"
   - "ui5 serve"

3a. Ha PROJEKT processz → Kill
    ↓
    kill -9 ${PID}  (macOS/Linux)
    taskkill /PID ${PID} /F  (Windows)
    ↓
    Várakozás a port felszabadulására

3b. Ha MÁS processz → Hiba + Leállás
    ↓
    console.error("Port is used by another application")
    process.exit(1)

4. Build Futtatás
   ↓
   execSync('node build.js cdn')
   ↓
   index.html generálás

5. Server Indítás
   ↓
   spawn('npm', ['run', 'serve:cdn'])
   ↓
   http-server elindul a 8300-as porton
```

### 1.3. Build Folyamat (build.js)

```javascript
// build.js működése

1. Környezet Olvasás
   env = process.argv[2] || 'cdn'  // cdn, local, backend, hybrid

2. Template Beolvasás
   ↓
   fs.readFileSync('index.template.html')
   ↓
   Tartalom memóriában

3. Placeholder Csere
   ↓
   {{ENV_INJECTION}} → <script>window.UI5_ENVIRONMENT = 'cdn';</script>

4. index.html Generálás
   ↓
   fs.writeFileSync('index.html', generatedContent)
   ↓
   ✅ index.html létrejött
```

**Példa Environment Injection:**

```html
<!-- ELŐTTE (index.template.html) -->
{{ENV_INJECTION}}

<!-- UTÁNA (index.html) -->
<script>window.UI5_ENVIRONMENT = 'cdn';</script>
```

---

## 2. Runtime Folyamat (Browser Wiring)

### 2.1. HTML Betöltési Sorrend

```html
<!-- index.html betöltődik -->

1. <head> betöltés
   ↓
2. Environment Injection Script
   <script>window.UI5_ENVIRONMENT = 'cdn';</script>
   ↓
   window.UI5_ENVIRONMENT = 'cdn' (globális változó)

3. config.js betöltés
   ↓
   UI5_CONFIG objektum létrehozása
   getCurrentEnv() függvény definiálása

4. splash-screen.css betöltés
   ↓
   Splash screen megjelenítési stílusok

5. ui5-bootstrap.js betöltés
   ↓
   UI5 dinamikus betöltése

6. splash-screen.js betöltés
   ↓
   Splash screen logika inicializálása

7. <body> betöltés
   ↓
   <div id="splash-screen"> megjelenik
   ↓
   Video lejátszás indul
```

### 2.2. UI5 Bootstrap Folyamat (ui5-bootstrap.js)

```javascript
// ui5-bootstrap.js működése

1. Környezet Kiolvasás
   ↓
   const currentEnv = getCurrentEnv()  // 'cdn' (config.js-ből)

2. Konfiguráció Lekérés
   ↓
   const config = UI5_CONFIG[currentEnv]
   // { name: 'CDN (SAPUI5)', url: 'https://sapui5.hana.ondemand.com/...' }

3. Script Tag Létrehozása
   ↓
   const script = document.createElement('script')
   script.src = config.url
   script.id = 'sap-ui-bootstrap'
   script.setAttribute('data-sap-ui-libs', 'sap.m, sap.ui.core')
   script.setAttribute('data-sap-ui-theme', 'sap_horizon')

4. Event Listener Felállítása
   ↓
   script.onload = () => {
       window.UI5_LOADED = true  // ✅ Sikeres betöltés jelzése
       console.log('[UI5] Loaded from:', config.name)
   }

   script.onerror = () => {
       window.UI5_LOAD_ERROR = true  // ❌ Hiba jelzése
       console.error('[UI5] Failed to load')
   }

5. DOM-ba Injektálás
   ↓
   document.head.appendChild(script)
   ↓
   Böngésző elkezdi letölteni a UI5 library-t
```

### 2.3. Splash Screen Logika (splash-screen.js)

```javascript
// splash-screen.js működése - PÁRHUZAMOSAN fut az UI5 betöltéssel

1. DOMContentLoaded Event
   ↓
   document.addEventListener('DOMContentLoaded', function() {...})

2. Watchdog Timer Indítása
   ↓
   setTimeout(function() {
       if (document.getElementById('splash-screen')) {
           console.warn('[Splash] UI5 init timeout')
           hideSplashScreen(0)  // 10 másodperc után kényszerített eltüntetés
       }
   }, 10000)

3. UI5 Init Poller Indítása
   ↓
   const checkUI5Interval = setInterval(function() {
       checkUI5Ready()
   }, 100)  // Minden 100ms-ben ellenőrzi

4. UI5 Ready Ellenőrzés (checkUI5Ready)
   ↓
   if (window.sap && window.sap.ui && window.sap.ui.getCore) {
       const core = sap.ui.getCore()

       if (core.isInitialized()) {
           ✅ UI5 betöltődött
           ↓
           clearInterval(checkUI5Interval)  // Poller leállítása
           ↓
           hideSplashScreen(500)  // 500ms fade-out animáció
       }
   }

5. Splash Screen Eltüntetés
   ↓
   function hideSplashScreen(delay) {
       setTimeout(function() {
           const splash = document.getElementById('splash-screen')
           splash.classList.add('hidden')  // CSS transition: opacity 0.5s

           setTimeout(function() {
               document.body.classList.remove('loading')
               splash.remove()  // DOM-ból eltávolítás
           }, 500)  // Várunk az animáció végére
       }, delay)
   }
```

### 2.4. Teljes Runtime Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Browser: index.html betöltés                                │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. window.UI5_ENVIRONMENT = 'cdn'  (injected)              │
│ 2. config.js → UI5_CONFIG objektum                         │
│ 3. splash-screen.css → stílusok                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
         ┌───────────────┴───────────────┐
         ↓                               ↓
┌─────────────────────┐       ┌─────────────────────┐
│ ui5-bootstrap.js    │       │ splash-screen.js    │
│                     │       │                     │
│ - Script tag        │       │ - Video lejátszás   │
│   létrehozás        │       │ - Watchdog timer    │
│ - UI5 letöltés      │       │ - UI5 init poller   │
│   indítás           │       │   (100ms)           │
└─────────────────────┘       └─────────────────────┘
         ↓                               ↓
         │                    ┌──────────┘
         │                    │ Ellenőrzés: UI5 betöltődött?
         │                    │
         ↓                    ↓
┌─────────────────────────────────────────────────────────────┐
│ UI5 Library betöltődik (CDN-ről/Local/Backend)             │
│ window.sap.ui.getCore().isInitialized() → true             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ splash-screen.js detektálja: ✅ UI5 kész                    │
│                                                             │
│ - Poller leáll (clearInterval)                              │
│ - Watchdog leáll (clearTimeout)                             │
│ - hideSplashScreen(500) meghívódik                          │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Splash Screen fade-out animáció (0.5s)                     │
│                                                             │
│ opacity: 1 → 0                                              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Splash Screen eltávolítása DOM-ból                         │
│                                                             │
│ <body class="loading"> → <body>                            │
│ <div id="splash-screen"> → ❌ DELETED                       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ UI5 Alkalmazás látható és használható                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Környezet Specifikus Wiring

### 3.1. CDN Mode Wiring

```
npm run smart-start:cdn
    ↓
start.js cdn
    ↓
build.js cdn
    ↓
index.html: window.UI5_ENVIRONMENT = 'cdn'
    ↓
config.js: getCurrentEnv() → 'cdn'
    ↓
ui5-bootstrap.js:
    script.src = 'https://sapui5.hana.ondemand.com/resources/sap-ui-core.js'
    ↓
Browser letölti a UI5-öt a SAP CDN-ről
    ↓
✅ UI5 betöltődik
    ↓
Splash eltűnik
```

### 3.2. Local Mode Wiring

```
npm run smart-start:local
    ↓
start.js local
    ↓
build.js local
    ↓
index.html: window.UI5_ENVIRONMENT = 'local'
    ↓
config.js: getCurrentEnv() → 'local'
    ↓
ui5-bootstrap.js:
    script.src = './resources/sap-ui-core.js'
    ↓
Browser betölti a node_modules/@openui5-ből
    ↓
✅ UI5 betöltődik (local)
    ↓
Splash eltűnik
```

### 3.3. Backend Mode Wiring

```
npm run smart-start:backend
    ↓
start.js backend
    ↓
build.js backend
    ↓
index.html: window.UI5_ENVIRONMENT = 'backend'
    ↓
config.js: getCurrentEnv() → 'backend'
    ↓
ui5-bootstrap.js:
    script.src = 'http://192.168.1.10:9000/resources/sap-ui-core.js'
    ↓
Browser letölti a UI5-öt a backend szerverről
    ↓
✅ UI5 betöltődik (backend)
    ↓
Splash eltűnik
```

### 3.4. Hybrid Mode Wiring

```
npm run smart-start:hybrid
    ↓
start.js hybrid
    ↓
build.js hybrid
    ↓
index.html: window.UI5_ENVIRONMENT = 'hybrid'
    ↓
config.js: getCurrentEnv() → 'hybrid'
    ↓
ui5-bootstrap.js:
    script.src = '/backend-proxy/resources/sap-ui-core.js'
    ↓
Browser kéri a proxy-t (local server proxy route)
    ↓
Proxy továbbítja: http://192.168.1.10:9000/resources/sap-ui-core.js
    ↓
✅ UI5 betöltődik (proxy-n keresztül)
    ↓
Splash eltűnik
```

---

## 4. Port Management Wiring

### 4.1. Port Conflict Detection

```javascript
// start.js - Port ellenőrzés

1. lsof parancs futtatása
   ↓
   macOS/Linux: lsof -ti:8300 -sTCP:LISTEN
   Windows:     netstat -ano | findstr :8300
   ↓
   Visszaadja a PID-et (vagy null)

2a. Ha PID === null
    ↓
    ✅ Port szabad
    ↓
    Tovább a build-re

2b. Ha PID létezik
    ↓
    Process parancssor lekérése:
    ↓
    macOS/Linux: ps -p ${PID} -o command=
    Windows:     wmic process where "ProcessId=${PID}" get CommandLine
    ↓
    Ellenőrzés:
    - Tartalmazza: "ui5-splash-screen-poc" ? → PROJECT processz
    - Tartalmazza: "http-server" ? → Valószínűleg projekt
    - Tartalmazza: "ui5 serve" ? → Valószínűleg projekt
    ↓
    3a. Ha PROJECT processz:
        ↓
        kill -9 ${PID}  (macOS/Linux)
        taskkill /PID ${PID} /F  (Windows)
        ↓
        Várunk 1 másodpercet
        ↓
        Port újra ellenőrzés → Szabad?
        ↓
        ✅ Folytatás

    3b. Ha NEM projekt processz:
        ↓
        ❌ Hiba: "Port is used by another application"
        ↓
        Javaslat: "PORT=9000 npm run smart-start:cdn"
        ↓
        process.exit(1)
```

### 4.2. Process Identification Logic

```javascript
// start.js - isProjectProcess() függvény

function isProjectProcess(pid) {
    // 3-szintű azonosítás

    // 1. Szint: PROJECT_MARKER
    if (cmdLine.includes('ui5-splash-screen-poc')) {
        return true  // ✅ Biztos projekt processz
    }

    // 2. Szint: Szerver típus
    if (cmdLine.includes('http-server')) {
        return true  // ✅ Valószínűleg projekt processz
    }

    if (cmdLine.includes('ui5 serve')) {
        return true  // ✅ Valószínűleg projekt processz
    }

    // 3. Szint: Egyéb
    return false  // ❌ Nem projekt processz (Chrome, VS Code, stb.)
}
```

**Példák:**

| Process Command Line | Azonosítás | Akció |
|---------------------|-----------|-------|
| `http-server` | ✅ Projekt | Kill |
| `node /path/ui5-splash-screen-poc/start.js` | ✅ Projekt | Kill |
| `ui5 serve --port 8300` | ✅ Projekt | Kill |
| `Google Chrome Helper` | ❌ Nem projekt | **NEM** kill |
| `Code Helper (Plugin)` | ❌ Nem projekt | **NEM** kill |

---

## 5. VSCode Launch Wiring

### 5.1. F5 Launch Folyamat

```json
// .vscode/launch.json

{
    "name": "UI5 Splash - CDN Mode (Smart Start)",
    "runtimeExecutable": "npm",
    "runtimeArgs": ["run", "smart-start:cdn"]
}
```

**Folyamat:**

```
User nyom F5-öt VSCode-ban
    ↓
VSCode kiolvassa a launch.json-t
    ↓
Kiválasztja: "UI5 Splash - CDN Mode (Smart Start)"
    ↓
VSCode futtatja:
    npm run smart-start:cdn
    ↓
start.js elindul (lásd: 1.2. Smart Start Folyamat)
    ↓
Server elindul
    ↓
serverReadyAction trigger:
    pattern: "http://[0-9.]+:([0-9]+)" detektálva
    ↓
VSCode automatikusan megnyitja:
    http://localhost:8300
    ↓
✅ Böngésző megnyílik, alkalmazás látható
```

### 5.2. Manual vs Smart Start

```
┌─────────────────────────────────────────────────────────┐
│ Manual Mode (start:cdn)                                 │
├─────────────────────────────────────────────────────────┤
│ npm run start:cdn                                       │
│     ↓                                                   │
│ node build.js cdn && http-server -p 8300 --cors -o     │
│     ↓                                                   │
│ ❌ Ha port foglalt → HIBA → Leáll                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Smart Start Mode (smart-start:cdn)                      │
├─────────────────────────────────────────────────────────┤
│ npm run smart-start:cdn                                 │
│     ↓                                                   │
│ node start.js cdn                                       │
│     ↓                                                   │
│ ✅ Port ellenőrzés → Kill ha projekt → Build → Start   │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Edge Case Handling Wiring

### 6.1. UI5 Betöltési Timeout (Watchdog)

```javascript
// splash-screen.js - Fallback timeout

setTimeout(function() {
    clearInterval(checkUI5Interval)  // Poller leállítása

    if (document.getElementById('splash-screen')) {
        console.warn('[Splash] UI5 init timeout (10s)')
        hideSplashScreen(0)  // Azonnali eltüntetés
    }
}, 10000)  // 10 másodperc MAX várakozás
```

**Miért fontos?**

Ha az UI5 **sosem** töltődik be (CDN leállt, backend offline, stb.), akkor:
- ❌ NÉLKÜLE: Splash screen örökké látszana (infinite loop, memory leak)
- ✅ VELE: 10 másodperc után eltűnik, user látja a hibát

### 6.2. UI5 Betöltési Hiba (onerror)

```javascript
// ui5-bootstrap.js - Error handling

script.onerror = function() {
    window.UI5_LOAD_ERROR = true
    console.error('[UI5] Failed to load from', config.name)
    console.error('Please check the configuration in config.js')

    // Splash screen.js a watchdog miatt 10s után el fog tűnni
}
```

**Flow hibás betöltésnél:**

```
UI5 CDN offline
    ↓
script.onerror() trigger
    ↓
window.UI5_LOAD_ERROR = true
    ↓
Splash screen továbbra is látszik (video megy)
    ↓
10 másodperc elteltével watchdog trigger
    ↓
hideSplashScreen(0) meghívódik
    ↓
Splash eltűnik, console error látható
    ↓
User látja hogy üres oldal + console error
```

### 6.3. Port Újrafelhasználás Delay

```javascript
// start.js - Port release waiting

if (killProcess(pid)) {
    console.log('⏳ Waiting for port to be released...')

    // Várunk 1 másodpercet
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Újra ellenőrzés
    const stillInUse = getPortPID(DEFAULT_PORT)

    if (stillInUse) {
        console.error('❌ Port still in use after kill')
        process.exit(1)
    } else {
        console.log('✅ Port is now free')
    }
}
```

**Miért fontos?**

A process kill után az OS-nek kell idő a port felszabadítására:
- macOS/Linux: ~100-500ms
- Windows: ~500-1000ms

Nélküle "EADDRINUSE" hibát kapnánk.

---

## 7. Fájl Kapcsolatok (File Dependencies)

### 7.1. Dependency Graph

```
index.template.html  ────────────┐
                                 ↓
build.js (generator) ────→ index.html (generated)
    ↑                             ↓
    │                       Browser betölti
    │                             ↓
start.js ────────────────→ [Environment injection]
    │                             ↓
    └──────────────────→    config.js
                          (getCurrentEnv)
                                 ↓
                          ui5-bootstrap.js
                          (UI5 betöltés)
                                 ↓
                          splash-screen.js
                          (Splash kezelés)
                                 ↓
                          splash-screen.css
                          (Megjelenítés)
```

### 7.2. Runtime Dependency Chain

```
1. index.html
   └─> window.UI5_ENVIRONMENT = 'cdn'

2. config.js
   ├─> UI5_CONFIG objektum
   └─> getCurrentEnv() függvény
       └─> Használja: window.UI5_ENVIRONMENT

3. ui5-bootstrap.js
   ├─> Használja: getCurrentEnv()
   ├─> Használja: UI5_CONFIG
   └─> Beállítja: window.UI5_LOADED

4. splash-screen.js
   ├─> Figyeli: window.sap.ui.getCore()
   └─> Kezeli: #splash-screen DOM elem

5. splash-screen.css
   └─> Definiálja: .hidden, #splash-screen stílusok
```

---

## 8. Git Workflow Wiring

### 8.1. Verziókezelt vs Generált Fájlok

```
┌─────────────────────────────────────────────────────────┐
│ VERZIÓKEZELT (Git-ben)                                  │
├─────────────────────────────────────────────────────────┤
│ ✅ index.template.html  (FORRÁS)                        │
│ ✅ build.js             (GENERATOR)                     │
│ ✅ start.js             (SMART START)                   │
│ ✅ config.js            (KONFIG)                        │
│ ✅ ui5-bootstrap.js     (LOGIKA)                        │
│ ✅ splash-screen.js     (LOGIKA)                        │
│ ✅ splash-screen.css    (STÍLUS)                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ GENERÁLT (.gitignore-ban)                               │
├─────────────────────────────────────────────────────────┤
│ ❌ index.html           (GENERATED from template)       │
│ ❌ node_modules/        (NPM dependencies)              │
└─────────────────────────────────────────────────────────┘
```

### 8.2. Build Artifact Flow

```
Developer módosít
    ↓
index.template.html
    ↓
git add index.template.html
git commit -m "Update template"
    ↓
git push
    ↓
Másik developer git pull
    ↓
Lokálisan futtatja: npm start
    ↓
start.js meghívja build.js-t
    ↓
index.html regenerálódik a template-ből
    ↓
✅ Mindenki ugyanazt a verziót használja
```

---

## 9. Error Handling Wiring

### 9.1. Build Hiba

```javascript
// build.js - Invalid environment

node build.js invalid-env
    ↓
Validáció: validEnvs.includes('invalid-env')
    ↓
❌ false
    ↓
console.error('Invalid environment: invalid-env')
console.error('Valid options: cdn, local, backend, hybrid')
    ↓
process.exit(1)
    ↓
Script leáll, index.html NEM generálódik
```

### 9.2. Port Conflict Hiba

```javascript
// start.js - Port used by other app

lsof -ti:8300 -sTCP:LISTEN
    ↓
Visszaadja: 12345 (Chrome Helper)
    ↓
isProjectProcess(12345)
    ↓
cmdLine = "Google Chrome Helper..."
    ↓
Nem tartalmazza: "ui5-splash-screen-poc"
Nem tartalmazza: "http-server"
Nem tartalmazza: "ui5 serve"
    ↓
❌ return false
    ↓
console.error('Port 8300 is used by another application')
console.error('Please stop it manually or use a different port')
console.error('PORT=9000 npm run smart-start:cdn')
    ↓
process.exit(1)
```

### 9.3. UI5 Betöltési Hiba

```javascript
// ui5-bootstrap.js + splash-screen.js

UI5 CDN offline
    ↓
script.onerror() trigger
    ↓
window.UI5_LOAD_ERROR = true
console.error('[UI5] Failed to load from CDN')
    ↓
Splash screen.js poller fut tovább
    ↓
10 másodperc watchdog trigger
    ↓
hideSplashScreen(0)
    ↓
User látja: Üres oldal + Console error
```

---

## 10. Teljes Rendszer Flow (End-to-End)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. INDÍTÁS (Terminal vagy VSCode F5)                           │
└─────────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. SMART START                                                  │
│    - Port ellenőrzés                                            │
│    - Kill ha projekt processz                                   │
│    - Várás port felszabadulásra                                 │
└─────────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. BUILD                                                        │
│    - index.template.html beolvasás                              │
│    - {{ENV_INJECTION}} → window.UI5_ENVIRONMENT = 'cdn'        │
│    - index.html generálás                                       │
└─────────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. SERVER START                                                 │
│    - http-server indítás 8300-as porton                         │
│    - Böngésző automatikus megnyitása                            │
└─────────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. BROWSER LOAD                                                 │
│    - index.html betöltés                                        │
│    - config.js → UI5_CONFIG                                     │
│    - ui5-bootstrap.js → UI5 letöltés indul                      │
│    - splash-screen.js → Video lejátszás + Poller indítás        │
└─────────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. UI5 LOADING                                                  │
│    - UI5 library letöltése (CDN/Local/Backend)                  │
│    - window.sap.ui.getCore() létrejön                           │
│    - sap.ui.getCore().isInitialized() → true                   │
└─────────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. SPLASH HIDE                                                  │
│    - splash-screen.js detektálja UI5 ready-t                    │
│    - Poller leállítása                                          │
│    - Watchdog leállítása                                        │
│    - Fade-out animáció (0.5s)                                   │
│    - Splash screen DOM eltávolítás                              │
└─────────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. APPLICATION READY                                            │
│    - UI5 alkalmazás látható                                     │
│    - User interakció lehetséges                                 │
│    - ✅ KÉSZ                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Összefoglalás

A modul egy **3-rétegű** architektúrát használ:

1. **Build Layer**: Template-based environment injection (build.js)
2. **Runtime Layer**: Dynamic UI5 loading + Splash screen management
3. **Port Management Layer**: Smart port conflict resolution (start.js)

A komponensek **lazán csatoltak**, de jól definiált interfészeken kommunikálnak:
- `window.UI5_ENVIRONMENT` → Environment passing
- `window.UI5_LOADED` → Loading state signaling
- `window.sap.ui.getCore()` → UI5 ready detection

Ez lehetővé teszi a **független fejlesztést** és **könnyű bővíthetőséget**.
