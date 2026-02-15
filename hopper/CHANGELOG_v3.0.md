# CHANGELOG v3.0 - Build-Based Environment Configuration

**Dátum**: 2026-02-15
**Verzió**: 3.0
**Szerző**: Claude Opus 4.6

---

## 🎯 Változtatások Összefoglalója

### 1. **Projekt Struktúra Átrendezés**

#### Legacy Fájlok
Minden korábbi HTML fájl átkerült a `legacy/` mappába:
- `legacy/index.html` - Eredeti CDN verzió
- `legacy/index-configurable.html` - URL paraméter alapú konfiguráció
- `legacy/index-minimal.html` - Minimális példa
- `legacy/index-demo.html` - Demo CSS animációval

#### Új Gyökér Struktúra
```
ui5-splash-screen-poc/
├── index.template.html    # 📝 TEMPLATE (ezt szerkeszd!)
├── index.html             # 🚫 GENERÁLT (ne szerkeszd!)
├── build.js               # ✅ Build script
├── config.js              # Frissítve build-time használatra
└── legacy/                # Archív HTML fájlok
```

---

## 🔧 Technikai Változások

### Build-Time Environment Injection

**Előtte (v2.0)**:
- URL paraméter: `?env=cdn`
- Runtime detekció: `getCurrentEnv()` URL-ből vagy localStorage-ból
- Minden oldal megosztott ugyanazt a HTML-t

**Utána (v3.0)**:
- Build script: `node build.js [cdn|local|backend|hybrid]`
- Template alapú generálás: `index.template.html` → `index.html`
- Környezet beinjektálva: `<script>window.UI5_ENVIRONMENT = 'cdn';</script>`
- Egyetlen URL: `http://localhost:8300/`

### config.js Módosítások

```javascript
// ELŐTTE (v2.0)
function getCurrentEnv() {
    const urlParams = new URLSearchParams(window.location.search);
    const envParam = urlParams.get('env');
    const envFromStorage = localStorage.getItem('ui5_env');
    return envParam || envFromStorage || 'cdn';
}

// UTÁNA (v3.0)
function getCurrentEnv() {
    // Environment is set at build time, not runtime
    return window.UI5_ENVIRONMENT || 'cdn';
}
```

### package.json Script Változások

```json
{
  "scripts": {
    "start": "npm run start:cdn",

    // Új: Build + Serve egy parancsban
    "start:cdn": "node build.js cdn && http-server -p 8300 --cors -o",
    "start:local": "node build.js local && npx ui5 serve --port 8300 --open",
    "start:backend": "node build.js backend && http-server -p 8300 --cors -o",
    "start:hybrid": "node build.js hybrid && npx ui5 serve --port 8300 --config ui5-backend.yaml --open",

    // Új: Csak build (szerver nélkül)
    "build": "node build.js",

    // Új: Csak szerver (build nélkül)
    "serve:cdn": "http-server -p 8300 --cors -o",
    "serve:local": "npx ui5 serve --port 8300 --open"
  }
}
```

---

## 📝 build.js - Új Fájl

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get environment from command line
const env = process.argv[2] || 'cdn';

// Validate
const validEnvs = ['cdn', 'local', 'backend', 'hybrid'];
if (!validEnvs.includes(env)) {
    console.error(`❌ Invalid environment: ${env}`);
    process.exit(1);
}

// Read template
const templatePath = path.join(__dirname, 'index.template.html');
const outputPath = path.join(__dirname, 'index.html');
let templateContent = fs.readFileSync(templatePath, 'utf8');

// Inject environment
const envInjection = `<script>window.UI5_ENVIRONMENT = '${env}';</script>`;
const indexContent = templateContent.replace('{{ENV_INJECTION}}', envInjection);

// Write output
fs.writeFileSync(outputPath, indexContent, 'utf8');

console.log(`✅ Environment '${env}' injected into index.html`);
```

---

## 📋 index.template.html - Template Struktúra

```html
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <title>UI5 Splash Screen POC</title>

    <!-- Environment configuration (injected at build/server start) -->
    {{ENV_INJECTION}}
    <script src="config.js"></script>

    <!-- Splash screen styles -->
    <link rel="stylesheet" href="splash-screen.css">

    <!-- UI5 Bootstrap (dynamic injection based on environment) -->
    <script src="ui5-bootstrap.js"></script>

    <!-- Splash screen logic -->
    <script src="splash-screen.js"></script>
</head>
<body class="sapUiBody loading">
    <!-- Splash Screen Container -->
    <div id="splash-screen">
        <video autoplay muted loop playsinline poster="splash-poster.jpeg">
            <source src="splash-video.mp4" type="video/mp4">
        </video>
    </div>

    <!-- Environment Badge -->
    <div id="env-badge"></div>

    <!-- UI5 Application Container -->
    <div data-sap-ui-component ...></div>
