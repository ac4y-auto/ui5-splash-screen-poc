# CHEAT SHEET - UI5 Splash Screen POC

**Gyors referencia a fiori run architekturához**

---

## PROJEKT ALAPADATOK

| Tulajdonsag | Ertek |
|-------------|-------|
| **Port** | `8300` |
| **URL** | http://localhost:8300/index.html |
| **SAPUI5 verzio** | `1.105.0` |
| **Theme** | `sap_horizon` |
| **CompatVersion** | `edge` |
| **UI5 library** | **SAPUI5 ONLY** (OpenUI5 TILOS!) |
| **Szerver** | `fiori run` (@sap/ux-ui5-tooling) |
| **GitHub** | https://github.com/ac4y-auto/ui5-splash-screen-poc |

---

## 4 UZZEMMOD (YAML konfigok)

| Mod | YAML fajl | SAPUI5 forras | Proxy | Halozat |
|-----|-----------|---------------|-------|---------|
| **Local** (default) | `ui5.yaml` | UI5 CLI framework (node_modules) | Nincs | Nem kell |
| **CDN** | `ui5-cdn.yaml` | sapui5.hana.ondemand.com via proxy | fiori-tools-proxy | Internet |
| **Backend** | `ui5-backend.yaml` | CDN + backend 192.168.1.10:9000 | fiori-tools-proxy | Internet + LAN |
| **Hybrid** | `ui5-hybrid.yaml` | Lokalis framework cache (~/.ui5/) | fiori-tools-proxy (/sap) | LAN |

**Fontos**: Az `index.html` mindig ugyanaz. A mod a YAML konfiggal van meghatarozva szerver inditaskor.

**Hybrid mod**: A `/resources` es `/test-resources` a lokalis framework szolgalja ki (gyors), a `/sap` a backend-re proxy-zodik (valodi adat).

---

## NPM PARANCSOK

### Kozvetlen fiori run parancsok

| Parancs | Mod | Leiras |
|---------|-----|--------|
| `npm start` | Local | Alapertelmezett, ui5.yaml |
| `npm run start:local` | Local | Explicit local mod |
| `npm run start:cdn` | CDN | ui5-cdn.yaml, SAPUI5 CDN proxy |
| `npm run start:backend` | Backend | ui5-backend.yaml, CDN + backend proxy |
| `npm run start:hybrid` | Hybrid | ui5-hybrid.yaml, lokalis UI5 + backend proxy |

### Smart Start parancsok (port-kezeles + fiori run)

| Parancs | Mod | Leiras |
|---------|-----|--------|
| `npm run smart-start` | Local | Port ellenorzes + start |
| `npm run smart-start:local` | Local | Explicit local |
| `npm run smart-start:cdn` | CDN | Port ellenorzes + CDN mod |
| `npm run smart-start:backend` | Backend | Port ellenorzes + backend mod |
| `npm run smart-start:hybrid` | Hybrid | Port ellenorzes + hybrid mod |

### Purge (port felszabaditas)

| Parancs | Leiras |
|---------|--------|
| `npm run purge` | Leallitja a projekt processzt a porton (8300) |
| `PORT=9000 npm run purge` | Custom port purge |
| `npm run purge && npm run start:hybrid` | Purge + azonnali ujrainditas |
| `npm run purge && npm run smart-start` | Purge + smart start |

**Fontos**: A `purge` csak projekthez tartozo processzt ol le (ui5-splash-screen-poc/fiori/ui5 markerek). Ismeretlen processzt visszautasitja.

**Megjegyzes**: A `start.js` (Smart Start) NEM oli le a processzt — csak ellenorzi, hogy a port szabad-e. Ha foglalt, hasznald elobb a `npm run purge`-ot.

### Egyeb
```bash
npm install                    # Fuggosegek telepitese
npm list                       # Fuggosegek ellenorzese
```

---

## FONTOS FAJLOK

### Alkalmazas
| Fajl | Leiras |
|------|--------|
| `index.html` | Fo HTML (statikus, SAPUI5 bootstrap + splash screen) |
| `splash-screen.css` | Splash screen stilusok |
| `splash-screen.js` | Splash screen logika |
| `ui5-error-handler.js` | SAPUI5 betoltesi hiba overlay (timeout 15s + script error) |
| `Component.js` | UI5 Component |
| `manifest.json` | UI5 app manifest (minUI5Version: 1.105.0) |
| `view/App.view.xml` | Fo nezet |
| `controller/App.controller.js` | Fo controller |

### Konfiguracio
| Fajl | Leiras |
|------|--------|
| `ui5.yaml` | Local mod (default) - SAPUI5 framework, nincs proxy |
| `ui5-cdn.yaml` | CDN mod - fiori-tools-proxy a sapui5.hana.ondemand.com-rol |
| `ui5-backend.yaml` | Backend mod - CDN + backend proxy (192.168.1.10:9000) |
| `ui5-hybrid.yaml` | Hybrid mod - lokalis UI5 + backend proxy (192.168.1.10:9000) |
| `package.json` | NPM konfiguracio, script-ek |
| `start.js` | Smart Start script (port ellenorzes, NEM ol le processzt) |
| `purge.js` | Purge script (biztonsagos process leallitas a porton) |

