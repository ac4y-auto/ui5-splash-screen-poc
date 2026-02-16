# Hybrid mod -- Fejlesztoi utmutato (v4.0)

> **v4.0** -- Teljes ujrairas. Nincs `build.js`, nincs environment injection, nincs `http-server`.
> Minden `fiori run` + YAML config alapu.

---

## 1. Mi a Hybrid mod?

A Hybrid mod a legjobb mindket vilagbol:

- **UI5 framework** a **lokalis `~/.ui5/` cache**-bol toltodik (gyors, offline-kepes)
- **Backend `/sap` OData service**-ek a **SAP szerverre proxyzodnak** (`fiori-tools-proxy`)
- Az `index.html` **statikus** -- semmilyen build vagy injection nem szukseges

```
Bongeszo (localhost:8300)
    |
    |-- /index.html               <-- lokalis fajl (statikus)
    |-- /Component.js             <-- lokalis fajl
    |-- /resources/sap-ui-core.js <-- ~/.ui5/ cache (framework szekcionbol)
    |
    +-- /sap/opu/odata/...        <-- fiori-tools-proxy --> SAP szerver (192.168.1.10:9000)
```

A UI5 library-kat a YAML `framework` szekcioja biztositja a lokalis cache-bol.
A `/sap` utvonalat a `fiori-tools-proxy` tovabbitja a backend szerverre.
Minden mas lokalis fajl.

---

## 2. Mikor hasznald?

**Fejlesztes valodi SAP backend-del, de gyors UI5 betoltessel.**

- Kell OData service a SAP szerverrol (`/sap/opu/odata/...`)
- De a UI5 framework betoltest nem akarod a halozattol fuggeteni
- A lokalis `~/.ui5/` cache pillanatok alatt kiszolgalja a SAPUI5-ot
- Nincs CORS problema, mert a proxy same-origin-kent szolgalja ki

**Ne hasznald, ha:**
- Nincs szukseged backend service-re --> hasznald a **local** modot
- A UI5-ot is a szerverrol akarod --> hasznald a **backend** modot

---

## 3. A 4 mod osszehasonlitasa

| | **Local** | **CDN** | **Backend** | **Hybrid** |
|---|---|---|---|---|
| **UI5 forras** | `~/.ui5/` cache | SAP CDN (internet) | SAP szerver | **`~/.ui5/` cache** |
| **Backend `/sap`** | nincs | nincs | SAP szerver | **SAP szerver (proxy)** |
| **YAML config** | `ui5.yaml` | `ui5-cdn.yaml` | `ui5-backend.yaml` | **`ui5-hybrid.yaml`** |
| **framework szekcion** | van | nincs | nincs | **van** |
| **fiori-tools-proxy** | nincs | CDN proxy | backend proxy | **backend proxy** |
| **Offline UI5** | igen | nem | nem | **igen** |
| **Offline backend** | -- | -- | nem | **nem** |
| **NPM script** | `start:local` | `start:cdn` | `start:backend` | **`start:hybrid`** |
| **Hasznalat** | UI-only fejlesztes | demo, teszteles | teljes SAP integracio | **fejlesztes + OData** |

---

## 4. Konfiguracio

A `ui5-hybrid.yaml` teljes tartalma:

```yaml
specVersion: "3.0"
metadata:
  name: ui5-splash-screen-poc
type: application
resources:
  configuration:
    paths:
      webapp: "."
framework:
  name: SAPUI5
  version: "1.105.0"
  libraries:
    - name: sap.m
    - name: sap.ui.core
    - name: themelib_sap_horizon
server:
  customMiddleware:
    - name: fiori-tools-proxy
      afterMiddleware: compression
      configuration:
        backend:
          - path: /sap
            url: http://192.168.1.10:9000
```

**Kulcs elemek:**

- `framework` szekcion -- a UI5 library-kat a lokalis `~/.ui5/` cache-bol szolgalja ki. Ez a lenyegi kulonbseg a backend modhoz kepest.
- `backend.path: /sap` -- **csak** a `/sap` kezdetu kereseket proxyzza a SAP szerverre. Minden mas lokalis marad.
- `backend.url` -- a cel SAP szerver cime (IP es port).

**Osszehasonlitasul a `ui5-backend.yaml`** (ahol MINDEN a szerverrol jon):

```yaml
# ui5-backend.yaml -- NINCS framework szekcion!
server:
  customMiddleware:
    - name: fiori-tools-proxy
      afterMiddleware: compression
      configuration:
        backend:
          - path: /sap
            url: http://192.168.1.10:9000
          - path: /resources          # <-- UI5 is a szerverrol
            url: http://192.168.1.10:9000
          - path: /test-resources     # <-- test-resources is a szerverrol
            url: http://192.168.1.10:9000
```

---

## 5. Inditas

### Egyszeru inditas

```bash
npm run start:hybrid
```

Ez a kovetkezot futtatja:
```bash
npx fiori run --port 8300 --config ui5-hybrid.yaml --open index.html
```

### Smart Start (port-ellenorzessesel)

```bash
npm run smart-start:hybrid
```

A `start.js` eloszor ellenorzi, hogy a port (8300) szabad-e, es csak utana indit.

### Purge + Start (ha a port foglalt)

```bash
npm run purge && npm run start:hybrid
```

A `purge.js` megoli a porton levo folyamatot (csak ha a projekthez tartozik), majd ujraindithatod.

### Vart kimenet

