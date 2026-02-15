# Hybrid mód – Fejlesztői útmutató

> **Cél:** UI5 alkalmazás fejlesztése helyi gépen úgy, hogy a UI5 library-kat egy távoli backend
> szerverről tölti be **reverse proxy-n keresztül**, CORS probléma nélkül.

---

## Mi az a Hybrid mód?

A Hybrid mód ötvözi a helyi fejlesztés kényelmét a backend szerver UI5 resource-aival:

```
Böngésző (localhost:8300)
    │
    ├── /index-configurable.html    ← helyi fájl (ui5 serve kiszolgálja)
    ├── /Component.js               ← helyi fájl
    ├── /view/App.view.xml          ← helyi fájl
    │
    └── /proxy/resources/sap-ui-core.js
            │
            ▼ (ui5-middleware-simpleproxy)
        http://192.168.1.10:9000/resources/sap-ui-core.js
                                        ← backend szerver UI5 library-k
```

**Minden kérés same-origin (localhost:8300)** → nincs CORS hiba, nincs mixed content warning.

---

## Miért kell ez?

### A probléma: Backend mód (direct) hibái

A közvetlen backend mód (`?env=backend`) így tölti be a UI5-öt:
```javascript
url: 'http://192.168.1.10:9000/resources/sap-ui-core.js'
```

Ez három okból problémás:
1. **CORS hiba** – a böngésző blokkolja a cross-origin kérést (`localhost:8300` → `192.168.1.10:9000`)
2. **Hardkódolt IP** – nem hordozható környezetek között (DEV/QAS/PRD)
3. **Nincs cache buster** – verziófrissítésnél nem invalidálódik a cache

### A megoldás: Hybrid mód (proxy)

```javascript
url: '/proxy/resources/sap-ui-core.js'
```

- Relatív URL → **same-origin**, nincs CORS
- A proxy middleware átirányítja a kérést a backend szerverre
- A backend cím **egyetlen helyen** van konfigurálva (`ui5-backend.yaml`)
- Env var-ral felülírható (`.env` fájl) → transzportálható

---

## Architektúra

### Fájlok és szerepük

```
ui5-splash-screen-poc/
│
├── ui5.yaml                  ← Alap config (CDN/Local módhoz, proxy nélkül)
├── ui5-backend.yaml          ← Hybrid config (simpleproxy middleware-rel)
├── config.js                 ← Böngésző oldali env config (hybrid URL: /proxy/...)
├── package.json              ← npm scripts (start:hybrid → ui5 serve --config ui5-backend.yaml)
├── .env.example              ← Env var template (backend URL felülírás)
│
├── .vscode/
│   ├── launch.json           ← "Hybrid mód" debug konfiguráció
│   └── tasks.json            ← "serve:hybrid" háttér task
│
└── node_modules/
    └── ui5-middleware-simpleproxy/  ← A proxy middleware (npm csomag)
```

### Kérés útvonala

```
1. Böngésző kéri:  GET http://localhost:8300/proxy/resources/sap-ui-core.js
                                                 │
2. ui5 serve fogadja a kérést                    │
                                                 │
3. simpleproxy middleware egyeztet:               │
   mountPath: /proxy  ← egyezik!                │
                                                 │
4. Proxy továbbít:    GET http://192.168.1.10:9000/resources/sap-ui-core.js
   (a /proxy prefix levágva, baseUri elé ragasztva)
                                                 │
5. Backend válaszol:  200 OK + sap-ui-core.js    │
                                                 │
6. Proxy visszaküldi a böngészőnek               │
   (same-origin, nincs CORS header szükséges)
```

---

## Beüzemelés lépésről lépésre

### Előfeltételek

- Node.js 18+
- npm 9+
- A projekt már tartalmazza a szükséges dependency-ket

### 1. lépés: `ui5-middleware-simpleproxy` telepítése

Ha még nincs telepítve:
```bash
npm install --save-dev ui5-middleware-simpleproxy
```

> A mi projektünkben már benne van a `package.json`-ban.