### Splash Screen eszkozok
| Fajl | Meret |
|------|-------|
| `splash-video.mp4` | ~908 KB |
| `splash-poster.jpeg` | ~25 KB |

---

## SPLASH SCREEN BEALLITASOK

### Video Sebesseg
```javascript
// splash-screen.js
video.playbackRate = 0.2; // 5x lassabb (0.2 = 20%)
```

### Fade-out Animacio
```css
/* splash-screen.css */
transition: opacity 0.5s ease-out; /* 500ms fade */
```

### Video Meret
```css
/* splash-screen.css */
#splash-video {
    width: 80%;
    height: 80%;
    object-fit: contain;
}
```

### Error Handler Timeout
```javascript
// ui5-error-handler.js
var LOAD_TIMEOUT_MS = 15000; // 15 masodperc utan error overlay
```

---

## GYORS HIBAALHARITAS

### Port foglalt
```bash
# Purge (ajanlott):
npm run purge                        # Biztonsagos leallitas
npm run smart-start                  # Majd ujrainditas

# Egy lepesben:
npm run purge && npm run start:hybrid

# Manualis:
lsof -ti:8300
kill -9 $(lsof -ti:8300)
npm start
```

### UI5 nem tolt be
1. Network tab (F12): `resources/sap-ui-core.js` betoltodik-e?
2. Fut-e a `fiori run` szerver?
3. Console error-ok
4. Probald mas moddal: `npm run start:cdn`
5. Hard reload: Cmd+Shift+R

### Error overlay megjelenik
- Az `ui5-error-handler.js` 15 mp utan mutatja ha SAPUI5 nem toltodott be
- Ellenorizd a szerver futasat es a Network tab-ot

### Backend nem elerheto
- Normalis, ha 192.168.1.10:9000 offline
- Hasznald Local (`npm start`) vagy CDN (`npm run start:cdn`) modot

### fiori run nem indul
```bash
npm list @sap/ux-ui5-tooling    # Telepitve van?
npm install                      # Ujratelepites
npm start                        # Ujra probalkozas
```

### i18n 404 error-ok
- Nem kritikus, i18n fajlok opcionalisak

---

## TESZTELESI URL-EK

Minden mod ugyanazt az URL-t hasznalja:
```
http://localhost:8300/index.html
```

A kulonbseg a szerver inditasi parancsaban van (melyik YAML-t hasznalja).

### Ellenorzesek bongeszobe (F12 Console):
```javascript
// UI5 verzio lekerdezes
sap.ui.version

// UI5 betoltodott-e
typeof sap !== 'undefined'

// Splash screen manual trigger
document.getElementById('splash-screen').classList.remove('fade-out');
```

---

## SAPUI5 ELLENORZES

```bash
# YAML-ok ellenorzese (SAPUI5 kell, NEM OpenUI5!)
grep "sapui5.hana.ondemand.com" ui5-cdn.yaml ui5-backend.yaml
grep "name: SAPUI5" ui5.yaml ui5-cdn.yaml ui5-backend.yaml ui5-hybrid.yaml

# OpenUI5 keresese (URESNEK kell lennie!)
grep -ri "openui5" ui5.yaml ui5-cdn.yaml ui5-backend.yaml ui5-hybrid.yaml index.html
```

---

## DEVDEPENDENCIES

```json
{
  "devDependencies": {
    "@sap/ux-ui5-tooling": "^1.20.2",
    "@ui5/cli": "^4.0.43"
  }
}
```

Nincs tobb: `http-server`, `cross-env`, `ui5-middleware-simpleproxy`.

---

## GIT

```bash
git status
git add .
git commit -m "feat: Description

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push origin main
git log --oneline -10
```

---

## GYORS START

```bash
# 1. Projekt konyvtar
cd /Volumes/DevAPFS/work/ui5/ui5-splash-screen-poc

# 2. Szerver inditas (Local mod, alapertelmezett)
npm start

# 3. Bongeszo megnyilik automatikusan:
#    http://localhost:8300/index.html

# 4. Git ellenorzes
git status
```

---

## HASZNOS LINKEK

- **SAPUI5 SDK**: https://sapui5.hana.ondemand.com/
- **SAPUI5 Documentation**: https://sapui5.hana.ondemand.com/#/topic
- **SAP Fiori Tools**: https://www.npmjs.com/package/@sap/ux-ui5-tooling
- **UI5 CLI**: https://sap.github.io/ui5-tooling/
- **Project GitHub**: https://github.com/ac4y-auto/ui5-splash-screen-poc

---

**Utolso frissites**: 2026-02-15
**Verzio**: 4.0 (hybrid mod + purge parancs)
**Allapot**: Production Ready
