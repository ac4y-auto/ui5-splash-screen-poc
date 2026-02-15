# UI5 Splash Screen - Kornyezeti Konfiguracio Koncepcio

## Attekintes

Ez a projekt egy konfiguralható SAPUI5 splash screen megoldast valosit meg, amely harom kulonbozo modban tud futni, YAML konfiguraciok altal vezerelve:

1. **Local** - SAPUI5 framework a helyi cache-bol (ui5 serve feloldja)
2. **CDN** - SAP CDN-rol proxyzva (fiori-tools-proxy)
3. **Backend** - SAP CDN + egyedi backend szerver proxyzva (fiori-tools-proxy)

**Fontos:** A projekt kizarolag **SAPUI5**-ot hasznal (nem OpenUI5-ot).

## Architektura

### Architektura Attekintes

```
+-------------------+     +-------------------+     +-------------------+
|   ui5.yaml        |     |  ui5-cdn.yaml     |     | ui5-backend.yaml  |
|   (Local mod)     |     |  (CDN mod)        |     | (Backend mod)     |
+-------------------+     +-------------------+     +-------------------+
         |                         |                         |
         +------------+------------+------------+------------+
                      |                         |
                      v                         v
              +---------------+        +------------------+
              |  fiori run    |        | fiori-tools-proxy|
              |  (ui5 serve)  |<------>| (middleware)      |
              +---------------+        +------------------+
                      |
                      v
              +---------------+
              | index.html    |
              | (STATIKUS)    |
              +---------------+
                      |
         +------------+------------+
         |            |            |
         v            v            v
  +-----------+ +-----------+ +-----------+
  | splash-   | | sap-ui-   | | ui5-error-|
  | screen.js | | bootstrap | | handler.js|
  | (API)     | | (script)  | | (overlay) |
  +-----------+ +-----------+ +-----------+
                      |
                      v
              +---------------+
              | Component.js  |
              | (App logika)  |
              +---------------+
```

### 1. Server Reteg: fiori run + YAML konfigok

A projektet a `fiori run` parancs szolgalja ki, amely a `@sap/ux-ui5-tooling` csomag resze. Ez a parancs a `ui5 serve`-ot wrapeli es kiegesziti a `fiori-tools-proxy` middleware-rel.

**Nincs build lepes!** Az `index.html` statikus fajl, kozvetlenul szerkesztheto es verziokezelt.

A harom YAML konfig hatarozza meg, hogyan oldodik fel a `/resources` utvonal:

| YAML Konfig | Mod | /resources feloldas | Backend proxy |
|---|---|---|---|
| `ui5.yaml` | Local | ui5 serve (framework cache) | Nincs |
| `ui5-cdn.yaml` | CDN | fiori-tools-proxy --> SAP CDN | Nincs |
| `ui5-backend.yaml` | Backend | fiori-tools-proxy --> SAP CDN | `/sap` --> backend szerver |

### 2. Runtime Reteg: Statikus index.html + App-Controlled Splash

Az `index.html` egy standard SAP bootstrap-et tartalmaz:

```html
<script id="sap-ui-bootstrap"
    src="resources/sap-ui-core.js"
    data-sap-ui-theme="sap_horizon"
    data-sap-ui-libs="sap.m"
    data-sap-ui-async="true"
    data-sap-ui-onInit="module:sap/ui/core/ComponentSupport"
    data-sap-ui-resourceroots='{"myapp": "./"}'>
</script>
```

A `src="resources/sap-ui-core.js"` relativ URL-t a szerver reteg oldja fel, a bongeszo szamara transzparensen.

## Hasznalati Modok

### 1. Local Mod (Alapertelmezett)

**YAML konfig:** `ui5.yaml` (nincs `--config` parameter, ez az alapertelmezett)

**Mukodes:** A `ui5 serve` maga oldja fel a SAPUI5 framework-ot a `framework` szekcio alapjan. Az elso inditaskor letolti a SAPUI5 csomagot a `~/.ui5/framework/` konyvtarba (cache), ezutan helyi fajlokbol szolgalja ki.

**Elonyok:**
- Offline mukodes (az elso letoltes utan)
- Gyors betoltes (helyi fajlok)
- Verzio kontroll (YAML-ban megadott verzio)

**Hatranyok:**
- Elso inditaskor letoltesi ido
- Helyi tarhelyet hasznal

**Hasznalat:**
```bash
npm start
# vagy
npm run start:local
```

### 2. CDN Mod

**YAML konfig:** `ui5-cdn.yaml`

**Mukodes:** A `fiori-tools-proxy` middleware elfogja a `/resources` es `/test-resources` kereseket, es proxyzza a SAP CDN-re (`https://sapui5.hana.ondemand.com`).

**Elonyok:**
- Mindig a megadott SAPUI5 verzio
- Nincs szukseg helyi cache-re
- Egyszer beallitod a YAML-ban, utana transzparens

