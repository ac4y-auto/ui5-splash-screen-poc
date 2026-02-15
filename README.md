# UI5 Splash Screen POC

UI5 alkalmazás splash screen-nel, amely webm videót játszik le a betöltés alatt.

## 🎯 Funkciók

- ✅ **Splash Screen** videóval (5x lassított lejátszás, automatikus eltűnés)
- ✅ **3 Környezeti Konfiguráció**: CDN, Local (node_modules), Backend (192.168.1.10:9000)
- ✅ **Dinamikus UI5 betöltés** környezet alapján
- ✅ **NPM scriptek** különböző módokhoz
- ✅ **Poster kép** támogatás (100% képernyő)
- ✅ **Smooth fade-out** átmenet
- ✅ **Responsive** design
- ✅ **Modular Architecture** - Külső CSS/JS fájlok (v2.0)

## 🚀 Gyors Kezdés

### Telepítés

```bash
npm install
```

### Indítás

**Új (v3.0)**: Az üzemmód a szerver indításakor fix, nem URL paraméter!

#### 🌟 Smart Start (Ajánlott)

Automatikusan kezeli a port konfliktusokat:

```bash
# CDN verzió (alapértelmezett)
npm start

# Vagy explicit módon
npm run smart-start:cdn
npm run smart-start:local
npm run smart-start:backend
npm run smart-start:hybrid
```

**Smart Start funkciók:**
- ✅ Ellenőrzi, hogy a port (8300) foglalt-e
- ✅ Megnézi, hogy az a process ehhez a projekthez tartozik-e (`http-server` vagy `ui5 serve`)
- ✅ Ha igen, automatikusan leöli és újraindítja a szervert
- ✅ Ha nem (más projekt folyamata), hibát dob és NEM öli le

**Példa kimenet:**
```
🚀 Smart Start - CDN Mode
   Port: 8300
   Project: ui5-splash-screen-poc

⚠️  Port 8300 is already in use (PID: 12345)
✓  Process belongs to this project (ui5-splash-screen-poc)
🔄 Killing existing process (PID: 12345)...
✅ Process killed successfully
✓  Port 8300 is now free

🔧 Building for environment: cdn...
✅ Environment 'cdn' injected into index.html

🚀 Starting server...
```

#### Manuális Start

Ha Smart Start problémás, használd a manuális módot:

```bash
npm run start:cdn
npm run start:local
npm run start:backend
npm run start:hybrid
```

**Hogyan működik?**
- A `start:*` parancsok futtatják a `build.js` scriptet, amely beinjektálja a környezeti változót az `index.html`-be
- Ezután elindítják a megfelelő szervert (http-server vagy UI5 CLI)
- **Nincs szükség** URL paraméterre (`?env=cdn`), a konfiguráció build-time történik!

### Opcionális PORT Paraméter

Az alapértelmezett port **8300**, de felülírható környezeti változóval:

```bash
# Default port (8300)
npm start

# Custom port
PORT=9000 npm start
PORT=8080 npm run start:local
PORT=9090 npm run start:backend
```

**Szintaxis:** `${PORT:-8300}`
- `PORT` környezeti változóból olvas
- Ha nincs beállítva, **8300** az alapértelmezett
- Cross-platform (macOS, Linux, Windows Git Bash)

## 📁 Projekt Struktúra

### Gyökér
- `index.html` - **🌟 Főoldal** (generált fájl, ne szerkeszd közvetlenül!)
- `index.template.html` - **📝 Template** (ezt szerkeszd, ha változtatni akarsz)
- `config.js` - Környezeti konfiguráció (build-time injection)
- `build.js` - Build script (környezet beinjektálása a template-ből)
- `package.json` - NPM scriptek

### Működési Dokumentumok

📚 **Minden működési és fejlesztési dokumentum a [`hopper/`](hopper/) mappában található!**

**Gyors linkek**:
- [📘 RUNBOOK.md](hopper/RUNBOOK.md) - Operációs útmutató (kritikus szabályok)
- [📝 DEBRIEF_v3.1.md](hopper/DEBRIEF_v3.1.md) - Session debrief (tanulságok)
- [🚀 SMART_START_GUIDE.md](hopper/SMART_START_GUIDE.md) - Smart Start használat
- [📚 hopper/README.md](hopper/README.md) - Teljes dokumentációs index

### Legacy Fájlok (archív)
- `legacy/index-configurable.html` - Eredeti konfigurálható verzió (URL paraméter alapú)
- `legacy/index-minimal.html` - Minimális példa
- `legacy/index.html` - Eredeti CDN verzió
- `legacy/index-demo.html` - Demo verzió CSS animációval

