# UI5 Splash Screen POC

UI5 alkalmazas splash screen-nel, amely webm videot jatsz le a betoltes alatt.

## Funkciok

- **Splash Screen** videoval (5x lassitott lejatszas, automatikus eltuness)
- **3 Uzemeltetesi Mod**: Local, CDN, Backend (YAML konfiguraciokkal)
- **Fiori Run** szerver (`@sap/ux-ui5-tooling` + `fiori-tools-proxy`)
- **Statikus index.html** - nincs build lepes, nincs template
- **Smart Start** - automatikus port-konfliktus kezeles
- **Error Overlay** - hibajelzes ha a SAPUI5 nem toltodik be
- **Poster kep** tamogatas (100% kepernyo)
- **Smooth fade-out** atmenet
- **Responsive** design
- **Modular Architecture** - Kulso CSS/JS fajlok

## Gyors Kezdes

### Telepites

```bash
npm install
```

### Inditas

#### Smart Start (Ajanlott)

Automatikusan kezeli a port konfliktusokat:

```bash
# Local mod (alapertelmezett) - SAPUI5 a framework-bol
npm start

# Vagy explicit modon
npm run smart-start           # Local (alapertelmezett)
npm run smart-start:cdn       # CDN proxy (sapui5.hana.ondemand.com)
npm run smart-start:local     # Local (= smart-start)
npm run smart-start:backend   # CDN + Backend proxy
```

**Smart Start funkciok:**
- Ellenorzi, hogy a port (8300) foglalt-e
- Megnezi, hogy az a process ehhez a projekthez tartozik-e (`fiori run`)
- Ha igen, automatikusan leoli es ujrainditja a szervert
- Ha nem (mas projekt folyamata), hibat dob es NEM oli le

**Pelda kimenet:**
```
Smart Start
   Port: 8300
   Project: ui5-splash-screen-poc
   Config: ui5-cdn.yaml

   Port 8300 is already in use (PID: 12345)
   Process belongs to this project (ui5-splash-screen-poc)
   Killing existing process (PID: 12345)...
   Process killed successfully
   Port 8300 is now free

   Starting fiori run...
```

#### Manualis Start

Ha Smart Start problemas, hasznald a manualis modot:

```bash
npm run start              # Local mod (alapertelmezett)
npm run start:cdn          # CDN proxy
npm run start:local        # Local (= start)
npm run start:backend      # CDN + Backend proxy
```

**Hogyan mukodik?**
- A `fiori run` parancs inditja a fejlesztoi szervert
- A YAML konfiguracio hatarozza meg az uzemeltetesi modot
- `ui5.yaml` = Local mod (nincs proxy, a framework szolgalja ki a SAPUI5-ot)
- `ui5-cdn.yaml` = CDN mod (fiori-tools-proxy a sapui5.hana.ondemand.com-rol)
- `ui5-backend.yaml` = CDN + Backend mod (CDN proxy + backend proxy a 192.168.1.10:9000-re)

### Opcionalis PORT Parameter

Az alapertelmezett port **8300**, de felulirhato kornyezeti valtozoval:

```bash
# Default port (8300)
npm start

# Custom port
PORT=9000 npm start
PORT=8080 npm run start:cdn
PORT=9090 npm run start:backend
```

## Projekt Struktura

### Gyoker
- `index.html` - Fooldal (statikus, kozvetlenul szerkesztheto)
- `ui5.yaml` - Local mod konfiguracio (alapertelmezett, nincs proxy)
- `ui5-cdn.yaml` - CDN mod konfiguracio (fiori-tools-proxy a SAP CDN-rol)
- `ui5-backend.yaml` - Backend mod konfiguracio (CDN + backend proxy)
- `start.js` - Smart Start script (port-kezeles + fiori run inditas)
- `package.json` - NPM scriptek es devDependencies

### Mukodesi Dokumentumok

Minden mukodesi es fejlesztesi dokumentum a [`hopper/`](hopper/) mappaban talalhato.

**Gyors linkek**:
- [RUNBOOK.md](hopper/RUNBOOK.md) - Operacios utmutato (kritikus szabalyok)
- [JUST-RUN-IT.md](hopper/JUST-RUN-IT.md) - Gyors inditas (parancsok egy helyen)
- [SMART_START_GUIDE.md](hopper/SMART_START_GUIDE.md) - Smart Start hasznalat
- [hopper/README.md](hopper/README.md) - Teljes dokumentacios index

### Legacy Fajlok (archiv)
- `legacy/index-configurable.html` - Eredeti konfiguralhato verzio (URL parameter alapu)
- `legacy/index-minimal.html` - Minimalis pelda
- `legacy/index.html` - Eredeti CDN verzio
- `legacy/index-demo.html` - Demo verzio CSS animacioval

### Splash Screen Modulok
- `splash-screen.css` - Splash screen stilusok
- `splash-screen.js` - Splash screen logika
- `ui5-error-handler.js` - SAPUI5 betoltesi hiba kezelo (timeout + script error overlay)

### UI5 Komponensek
- `Component.js` - UI5 Component
- `manifest.json` - Alkalmazas manifest
- `view/App.view.xml` - Fo view
- `controller/App.controller.js` - Fo controller

### Media
- `splash-video.mp4` - Splash screen video
- `splash-poster.jpeg` - Poster kep

## Splash Screen Funkciok