```
Smart Start
   Port: 8300
   Config: ui5-hybrid.yaml

   Port 8300 is available
   Starting fiori run...

info server:custommiddleware:fiori-tools-proxy Backend: http://192.168.1.10:9000 -> /sap
info graphHelpers:ui5Framework Using SAPUI5 version: 1.105.0
Server started
URL: http://localhost:8300
```

A bongeszo automatikusan megnyilik: `http://localhost:8300/index.html`

---

## 6. Hogyan mukodik?

A `fiori run` ket forrasbol szolgalja ki a tartalmat:

### UI5 framework (lokalis cache)

A YAML `framework` szekcioja miatt a `fiori run` a `~/.ui5/` konyvtarbol toltodik be:

```
GET /resources/sap-ui-core.js
    --> ~/.ui5/framework/artifacts/.../sap-ui-core.js
```

Elso futtataskort a CLI automatikusan letolti a megadott verziot (1.105.0) a cache-be. A tovabbi inditasok azonnaliak.

### Backend proxy (SAP szerver)

A `fiori-tools-proxy` **kizarolag a `/sap` utvonalat** proxyzza:

```
GET /sap/opu/odata/sap/MY_SERVICE/$metadata
    --> http://192.168.1.10:9000/sap/opu/odata/sap/MY_SERVICE/$metadata
```

Minden mas keres (HTML, JS, CSS, kepek) lokalis fajlkent kerul kiszolgalasra.

### Mi NEM kerul proxyzasra

| Utvonal | Forras |
|---|---|
| `/index.html` | lokalis fajl |
| `/Component.js` | lokalis fajl |
| `/resources/sap-ui-core.js` | `~/.ui5/` cache |
| `/resources/sap/m/Button.js` | `~/.ui5/` cache |
| `/sap/opu/odata/...` | **proxy --> SAP szerver** |

---

## 7. SAP backend beallitasa

A backend szerver cimet a `ui5-hybrid.yaml` fajlban allithatod:

```yaml
configuration:
  backend:
    - path: /sap
      url: http://192.168.1.10:9000    # <-- ezt modositsd
```

### Peldak

```yaml
# Lokalis halozati SAP szerver
url: http://192.168.1.10:9000

# SAP Cloud Connector
url: https://my-sap-system.company.com:443

# Lokalis mock server
url: http://localhost:3000
```

### Tovabbi backend utvonalak hozzaadasa

Ha a `/sap`-on kivul mas utvonalat is proxyzni kell:

```yaml
configuration:
  backend:
    - path: /sap
      url: http://192.168.1.10:9000
    - path: /custom-api
      url: http://192.168.1.10:9000
```

---

## 8. Hibakereses

### Error overlay (503 Service Unavailable)

Ha a SAP szerver nem elerheto, a `fiori-tools-proxy` 503-as hibat ad.

**Ellenorizd:**
```bash
# Backend elerheto-e?
curl -I http://192.168.1.10:9000/sap/
ping 192.168.1.10
```

### F12 Network tab

Nyisd meg a DevTools Network tabot es szurd a kereseket:

| Amit keress | Vart eredmeny |
|---|---|
| `sap-ui-core.js` | **200 OK** -- `~/.ui5/` cache-bol |
| `/sap/opu/odata/...` | **200 OK** -- proxy-n keresztul |
| `/sap/...` es **503** | Backend szerver nem elerheto |
| `/sap/...` es **404** | A path nincs a YAML backend listaban |

### UI5 nem toltodik be

Ha a `resources/sap-ui-core.js` 404-et ad:

1. Ellenorizd, hogy a `framework` szekcion benne van-e a `ui5-hybrid.yaml`-ban
2. Ellenorizd a verziot: `framework.version: "1.105.0"`
3. Toroltesd a cache-t es probalad ujra:
   ```bash
   rm -rf ~/.ui5/framework
   npm run start:hybrid
   ```
   Az elso inditas ujra letolti a framework-ot.

### Port foglalt

```bash
# Ki hasznalja a portot?
lsof -ti:8300

# Purge-olj es inditsd ujra
npm run purge && npm run start:hybrid
```

---

## 9. Osszehasonlitas backend moddal

Ez a ket mod a leggyakoribb forrasza az osszetevesztesnek. A kulonbseg:

| | **Backend mod** | **Hybrid mod** |
|---|---|---|
| **YAML** | `ui5-backend.yaml` | `ui5-hybrid.yaml` |
| **UI5 forras** | SAP szerver (proxy) | **lokalis `~/.ui5/` cache** |
| **`/resources` proxy** | igen | **nem** |
| **`/sap` proxy** | igen | **igen** |
| **`framework` szekcion** | **nincs** | **van** |
| **UI5 betoltes sebesseg** | halozatfuggo | **azonnali (lokalis)** |
| **Offline UI5** | nem | **igen** |
| **Mikor hasznald** | ha a szerver UI5 verziojat kell tesztelni | **fejlesztes OData-val** |

**Egyszeru szamalyban:**
- **Backend mod**: MINDEN a szerverrol jon (`/resources`, `/test-resources`, `/sap`)
- **Hybrid mod**: **csak `/sap`** a szerverrol, UI5 a lokalis cache-bol

Ha nem biztos melyiket valaszd: **hasznald a hybrid modot.** Gyorsabb, offline-kepes a UI5-re nezve, es a legtobb fejlesztesi szcenariohoz megfelel.
