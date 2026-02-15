# RUNBOOK - UI5 Splash Screen POC

**Projekt**: UI5 Splash Screen POC
**Lokacio**: `/Volumes/DevAPFS/work/ui5/ui5-splash-screen-poc`
**Port**: 8300
**Letrehozva**: 2026-02-12
**Frissitve**: 2026-02-15

---

## KRITIKUS SZABALYOK

### 0. **Kezelesi Attitud & Session Debrief**

**MINDEN session vegen kotelezo DEBRIEF irasa!**

#### Session Debrief Celja

A debrief dokumentum celja, hogy **rogzitse** a kovetkezoket:
- Mi keszult el (funkciok, fajlok, javitasok)
- Milyen problemak merultek fel (bugs, technikai akadalyok)
- Milyen dontesek szulettek (jo vs rossz dontesek)
- Milyen tanulsagok vonhatok le (technikai, workflow)
- Mi a kovetkezo lepes (TODO lista kovetkezo session-hez)

#### Debrief Helye

```
hopper/DEBRIEF_v{VERSION}.md
```

**Pelda**:
- `hopper/DEBRIEF_v3.1.md` - v3.1 session debrief
- `hopper/DEBRIEF_v3.2.md` - v3.2 session debrief

#### Debrief Struktura (Template)

```markdown
# DEBRIEF - Session v{VERSION}

**Datum**: YYYY-MM-DD
**Verzio**: X.Y.Z
**Session hossz**: ~X ora
**Fobb fejlesztesek**: Feature 1, Feature 2

---

## Session Celkituzesek
- [ ] Cel 1
- [ ] Cel 2

## Elkeszult Funkciok
### 1. Feature Name
- **Problema**: ...
- **Megoldas**: ...
- **Elonyok**: ...
- **Hatranyok**: ...

## Felderitett Problemak & Megoldasok
### 1. Bug Name
- **Tunet**: ...
- **Gyoker ok**: ...
- **Fix**: ...

## Jo Dontesek
### 1. Dontes
- **Indoklas**: ...
- **Visszajelzes**: ...

## Rossz Dontesek
### 1. Dontes
- **Problema**: ...
- **Tanulsag**: ...

## Tanulsagok
- Technikai tanulsagok
- Workflow tanulsagok

## Tovabbfejlesztesi Otletek
- Rovid tavu
- Kozeptavu
- Hosszu tavu

## Kovetkezo Session Fokusz
- Must Have
- Nice to Have
```

#### Mikor Irj Debrief-et?

**Session vege elott 15-30 perccel!**

- Minden feature elkeszult utan
- Minden commit elott
- Session lezaras elott
- Context valtas elott (ha mas projektre ugranal)

#### Debrief Best Practices

1. **Oszinteseg**: Rossz dontesek is benne vannak!
2. **Reszletesseg**: Code snippet-ek, hibakeresesi lepesek
3. **Tanulsagok**: Mit csinalnal maskeppe legkozelebb?
4. **Linkek**: Kapcsolodo dokumentumok cross-reference
5. **Metrikak**: LOC, fajlok szama, session hossz

#### Debrief Hasznalata

**Kovetkezo session-nel**:
1. Olvasd el az elozo debrief-et
2. Nezd meg a "Kovetkezo Session Fokusz" reszt
3. Folytasd ott, ahol abbahagytad

**Code review-nal**:
- Rossz dontesek review fokuszpontok
- Tanulsagok alapjan refactor

**Onboarding-nal**:
- Uj fejlesztok latjak a decision-making folyamatot
- Tanulsagok atadasa

---

### Kezelesi Attitud Szabalyok

**Claude munkastilus a projektben:**

1. **Proaktiv Teszteles**
   - Minden uj feature-t bongeszobe tesztelj
   - Screenshot-ok, console ellenorzes
   - Csak mukodo kodot mutass be a usernek

2. **Dokumentacio Karbantartas**
   - Minden valtozas -> dokumentacio frissites
   - Cross-reference linkek naprakeszen
   - README.md mindig aktualis

3. **Git Workflow**
   - Csak mukodo kod commit-olasa
   - Descriptive commit messages
   - Tag-eles minden release-nel

4. **Engedelyek Kezelese**
   - Uj Bash parancs -> settings.local.json update
   - RUNBOOK.md frissites
   - Atlathatosag