### 2. lépés: `ui5-backend.yaml` létrehozása

Hozd létre a projekt gyökerében:

```yaml
specVersion: "3.0"
metadata:
  name: ui5-splash-screen-poc
type: application
resources:
  configuration:
    paths:
      webapp: "."           # Ha a fájlok a gyökérben vannak (nem webapp/ mappában)
framework:
  name: OpenUI5
  version: "1.105.0"
  libraries:
    - name: sap.m
    - name: sap.ui.core
    - name: themelib_sap_horizon
server:
  customMiddleware:
    - name: ui5-middleware-simpleproxy
      afterMiddleware: compression
      mountPath: /proxy                              # ← Ezen az útvonalon érhető el
      configuration:
        baseUri: "http://192.168.1.10:9000"          # ← Backend szerver címe
        strictSSL: false                             # ← Self-signed cert esetén
```

**Fontos részletek:**
- `mountPath: /proxy` – minden `/proxy/*` kérést a proxy kezeli
- `baseUri` – a backend szerver alap URL-je (port-tal együtt)
- `strictSSL: false` – ha a backend HTTPS-t használ self-signed tanúsítvánnyal
- `afterMiddleware: compression` – a compression middleware után fut (ajánlott sorrend)

### 3. lépés: `config.js` – hybrid üzemmód hozzáadása

```javascript
const UI5_CONFIGS = {
    // ... meglévő módok (cdn, local, backend) ...

    hybrid: {
        name: 'Hybrid (backend via proxy)',
        url: '/proxy/resources/sap-ui-core.js',
        description: 'Uses UI5 from backend server via local reverse proxy (CORS-safe)'
    }
};
```

A lényeg: `/proxy/resources/sap-ui-core.js` – relatív URL, a `/proxy` prefix egyezik a
`ui5-backend.yaml` `mountPath`-jával.

### 4. lépés: `package.json` – npm script

**v3.0 Build-Based Workflow:**

```json
{
  "scripts": {
    "start:hybrid": "node build.js hybrid && npx ui5 serve --port 8300 --config ui5-backend.yaml --open",
    "build": "node build.js",
    "serve:hybrid": "npx ui5 serve --port 8300 --config ui5-backend.yaml --open"
  }
}
```

**Változás a v3.0-ban:**
- ❌ **Régi (v2.0)**: URL paraméter (`?env=hybrid`) kell
- ✅ **Új (v3.0)**: Build script injektálja a környezetet az `index.html`-be

**Paraméterek:**
- `node build.js hybrid` – Beinjektálja `window.UI5_ENVIRONMENT = 'hybrid'` az index.html-be
- `--port 8300` – Fejlesztői szerver portja
- `--config ui5-backend.yaml` – A proxy-s konfigurációt használja (nem az alap `ui5.yaml`-t)
- `--open` – Automatikusan megnyitja a böngészőt a `http://localhost:8300/` címen

**Nincs szükség URL paraméterre!** A `?env=hybrid` már **NEM kell**.

### 5. lépés: Indítás

**v3.0 Workflow:**

```bash
npm run start:hybrid
```

Várt kimenet:
```
🔧 Building for environment: hybrid
✅ Environment 'hybrid' injected into index.html
   window.UI5_ENVIRONMENT = 'hybrid'

📝 You can now start the server with: npm run serve:hybrid

info graph:helpers:ui5Framework Using OpenUI5 version: 1.105.0
Server started
URL: http://localhost:8300
```

Böngésző automatikusan megnyílik: `http://localhost:8300/` (nincs URL paraméter!)

**Ellenőrzés böngészőben:**
```javascript
// F12 Console
window.UI5_ENVIRONMENT  // → "hybrid"
```

---

## VS Code integráció

### launch.json (v3.0)