**Hatranyok:**
- Internet kapcsolat szukseges
- Lassabb betoltes (kulso szerver)

**Hasznalat:**
```bash
npm run start:cdn
```

**YAML konfig tartalma:**
```yaml
server:
  customMiddleware:
    - name: fiori-tools-proxy
      afterMiddleware: compression
      configuration:
        ui5:
          path:
            - /resources
            - /test-resources
          url: https://sapui5.hana.ondemand.com
          version: "1.105.0"
```

### 3. Backend Mod

**YAML konfig:** `ui5-backend.yaml`

**Mukodes:** A `fiori-tools-proxy` ket feladatot lat el:
1. SAPUI5 resources proxyzasa a SAP CDN-rol (mint a CDN modban)
2. Backend keresek proxyzasa (`/sap` utvonal) egy egyedi szerverre

**Elonyok:**
- SAPUI5 a CDN-rol + valodi backend adatok
- CORS problemak kikerulese (a proxy kezeli)
- Belso halozaton is mukodik

**Hatranyok:**
- Backend szerver szukseges
- Internet kapcsolat a SAPUI5-hoz (CDN proxy)

**Backend kovetelmeny:**
- UI5 alkalmazas altal hasznalt OData/REST szolgaltatasok elerhetok a megadott URL-en
- Pelda: `http://192.168.1.10:9000/sap/opu/odata/...`

**Hasznalat:**
```bash
npm run start:backend
```

**YAML konfig tartalma:**
```yaml
server:
  customMiddleware:
    - name: fiori-tools-proxy
      afterMiddleware: compression
      configuration:
        ui5:
          path:
            - /resources
            - /test-resources
          url: https://sapui5.hana.ondemand.com
          version: "1.105.0"
        backend:
          - path: /sap
            url: http://192.168.1.10:9000
```

## Projekt Struktura

```
ui5-splash-screen-poc/
+-- index.html                  # Statikus HTML (standard SAP bootstrap)
+-- ui5.yaml                    # Local mod konfig (default)
+-- ui5-cdn.yaml                # CDN mod konfig (fiori-tools-proxy)
+-- ui5-backend.yaml            # Backend mod konfig (CDN + backend proxy)
+-- package.json                # NPM scriptek es fuggosegek
+-- start.js                    # Smart Start (port management + fiori run)
+-- Component.js                # UI5 Component (app logika)
+-- manifest.json               # App manifest
+-- splash-screen.js            # Splash screen logika (App-Controlled API)
+-- splash-screen.css           # Splash screen stilusok
+-- ui5-error-handler.js        # UI5 betoltesi hiba kezeles (error overlay)
+-- splash-video.mp4            # Splash screen video
+-- splash-poster.jpeg          # Poster kep (video toltesig)
+-- view/
|   +-- App.view.xml            # UI5 View
+-- controller/
|   +-- App.controller.js       # UI5 Controller
+-- hopper/
    +-- WIRING.md               # Architektura/wiring dokumentum
    +-- KONCEPCIO.md             # Ez a fajl
```

## NPM Scriptek

### Inditasi Scriptek

| Script | Parancs | Mod | YAML |
|---|---|---|---|
| `start` | `npx fiori run --port 8300 --open index.html` | Local | `ui5.yaml` |
| `start:local` | `npx fiori run --port 8300 --open index.html` | Local | `ui5.yaml` |
| `start:cdn` | `npx fiori run --port 8300 --config ui5-cdn.yaml --open index.html` | CDN | `ui5-cdn.yaml` |
| `start:backend` | `npx fiori run --port 8300 --config ui5-backend.yaml --open index.html` | Backend | `ui5-backend.yaml` |

### Smart Start Scriptek

| Script | Parancs | Mod |
|---|---|---|
| `smart-start` | `node start.js` | Local |
| `smart-start:local` | `node start.js` | Local |
| `smart-start:cdn` | `node start.js ui5-cdn.yaml` | CDN |
| `smart-start:backend` | `node start.js ui5-backend.yaml` | Backend |

A Smart Start scriptek elonye: automatikus port conflict feloldas (meglevo projekt processz leallitasa).

### Mukodes

1. **fiori run** - `@sap/ux-ui5-tooling` csomag parancs (ui5 serve wrapper)
2. **--port 8300** - Dev szerver a 8300-as porton
3. **--config** - Alternativ YAML konfig fajl megadasa
4. **--open index.html** - Automatikus bongeszo megnyitas

## SAPUI5 vs OpenUI5

A projekt **kizarolag SAPUI5**-ot hasznal. Ez a YAML konfigokban van rogzitve:

```yaml
framework:
  name: SAPUI5        # <-- NEM OpenUI5
  version: "1.105.0"
```

**SAPUI5 es OpenUI5 kulonbseg:**

