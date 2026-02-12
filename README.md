# UI5 Splash Screen POC

UI5 alkalmazás splash screen-nel, amely webm videót játszik le a betöltés alatt.

## 🎯 Funkciók

- ✅ **Splash Screen** videóval (5x lassított lejátszás, 2 perc időtartam)
- ✅ **3 Környezeti Konfiguráció**: CDN, Local (node_modules), Backend (192.168.1.10:9000)
- ✅ **Dinamikus UI5 betöltés** környezet alapján
- ✅ **NPM scriptek** különböző módokhoz
- ✅ **Poster kép** támogatás
- ✅ **Smooth fade-out** átmenet
- ✅ **Responsive** design

## 🚀 Gyors Kezdés

### Telepítés

```bash
npm install
```

### Indítás

```bash
# CDN verzió (alapértelmezett)
npm start

# Local verzió (node_modules)
npm run start:local

# Backend verzió (192.168.1.10:9000)
npm run start:backend
```

## 📁 Fájlok

### Fő Fájlok
- `index.html` - Eredeti CDN verzió (kompatibilitás)
- `index-configurable.html` - **ÚJ!** Konfigurálható verzió (ajánlott)
- `index-demo.html` - Demo verzió (CSS animációval)
- `config.js` - Környezeti konfiguráció
- `package.json` - NPM scriptek

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
- `KONZEPCIÓ.md` - **ÚJ!** Részletes koncepció és architektúra
- `FEJLESZTOI_UTASITAS.md` - Fejlesztői útmutató

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

**URL paraméterrel**:
```
http://localhost:8300/index-configurable.html?env=cdn
```

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