**Új Node-alapú launch konfiguráció** (az `.vscode/launch.json` tartalmazza):

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "UI5 Splash - Hybrid Mode",
            "type": "node",
            "request": "launch",
            "runtimeExecutable": "npm",
            "runtimeArgs": [
                "run",
                "start:hybrid"
            ],
            "cwd": "${workspaceFolder}",
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen",
            "serverReadyAction": {
                "pattern": "Server started",
                "uriFormat": "http://localhost:8300",
                "action": "openExternally"
            }
        },
        {
            "name": "Build Only (Hybrid)",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/build.js",
            "args": ["hybrid"],
            "cwd": "${workspaceFolder}",
            "console": "integratedTerminal"
        }
    ]
}
```

**Használat:**
1. **F5** vagy Run → Start Debugging
2. Válaszd: "UI5 Splash - Hybrid Mode"
3. Build script fut → UI5 CLI elindul → Böngésző megnyílik

**Előnyök v3.0-ban:**
- ✅ Automatikus build + serve egy lépésben
- ✅ Integrált terminal kimenet
- ✅ Server ready detection → böngésző automatikus megnyitás
- ✅ Nincs `tasks.json` szükséges (egyszerűbb konfig)

### Csak build futtatása (szerver nélkül)

Ha csak az `index.html` generálást akarod tesztelni:
1. Válaszd: "Build Only (Hybrid)"
2. F5
3. Az `index.html` frissül `window.UI5_ENVIRONMENT = 'hybrid'`-dal

---

## Backend cím felülírása

### A. opció: `.env` fájl (ajánlott)

A `ui5-middleware-simpleproxy` automatikusan támogatja a `.env` fájlt:

```bash
# .env (a projekt gyökerében, NE COMMITOLD!)
UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI=http://192.168.1.10:9000
```

Ez felülírja a `ui5-backend.yaml`-ban lévő `baseUri` értéket.

**Előnyök:**
- Fejlesztőnként eltérő backend cím
- Nem kell a yaml-t módosítani
- `.gitignore`-ban tartható

### B. opció: `ui5-backend.yaml` módosítása

Közvetlenül a yaml fájlban:
```yaml
configuration:
  baseUri: "http://uj-szerver:9000"
```

### C. opció: Környezeti változó parancssorból

```bash
UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI=http://masik-szerver:9000 npx ui5 serve --port 8300 --config ui5-backend.yaml
```

---

## A 4 üzemmód összehasonlítása

| | CDN | Local | Backend | **Hybrid** |
|---|---|---|---|---|
| **Szerver** | http-server | ui5 serve | http-server | **ui5 serve + proxy** |
| **UI5 forrás** | SAPUI5 CDN | node_modules / UI5 CLI cache | Backend (direkt) | **Backend (proxy-n keresztül)** |
| **CORS** | Nincs gond | Nincs gond | **VAN** probléma | **Nincs** gond |
| **Offline** | ✗ Internet kell | ✓ | ✗ Backend kell | ✗ Backend kell |
| **Transzportálható** | ✓ | ✓ | ✗ Hardkódolt IP | **✓** Env var-ral |
| **SAP ajánlás** | Csak teszthez | Fejlesztéshez | Nem ajánlott | **Igen (reverse proxy)** |
| **NPM parancs** | `start:cdn` | `start:local` | `start:backend` | **`start:hybrid`** |
| **URL (v3.0)** | `http://localhost:8300/` | `http://localhost:8300/` | `http://localhost:8300/` | `http://localhost:8300/` |
| **Build** | `build.js cdn` | `build.js local` | `build.js backend` | **`build.js hybrid`** |
| **VSCode Launch** | ✓ | ✓ | ✓ | **✓** |

---

## Hibakeresés

### A proxy nem továbbít (404)

**Ellenőrizd:**
1. A `mountPath` egyezik a `config.js`-ben lévő URL prefix-szel?
   - yaml: `mountPath: /proxy`
   - config.js: `url: '/proxy/resources/sap-ui-core.js'`
2. A `baseUri` helyes? (protokoll + host + port)
3. A backend szerver fut és elérhető?
   ```bash
   curl http://192.168.1.10:9000/resources/sap-ui-core.js -I
   ```