5. **Debrief Iras**
   - Session vege elott 15-30 perccel
   - Oszinte visszajelzes (jo + rossz dontesek)
   - Kovetkezo session fokusz

6. **TODO Tracking**
   - TodoWrite tool hasznalata multi-step taskoknal
   - Status frissites real-time
   - Cleanup ha stale

---

### 1. **UI5 Library Hasznalat** -- KIZAROLAG SAPUI5!

**KIZAROLAG SAPUI5 HASZNALHATO! OpenUI5 TILOS!**

- SAPUI5 - Hivatalos SAP UI5 library (licencelt, tamogatott)
- OpenUI5 - **TILOS** hasznalni (nyilt forraskodu, nem tamogatott ebben a projektben)

**Helyes CDN URL (fiori-tools-proxy konfiguracio):**
```yaml
# ui5-cdn.yaml vagy ui5-backend.yaml
server:
  customMiddleware:
    - name: fiori-tools-proxy
      configuration:
        ui5:
          url: https://sapui5.hana.ondemand.com   # HELYES - SAPUI5
          version: "1.105.0"

# TILOS:
#         url: https://sdk.openui5.org             # NE hasznald!
```

**Helyes index.html bootstrap:**
```html
<!-- Statikus src - fiori run / fiori-tools-proxy szolgalja ki -->
<script id="sap-ui-bootstrap"
    src="resources/sap-ui-core.js"
    ...>
</script>
```

**Ellenorzesi parancsok:**
```bash
# YAML konfigok ellenorzese (SAPUI5-nek kell lennie)
grep "sapui5.hana.ondemand.com" ui5-cdn.yaml ui5-backend.yaml
# Varhato output: url: https://sapui5.hana.ondemand.com (mindket fajlban)

# OpenUI5 ellenorzes (URESNEK kell lennie!)
grep -ri "openui5" ui5.yaml ui5-cdn.yaml ui5-backend.yaml index.html
# Varhato output: (ures) - ha van talalat, AZONNAL javitsd!

# Framework nev ellenorzes a YAML-okban
grep "name: SAPUI5" ui5.yaml ui5-cdn.yaml ui5-backend.yaml
# Varhato output: mindharom fajlban "name: SAPUI5"
```

**Ha OpenUI5-ot talalsz:**
1. AZONNAL javitsd a megfelelo YAML fajlt SAPUI5-re
2. Inditsd ujra a szervert: `npm start`

### 2. **Tesztelesi Protokoll**

**MINDIG Claude tesztel eloszor bongeszobe, CSAK UTANA szol a usernek!**

#### Lepesek:
1. Claude megnyitja a bongeszot
2. Claude naviga a megfelelo URL-re
3. Claude ellenorzi a funkciot (screenshot, console, network)
4. Claude elemzi az eredmenyt
5. **CSAK EZUTAN** szol a usernek, hogy nezzek ra

#### Miert?
- User idot sporol
- Claude elore eszleli a problemakat
- Csak mukodo funkciokat mutatunk be

### 3. **Engedelyek Kezelese**

**Minden uj Bash parancs elott ellenorizd a `.claude/settings.local.json` fajlt!**

#### Lepesek:
1. Ha a parancs NEM szerepel a `permissions.allow` listaban:
   - Futtasd a parancsot (user jovahagyja)
   - Azonnal add hozza a `.claude/settings.local.json`-hoz
   - Frissitsd a RUNBOOK.md-t az uj paranccsal
2. Ha a parancs szerepel:
   - Futtasd normalisan (nincs engedelykeres)

---

## Szerver Mukodes

### Aktiv Szerver
- **Port**: 8300
- **URL**: http://localhost:8300
- **Fooldal**: http://localhost:8300/index.html

### Szerver Inditas (fiori run)

**A `fiori run` parancs (a `@sap/ux-ui5-tooling` csomag resze) szolgalja ki az alkalmazast.**
Az uzzemmod a hasznalt YAML konfiguracios fajl altal van meghatarozva.

```bash
# Local mod (alapertelmezett - ui5.yaml, SAPUI5 framework a node_modules-bol)
npm start
# vagy
npm run start:local

# CDN mod (ui5-cdn.yaml, fiori-tools-proxy a sapui5.hana.ondemand.com-rol)
npm run start:cdn

# Backend mod (ui5-backend.yaml, CDN + backend proxy 192.168.1.10:9000)
npm run start:backend
```