- **Video attributumok**: autoplay, loop, muted, playsinline
- **5x lassitas**: playbackRate = 0.2
- **2 perc idotartam**: 120 000 ms
- **Automatikus elrejtes**: A splash screen automatikusan eltunik, amikor az UI5 betoltodik
- **Smooth atmenet**: 1 masodperces fade-out animacio
- **Responsive**: 80% szelesseg/magassag, kozepre igazitva

## Kornyezeti Konfiguraciok

### 1. Local Mod (Alapertelmezett)

A SAPUI5 library-t a `@ui5/cli` framework szolgalja ki lokalis csomagokbol. Nincs szukseg internetre.

**Konfiguracio**: `ui5.yaml` (alapertelmezett, nincs `--config` flag)

```bash
npm start
# vagy
npm run start:local
```

**URL**: `http://localhost:8300/index.html` (automatikusan megnyilik)

### 2. CDN Mod (SAP CDN proxy)

A SAPUI5-ot a `fiori-tools-proxy` middleware toltiii le a `sapui5.hana.ondemand.com` CDN-rol.

**Konfiguracio**: `ui5-cdn.yaml`

```bash
npm run start:cdn
```

**URL**: `http://localhost:8300/index.html` (automatikusan megnyilik)

### 3. Backend Mod (CDN + Backend proxy)

A SAPUI5-ot CDN-rol tolti be (mint a CDN mod), plusz egy backend proxy-t is konfiguralva a `192.168.1.10:9000` szerverre (`/sap` utvonal).

**Konfiguracio**: `ui5-backend.yaml`

```bash
npm run start:backend
```

**URL**: `http://localhost:8300/index.html` (automatikusan megnyilik)

**Backend kovetelmeny**:
- A backend szerver elerheto a `http://192.168.1.10:9000` cimen
- A `/sap` utvonalra erkejo keresek proxyzzak a backend felé

## Architektura

### Hogyan mukodik a `fiori run`?

1. A `fiori run` elinditja a fejlesztoi szervert a megadott YAML konfiguracio alapjan
2. A statikus `index.html` betoltodik, benne: `<script id="sap-ui-bootstrap" src="resources/sap-ui-core.js">`
3. A szerver a `/resources/` kereseket az aktiv konfiguracio szerint szolgalja ki:
   - **Local**: a framework (SAPUI5 1.105.0) kozvetlen kiszolgalasa
   - **CDN**: `fiori-tools-proxy` atiranyit a `sapui5.hana.ondemand.com`-ra
   - **Backend**: CDN proxy + `/sap` backend proxy
4. A `ui5-error-handler.js` figyeli a betoltest: ha 15 masodpercen belul nem toltodik be a SAPUI5, error overlay jelenik meg
5. A `splash-screen.js` kezeli a splash video lejatszast es a fade-out-ot

### devDependencies

- `@sap/ux-ui5-tooling` - Fiori Tools (fiori run, fiori-tools-proxy)
- `@ui5/cli` - UI5 CLI (framework, SAPUI5 kiszolgalas local modban)

**FONTOS**: Csak SAPUI5 hasznalhato! OpenUI5 TILOS!

## Testreszabas

### Splash Screen Idotartam

Az `splash-screen.js` fajlban:

```javascript
}, 120000); // <- Valtoztasd ezt (ms)
```

### Video Sebesseg

```javascript
video.playbackRate = 0.2; // <- 0.2 = 5x lassabb
```

### Video Meret

CSS modositas a `splash-screen.css` fajlban:

```css
#splash-video {
    width: 80%;  /* <- Valtoztasd */
    height: 80%; /* <- Valtoztasd */
}
```

### YAML Konfiguracio Modositas

A SAPUI5 verzio vagy a backend URL modositasahoz szerkeszd a megfelelo YAML fajlt:

```yaml
# ui5-cdn.yaml vagy ui5-backend.yaml
server:
  customMiddleware:
    - name: fiori-tools-proxy
      configuration:
        ui5:
          url: https://sapui5.hana.ondemand.com
          version: "1.105.0"    # <- SAPUI5 verzio
        backend:                 # <- Csak ui5-backend.yaml-ban
          - path: /sap
            url: http://192.168.1.10:9000  # <- Backend URL
```

## Hibakereses

### UI5 nem toltodik be

1. Ellenorizd a bongeszo Network tab-ot
2. Nezd meg a Console hibauzeneteket
3. Ellenorizd, hogy a `fiori run` szerver fut-e
4. Local modban: `npm install` ujrafuttatas
5. CDN modban: ellenorizd az internet kapcsolatot
6. Backend modban: ellenorizd, hogy a backend szerver elerheto-e

### Error Overlay jelenik meg

Az error overlay (`ui5-error-handler.js`) ket esetben jelenik meg:
1. **Timeout** (15 mp): a SAPUI5 nem toltodott be idoben
2. **Script error**: a `sap-ui-core.js` halozati hiba vagy nem elerheto

Megoldas:
- Ellenorizd a futó `fiori run` szervert
- Ellenorizd a YAML konfiguraciot (helyes URL-ek)
- Probalj mas modot (pl. `npm run start:cdn` helyett `npm start`)

### Port foglalt

```bash
# Smart Start automatikusan kezeli:
npm start

# Vagy manualis kill:
lsof -ti:8300 | xargs kill -9   # macOS/Linux
```

## Repository

GitHub: [https://github.com/ac4y-auto/ui5-splash-screen-poc](https://github.com/ac4y-auto/ui5-splash-screen-poc)

## Szerzo

**ac4y** - ac4y-auto organization

## License

MIT

---

**Keszult Claude Code segitsegevel**