</body>
</html>
```

**Placeholder**: `{{ENV_INJECTION}}` - Build scripttel helyettesítve

---

## 🚀 Használat

### Szerver Indítás

```bash
# CDN mód (alapértelmezett)
npm start

# Local mód (UI5 CLI)
npm run start:local

# Backend mód
npm run start:backend

# Hybrid mód (backend + proxy)
npm run start:hybrid
```

### Manuális Build + Serve

```bash
# 1. Build for environment
npm run build cdn

# 2. Start server
npm run serve:cdn
```

### Ellenőrzés

```bash
# Ellenőrizd az injektált környezetet
curl http://localhost:8300/ | grep "UI5_ENVIRONMENT"

# Várható output:
# <script>window.UI5_ENVIRONMENT = 'cdn';</script>
```

---

## 📚 Dokumentáció Frissítések

### README.md
- ✅ Frissített "Gyors Kezdés" szekció
- ✅ Új "Projekt Struktúra" leírás
- ✅ Build-based workflow magyarázat

### RUNBOOK.md
- ✅ Új "Engedélyek Kezelése" szekció
- ✅ Frissített "Szerver Működés"
- ✅ Egyetlen URL mindenhol: `http://localhost:8300/`

### .gitignore
- ✅ Hozzáadva: `index.html` (generált fájl)

### .claude/settings.local.json
- ✅ Hozzáadva: `Bash(node build.js:*)`, `Bash(open:*)`, stb.

---

## ✅ Előnyök

| Szempont | v2.0 (URL paraméter) | v3.0 (Build-based) |
|----------|----------------------|--------------------|
| **URL tisztaság** | `?env=cdn` szükséges | Egyetlen URL: `/` |
| **Konfiguráció** | Runtime (localStorage) | Build-time (determinisztikus) |
| **Cache-elhetőség** | Korlátozott | Teljes (statikus HTML) |
| **Hibalehetőség** | User elronthatja URL-t | Build script validál |
| **Deployment** | 1 HTML minden envhez | Env-specifikus build |
| **Debug** | URL-től függ | Build időben fix |

---

## 🔍 Tesztelés

### Tesztelési Lépések

1. **Build ellenőrzés**:
   ```bash
   node build.js cdn
   grep "UI5_ENVIRONMENT" index.html
   # Várható: <script>window.UI5_ENVIRONMENT = 'cdn';</script>
   ```

2. **Szerver indítás**:
   ```bash
   npm run start:cdn
   ```

3. **Böngésző ellenőrzés**:
   - Megnyílik: `http://localhost:8300/`
   - Console-ban: `window.UI5_ENVIRONMENT` → `'cdn'`
   - Environment badge látható: "CDN (SAPUI5 1.105.0)"

4. **Különböző módok**:
   ```bash
   npm run start:local   # Local UI5 CLI
   npm run start:backend # Backend server
   npm run start:hybrid  # Hybrid proxy
   ```

### Sikerkritériumok

- ✅ `index.html` dinamikusan generálódik
- ✅ `window.UI5_ENVIRONMENT` helyesen injektálva
- ✅ Splash screen működik minden módban
- ✅ UI5 betöltődik a megfelelő forrásból
- ✅ Environment badge mutatja az aktív környezetet

---

## 🎓 Megjegyzések Fejlesztőknek

### FONTOS: Ne szerkeszd közvetlenül az index.html-t!

Az `index.html` **generált fájl** - a `build.js` minden futtatáskor felülírja.

**Helyette**:
1. Szerkeszd az `index.template.html`-t
2. Futtasd a `node build.js [env]` parancsot
3. Az `index.html` frissül a változásokkal

### Template Placeholder

A `{{ENV_INJECTION}}` helyőrző automatikusan helyettesítődik:
```html
<!-- TEMPLATE -->
{{ENV_INJECTION}}

<!-- GENERÁLT OUTPUT -->
<script>window.UI5_ENVIRONMENT = 'cdn';</script>
```

### Git Workflow

```bash
# Csak a template-et commit-old!
git add index.template.html
git add build.js

# NE add hozzá az index.html-t (.gitignore-ban van)
# git add index.html  ❌ NE!

git commit -m "feat: Add new template feature"
```

---

## 🔮 Jövőbeli Fejlesztések

- [ ] **Multi-environment builds**: Egyszer buildel, minden env-hez generál HTML-t
- [ ] **CI/CD integráció**: GitHub Actions build minden pushnál
- [ ] **Version injection**: Package.json verzió beinjektálása
- [ ] **Minification**: HTML/CSS/JS minifikáció build időben
- [ ] **Source maps**: Debug mode támogatás

---

## 📞 Kapcsolat & Támogatás

**Projekt**: https://github.com/ac4y-auto/ui5-splash-screen-poc
**Verziók**: [Releases](https://github.com/ac4y-auto/ui5-splash-screen-poc/releases)
**Issues**: [GitHub Issues](https://github.com/ac4y-auto/ui5-splash-screen-poc/issues)

---

**v3.0 - Build-based workflow** ✨