**Smart Start parancsok** (port-ellenorzes + autokilll + fiori run):
```bash
npm run smart-start              # Local mod (alapertelmezett)
npm run smart-start:cdn          # CDN mod
npm run smart-start:local        # Local mod (explicit)
npm run smart-start:backend      # Backend mod
```

**Hogyan mukodik?**
1. `fiori run` a `ui5.yaml` (vagy `--config` altal megadott YAML) alapjan indul
2. A YAML `framework` szekcio meghatarozza a SAPUI5 verziót (1.105.0)
3. Local modban a UI5 CLI framework letolti es szolgalja a SAPUI5-ot
4. CDN/Backend modban a `fiori-tools-proxy` middleware proxy-zza a `/resources` kereseket
5. Megnyitja a bongeszot az `http://localhost:8300/index.html` URL-en

**Nincs build lepes!** Az `index.html` statikus, nincs template injection.

### Szerver Leallitas
```bash
# macOS - Port hasznalat ellenorzese
lsof -ti:8300

# macOS - Process leallitasa
kill -9 $(lsof -ti:8300)
```

### Hatterben Futo Task Ellenorzese
Ha a szerver task ID-vel fut, akkor a TaskOutput tool-lal ellenorizheto.

---

## Environment Modok (3 YAML konfig)

**Egyetlen URL minden modhoz:** `http://localhost:8300/index.html`

Az uzzemmod a szerver inditasakor valasztott YAML konfiguracioval van megadva. Az `index.html` mindig ugyanaz.

### 1. Local mod (alapertelmezett) -- `ui5.yaml`
- SAPUI5 a framework szekcio alapjan, a UI5 CLI tolti le es szolgalja
- Nincs proxy middleware
- Offline mukodes (elso letoltes utan)
- `npm start` vagy `npm run start:local`

### 2. CDN mod -- `ui5-cdn.yaml`
- `fiori-tools-proxy` middleware proxy-zza a SAPUI5-ot a `sapui5.hana.ondemand.com`-rol
- Internet kapcsolat szukseges
- Fix verzio: 1.105.0 (a YAML-ban megadva)
- `npm run start:cdn`

### 3. Backend mod -- `ui5-backend.yaml`
- `fiori-tools-proxy` a SAPUI5-ot CDN-rol + backend proxy `192.168.1.10:9000`-re
- LAN kapcsolat szukseges a backendhez
- `npm run start:backend`

### Osszefoglalo

| Mod | YAML | Proxy | SAPUI5 Forras | Halozat |
|-----|------|-------|---------------|---------|
| **Local** | `ui5.yaml` | Nincs | UI5 CLI framework | Nem kell (cache utan) |
| **CDN** | `ui5-cdn.yaml` | fiori-tools-proxy | sapui5.hana.ondemand.com | Internet |
| **Backend** | `ui5-backend.yaml` | fiori-tools-proxy | sapui5.hana.ondemand.com + backend | Internet + LAN |

---

## Tesztelesi Checklist

### Minden Valtoztatas Utan:

1. **Fajl mentes** - Ensure file is saved
2. **Browser teszteles Claude altal**:
   - [ ] Screenshot keszites
   - [ ] Console log ellenorzes
   - [ ] Network requests ellenorzes
   - [ ] Funkcio validalas
3. **User ertesites** - "Kesz, nezd meg te is!"

### Splash Screen Specifikus:
- [ ] Video betoltodik
- [ ] Poster megjelenik
- [ ] Autoplay mukodik
- [ ] Fade-out animacio smooth
- [ ] UI5 app betoltodik utana

### SAPUI5 Specifikus:
- [ ] `resources/sap-ui-core.js` betoltodik (Network tab)
- [ ] `sap.ui.version` elerheto a console-ban
- [ ] Nincs OpenUI5 referencia sehol
- [ ] Error overlay megjelenik, ha UI5 nem toltodik be (ui5-error-handler.js)

### Mod-specifikus:
- [ ] Local: `npm start` -> SAPUI5 a framework-bol
- [ ] CDN: `npm run start:cdn` -> proxy a sapui5.hana.ondemand.com-rol
- [ ] Backend: `npm run start:backend` -> CDN + backend proxy

---

## Git Workflow

### Minden Commit Elott:
```bash
git status
```