### Splash Screen Modulok (v2.0)
- `splash-screen.css` - Splash screen stílusok
- `splash-screen.js` - Splash screen logika
- `ui5-bootstrap.js` - Dinamikus UI5 betöltés

### UI5 Komponensek
- `Component.js` - UI5 Component
- `manifest.json` - Alkalmazás manifest
- `view/App.view.xml` - Fő view
- `controller/App.controller.js` - Fő controller

### Média
- `splash-video.mp4` - Splash screen videó
- `splash-poster.jpeg` - Poster kép

### Dokumentáció
- `README.md` - Ez a fájl
- `KONZEPCIÓ.md` - Részletes koncepció és architektúra
- `FEJLESZTOI_UTASITAS.md` - Fejlesztői útmutató
- `INTEGRATION_PLAN.md` - WMS integrációs terv
- `REFACTORING_NOTES.md` - **ÚJ!** v2.0 refactoring részletek
- `CHEAT_SHEET.md` - Gyors referencia

## 🎬 Splash Screen Funkciók

- **Video attribútumok**: autoplay, loop, muted, playsinline
- **5x lassítás**: playbackRate = 0.2
- **2 perc időtartam**: 120 000 ms
- **Automatikus elrejtés**: A splash screen automatikusan eltűnik, amikor az UI5 betöltődik
- **Smooth átmenet**: 1 másodperces fade-out animáció
- **Responsive**: 80% szélesség/magasság, középre igazítva

## 🔧 Környezeti Konfigurációk

### 1. CDN Mód (Alapértelmezett)

OpenUI5-öt tölt be az internetes CDN-ről.

```bash
npm start
# vagy
npm run start:cdn
```

**URL**: `http://localhost:8300/` (automatikusan megnyílik)

### 2. Local Mód (node_modules)

Lokálisan telepített OpenUI5-öt használ.

**Telepítés**:
```bash
npm install @openui5/sap.ui.core @openui5/sap.m @openui5/themelib_sap_horizon
```

**Indítás**:
```bash
npm run start:local
```

**URL paraméterrel**:
```
http://localhost:8300/index-configurable.html?env=local
```

### 3. Backend Mód (Custom Server)

UI5-öt tölt be egy egyedi backend szerverről (192.168.1.10:9000).

```bash
npm run start:backend
```

**URL paraméterrel**:
```
http://localhost:8300/index-configurable.html?env=backend
```

**Backend követelmények**:
- UI5 resources elérhető a `/resources/` útvonalon
- CORS engedélyezve
- `http://192.168.1.10:9000/resources/sap-ui-core.js` elérhető

## 📚 Dokumentáció

Részletes információkért lásd:
- **[KONZEPCIÓ.md](KONZEPCIÓ.md)** - Architektúra, környezeti konfiguráció, best practices
- **[FEJLESZTOI_UTASITAS.md](FEJLESZTOI_UTASITAS.md)** - Fejlesztői útmutató, splash screen integráció

## 🎨 Testreszabás

### Környezet URL Módosítása

Szerkeszd a `config.js` fájlt:

```javascript
backend: {
    name: 'Backend Server',
    url: 'http://YOUR_SERVER:PORT/resources/sap-ui-core.js',
    description: 'Uses UI5 from custom backend server'
}
```

### Splash Screen Időtartam

Az `index-configurable.html` vagy `index.html` fájlban:

```javascript
}, 120000); // <- Változtasd ezt (ms)
```

### Videó Sebesség

```javascript
video.playbackRate = 0.2; // <- 0.2 = 5x lassabb
```

### Videó Méret

CSS módosítás:

```css
#splash-video {
    width: 80%;  /* <- Változtasd */
    height: 80%; /* <- Változtasd */
}
```

## 🐛 Hibakeresés

### UI5 nem töltődik be

1. Ellenőrizd a böngésző Network tab-ot
2. Nézd meg a Console hibaüzeneteket
3. Ellenőrizd a CORS beállításokat
4. Backend módban ellenőrizd, hogy a szerver elérhető-e

### Környezet nem vált

1. Töröld a localStorage-t: `localStorage.removeItem('ui5_env')`
2. Hard refresh: `Ctrl + Shift + R`
3. Ellenőrizd az URL paramétert

## 📦 Repository

GitHub: [https://github.com/ac4y-auto/ui5-splash-screen-poc](https://github.com/ac4y-auto/ui5-splash-screen-poc)

## 👥 Szerző

**ac4y** - ac4y-auto organization

## 📄 License

MIT

---

**Készült Claude Code segítségével** 🤖