### "Unable to find source directory 'webapp'"

Hiányzik a `resources.configuration.paths.webapp` a yaml-ból:
```yaml
resources:
  configuration:
    paths:
      webapp: "."
```

### "Duplicate framework dependency definition(s)"

A `package.json`-ban lévő `@openui5/*` csomagok ütköznek a `ui5.yaml` framework szekciójával.
**Megoldás:** Töröld az `@openui5/*` csomagokat a `package.json`-ból.
Részletek: [OPENUI5_TO_SAPUI5_MIGRATION.md](./OPENUI5_TO_SAPUI5_MIGRATION.md)

### ECONNREFUSED / timeout

A backend szerver nem elérhető. Ellenőrizd:
```bash
ping 192.168.1.10
curl http://192.168.1.10:9000/ -v
```

### Böngésző konzolban "Failed to load UI5"

Nyisd meg a DevTools → Network tabot, és keresd a `/proxy/resources/sap-ui-core.js` kérést:
- **404** → a proxy nem fut (rossz yaml config vagy nem `ui5 serve`-vel indítottad)
- **502/503** → a backend nem válaszol
- **Nincs kérés** → Ellenőrizd a Console-ban: `window.UI5_ENVIRONMENT` → kell hogy `'hybrid'` legyen
  - Ha `undefined` vagy más érték: futtasd újra `node build.js hybrid`-et

**v3.0 Troubleshooting:**
```bash
# 1. Ellenőrizd az index.html tartalmat
grep "UI5_ENVIRONMENT" index.html
# Várható: <script>window.UI5_ENVIRONMENT = 'hybrid';</script>

# 2. Ha hiányzik vagy rossz, újra build
node build.js hybrid

# 3. Indítsd újra a szervert
npm run serve:hybrid
```

---

## Tippek

### Több backend proxy egyszerre

Ha több backend szolgáltatásra van szükség (pl. UI5 + OData):

```yaml
server:
  customMiddleware:
    - name: ui5-middleware-simpleproxy
      afterMiddleware: compression
      mountPath: /proxy
      configuration:
        baseUri: "http://192.168.1.10:9000"
        strictSSL: false
    - name: ui5-middleware-simpleproxy
      afterMiddleware: compression
      mountPath: /odata
      configuration:
        baseUri: "http://192.168.1.10:8080/sap/opu/odata"
        strictSSL: false
```

### Basic Auth a backend felé

```yaml
configuration:
  baseUri: "http://192.168.1.10:9000"
  username: "SAP_USER"
  password: "SAP_PASS"
```

Vagy `.env` fájlban:
```bash
UI5_MIDDLEWARE_SIMPLE_PROXY_USERNAME=SAP_USER
UI5_MIDDLEWARE_SIMPLE_PROXY_PASSWORD=SAP_PASS
```

### Cache buster (produktív backend)

Ha a backend támogatja a cache buster-t:
```javascript
hybrid: {
    url: '/proxy/resources/sap-ui-cachebuster/sap-ui-core.js'
}
```

---

## Gyors ellenőrző lista

Új fejlesztő setup-ja (v3.0):

- [ ] `git clone` + `npm install`
- [ ] `.env.example` → `.env` másolás, backend cím beállítása
- [ ] `npm run start:hybrid` (build + serve egy parancsban)
- [ ] Böngészőben megjelenik az app: `http://localhost:8300/`
- [ ] F12 → Console → `window.UI5_ENVIRONMENT` → `"hybrid"` ✅
- [ ] F12 → Network → `/proxy/resources/sap-ui-core.js` → 200 OK
- [ ] Environment badge: "Hybrid (backend via proxy)" (3 mp után eltűnik)

**VSCode Debug setup:**
- [ ] `.vscode/launch.json` létezik (a projekt már tartalmazza)
- [ ] F5 → "UI5 Splash - Hybrid Mode" → Szerver elindul + böngésző megnyílik
- [ ] Breakpoint az `ui5-bootstrap.js`-ben → Debug működik