### Commit Uzenet Formatum:
```
type: Short description

- Detailed change 1
- Detailed change 2

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### Types:
- `feat:` - Uj funkcio
- `fix:` - Bugfix
- `docs:` - Dokumentacio
- `refactor:` - Refaktoralas
- `test:` - Tesztek
- `chore:` - Karbantartas

### Push
```bash
git push origin main
```

---

## Gyakori Muveletek

### YAML konfig modositas
Backend URL valtoztatas (`ui5-backend.yaml`):
```yaml
server:
  customMiddleware:
    - name: fiori-tools-proxy
      configuration:
        backend:
          - path: /sap
            url: http://YOUR_IP:YOUR_PORT
```

CDN verzio valtoztatas (minden YAML-ban):
```yaml
framework:
  name: SAPUI5
  version: "1.120.0"  # <- Uj verzio
```

### Splash Screen Idozites
`splash-screen.js` fajlban allithato.

### Video Sebesseg
```javascript
video.playbackRate = 0.2; // 0.2 = 5x lassabb
```

### Uj middleware hozzaadasa
A YAML `server.customMiddleware` szekcioban:
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

---

## Hibaalharitas

### Port Foglalt Hiba
```bash
# macOS - Ellenorizd mi hasznalja a portot
lsof -ti:8300

# macOS - Allitsd le a folyamatot
kill -9 $(lsof -ti:8300)

# Vagy hasznald a smart-start-ot (automatikusan kezeli):
npm run smart-start
```

### Backend Nem Elerheto
- Normalis ha 192.168.1.10:9000 offline
- Fallback: Hasznald Local vagy CDN mode-ot

### i18n 404 Errorok
- Nem kritikus
- i18n fajlok opcionalisak

### UI5 Nem Tolt Be
1. Ellenorizd Network tab-ot (F12) - `resources/sap-ui-core.js` betoltodik-e
2. Ellenorizd Console error-okat
3. Ellenorizd, hogy a `fiori run` szerver fut-e
4. Probald mas moddal (pl. `npm run start:cdn` helyett `npm start`)
5. Clear cache + hard reload (Cmd+Shift+R)

### fiori run nem indul
1. Ellenorizd hogy `@sap/ux-ui5-tooling` telepitve van-e: `npm list @sap/ux-ui5-tooling`
2. Ellenorizd a YAML szintaxist
3. Probald: `npm install` majd ujra `npm start`

### Error Overlay Megjelenik
- Az `ui5-error-handler.js` 15 masodperc utan mutatja, ha a SAPUI5 nem toltodott be
- Ellenorizd a Network tab-ot a `resources/sap-ui-core.js` keresert
- Ellenorizd, hogy a megfelelo mod szervere fut

---

## Monitoring

### Browser DevTools
- **Console**: Hibauezenetek, logok, `[UI5]` prefixu uzenetek az error handler-tol
- **Network**: Resource betoltes, timing, `resources/sap-ui-core.js` ellenorzes
- **Application**: LocalStorage ertekek

### Ellenorizendo:
- UI5 bootstrap script betoltodik (`resources/sap-ui-core.js`)
- Splash video letoltodik (908KB)
- Poster image betoltodik (25KB)
- Nincs CORS error
- Error overlay NEM jelenik meg (ha megjelenik, UI5 nem toltodott be)

---

## Gyors Referencia

### Dokumentaciok
- **README.md** - Hasznalati utmutato
- **hopper/RUNBOOK.md** - Ez a fajl (mukodesi utmutato)
- **hopper/CHEAT_SHEET.md** - Gyors referencia

### GitHub
- **Repo**: https://github.com/ac4y-auto/ui5-splash-screen-poc
- **User**: ac4y-auto
- **Branch**: main

### Eszkozok
- Node.js: v20.20.0
- Git: Telepitve
- GitHub CLI: Bejelentkezve (ac4y)

---

## Session Start Checklist

1. [ ] Ellenorizd git status
2. [ ] Ellenorizd szerver fut-e (port 8300)
3. [ ] Ha nem fut, inditsd: `npm start`
4. [ ] Nyisd meg bongeszobe: http://localhost:8300/index.html
5. [ ] **Claude tesztel eloszor**
6. [ ] Git pull ha kell: `git pull origin main`

---

## Session End Checklist

1. [ ] Minden valtoztatas commit-olva
2. [ ] Push GitHub-ra
3. [ ] Szerver leallithato (vagy futhat)

---

**Frissitve**: 2026-02-15
**Verzio**: 2.0 (fiori run architektura)