| | SAPUI5 | OpenUI5 |
|---|---|---|
| Licenc | SAP kereskedelmi | Apache 2.0 |
| Library-k | Teljes (sap.ushell, sap.fe, stb.) | Korlatozott |
| CDN | sapui5.hana.ondemand.com | sdk.openui5.org |
| Hasznalat | SAP ugyfelek | Nyilt forras projektek |

## Splash Screen Mukodes

### App-Controlled Mod

A splash screen-t az UI5 alkalmazas (Component.js) iranyitja a `window.SplashScreen` API-n keresztul:

```javascript
// Component.js
init: function() {
    // Splash START
    if (window.SplashScreen) {
        window.SplashScreen.show();
    }

    // Uzleti adatok betoltese
    this.loadApplicationData()
        .then(function() {
            // Splash END - adatok keszen
            if (window.SplashScreen) {
                window.SplashScreen.hide(500);
            }
        })
        .catch(function() {
            // Splash END - hiba eseten is
            if (window.SplashScreen) {
                window.SplashScreen.hide(0);
            }
        });
}
```

### SplashScreen API

| Metodus | Leiras |
|---|---|
| `SplashScreen.show()` | Splash screen megjelenitese, video inditas |
| `SplashScreen.hide(delay)` | Splash screen elrejtese fade-out animacioval |
| `SplashScreen.isVisible()` | Lathatosag lekerdezese (boolean) |

### Splash Screen Parameterek

- **Video:** `splash-video.mp4` (5x lassitott, playbackRate = 0.2)
- **Poster:** `splash-poster.jpeg` (video toltesig lathato)
- **Fade-out:** 1 masodperc (CSS transition)

## Hiba Kezeles

### ui5-error-handler.js

Ket mechanizmus figyeli a SAPUI5 betoltest:

1. **Script error event:** Ha a `sap-ui-core.js` nem toltodik be (halozati hiba, 404)
2. **Timeout (15 mp):** Ha 15 masodperc utan sem letezik a `sap` globalis objektum

Hiba eseten:
- Splash screen elrejtese (ha lathato)
- Error overlay megjelenites (cim, uzenet, forras URL, ujratoltesi gomb)
- Technikai reszletek (kinyithato szekció)
- Lehetseges megoldasok listaja

### Component.js hiba kezeles

Ha az uzleti adatok betoltese sikertelen:
- Splash screen azonnali elrejtese
- `sap.m.MessageBox.error()` dialog megjelenites

## Fejlesztoi Workflow

### 1. Uj Backend URL Beallitasa

Modositsd a `ui5-backend.yaml` fajlt:

```yaml
backend:
  - path: /sap
    url: http://UJ_SZERVER:PORT
```

### 2. SAPUI5 Verzio Valtas

Modositsd **mindharom** YAML fajlban a framework verziót:

```yaml
framework:
  name: SAPUI5
  version: "1.120.0"    # <-- Uj verzio
```

CDN es Backend modoknal a proxy verziót is:

```yaml
configuration:
  ui5:
    version: "1.120.0"  # <-- Uj verzio
```

### 3. Uj Mod Hozzaadasa

1. Hozz letre egy uj YAML fajlt (pl. `ui5-staging.yaml`)
2. Add hozzá az NPM scriptet a `package.json`-hoz:
```json
"start:staging": "npx fiori run --port 8300 --config ui5-staging.yaml --open index.html"
```
3. Opcionalis Smart Start:
```json
"smart-start:staging": "node start.js ui5-staging.yaml"
```

## Hibakereses

### 1. SAPUI5 nem toltodik be

**Ellenorizd:**
- A bongeszo Network tab-jat (F12)
- Fut-e a fejlesztoi szerver (`fiori run`)
- A YAML konfig helyes-e
- CDN modban: van-e internet kapcsolat
- Local modban: letoltodott-e a framework (`~/.ui5/framework/`)

### 2. Backend nem elerheto

**Ellenorizd:**
```bash
curl -I http://192.168.1.10:9000/sap/
```

**Ellenorizd a YAML-t:**
- A `backend.path` megegyezik-e az alkalmazas altal hasznalt utvonallal
- A `backend.url` helyes-e

### 3. Port foglalt

**Hasznalj Smart Start-ot:**
```bash
npm run smart-start:cdn
```

**Vagy mas portot:**
```bash
PORT=9000 npm run smart-start
```

## Tamogatas

- SAPUI5 Verzio: 1.105.0+
- Bongeszok: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- Node.js: 18+
- @sap/ux-ui5-tooling: 1.20.0+
- @ui5/cli: 4.0.0+

## Referenciak

- [SAP UI5 Tooling](https://sap.github.io/ui5-tooling/)
- [SAPUI5 Documentation](https://sapui5.hana.ondemand.com/)
- [Fiori Tools](https://help.sap.com/docs/SAP_FIORI_tools)
- [fiori-tools-proxy](https://www.npmjs.com/package/@sap/ux-ui5-tooling)
