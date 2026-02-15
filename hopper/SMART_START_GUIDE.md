# Smart Start Guide - Port Conflict Management

**Verzio**: 4.0
**Letrehozva**: 2026-02-15
**Statusz**: Production Ready

---

## Mi az a Smart Start?

A Smart Start egy intelligens szerver indito script, amely automatikusan kezeli a port konfliktusokat anelkul, hogy manualisan kellene leallitanod a futo folyamatokat.

### Problema

**Hagyomanyos start:**
```bash
npm start

# Hiba: Port 8300 is already in use
# EADDRINUSE: address already in use :::8300
```

**Megoldas eddig:**
1. Manualisan megkeresed a PID-t: `lsof -ti:8300`
2. Leolod: `kill -9 <PID>`
3. Ujra probalod: `npm start`

### Megoldas Smart Starttal

```bash
npm run smart-start  # Automatikusan kezeli a port konfliktust!
```

---

## Hasznalat

### Alapertelmezett (Local mod - ui5.yaml)

```bash
npm run smart-start
```

Ez a `fiori run`-t inditja a default `ui5.yaml` konfiguracioval (local SAPUI5 a node_modules-bol).

### Explicit Modok

```bash
npm run smart-start          # Local SAPUI5 (ui5.yaml) - default
npm run smart-start:cdn      # SAPUI5 CDN (ui5-cdn.yaml)
npm run smart-start:backend  # Backend szerver (ui5-backend.yaml)
```

### Custom Port

```bash
PORT=9000 npm run smart-start
PORT=9000 npm run smart-start:cdn
```

---

## v4.0 Valtozasok (Migracio)

### Regi architektura (v3.x)

```
start.js -> build.js (environment injection) -> http-server / ui5 serve
```

A regi rendszerben a `start.js`:
1. Futtatott egy `build.js` scriptet ami `index.template.html`-bol generalta az `index.html`-t
2. Injektalte az environment valtozot (`window.UI5_ENVIRONMENT = 'cdn'`)
3. `http-server`-t vagy `ui5 serve`-t inditott modtol fuggoen
4. 4 mod: cdn, local, backend, hybrid

### Uj architektura (v4.0)

```
start.js -> fiori run [--config yaml-file]
```

Az uj rendszerben a `start.js`:
1. **Nem futtat build scriptet** - nincs build.js, nincs index.template.html
2. **Nem injektal environment valtozot** - az `index.html` statikus
3. `fiori run`-t indit opcionalis `--config` parameterrel
4. 3 mod: Local (ui5.yaml), CDN (ui5-cdn.yaml), Backend (ui5-backend.yaml)

| Jellemzo | v3.x (regi) | v4.0 (uj) |
|----------|-------------|------------|
| **Szerver** | http-server / ui5 serve | fiori run |
| **Build** | build.js + index.template.html | Nincs (statikus index.html) |
| **Konfiguracio** | Environment valtozo injektalas | YAML fajlok (ui5.yaml, ui5-cdn.yaml, ui5-backend.yaml) |
| **Modok szama** | 4 (cdn, local, backend, hybrid) | 3 (local, cdn, backend) |
| **Mod parameter** | `node start.js cdn` | `node start.js ui5-cdn.yaml` |
| **Process azonositas** | http-server, ui5 serve | fiori, ui5 serve |

---

## Mukodes

### 1. Port Ellenorzes

A script ellenorzi, hogy a port (default: 8300) foglalt-e:

```javascript
// macOS/Linux
lsof -ti:8300 -sTCP:LISTEN

// Windows
netstat -ano | findstr :8300
```

### 2. Process Azonositas

Ha a port foglalt, megnezi, hogy **ehhez a projekthez** tartozik-e a process:

```javascript
// Ellenorzi a command line-t
ps -p <PID> -o command=

// Keres:
// - 'ui5-splash-screen-poc' (projekt marker)
// - 'fiori' (fiori run szerver)
// - 'ui5 serve' (ui5 CLI szerver)
```

> **v4.0 valtozas:** A `http-server` mar nem szerepel a keresett folyamatok kozott.
> Helyette `fiori` es `ui5 serve` a ket azonositando process.

### 3. Dontes

| Feltetel | Akcio |
|----------|-------|
| Port szabad | Szerver inditas |
| Port foglalt + sajat projekt | Process leol + Szerver inditas |
| Port foglalt + mas projekt | Hibauzenet + Exit |

### 4. Szerver Inditas

```javascript
const args = ['fiori', 'run', '--port', DEFAULT_PORT.toString(), '--open', 'index.html'];
if (configFile) {
    args.push('--config', configFile);
}

const server = spawn('npx', args, {
    stdio: 'inherit',
    env: {
        ...process.env,
        UI5_SPLASH_PROJECT: PROJECT_MARKER,
        PORT: DEFAULT_PORT.toString()
    }
});
```

---

## Kimenet Peldak

### Eset 1: Port Szabad

```
Smart Start
   Port: 8300
   Project: ui5-splash-screen-poc

Port 8300 is available

Starting fiori run...

info proxy /resources http://localhost:8300 -> local UI5 installation
```

### Eset 2: Port Foglalt (Sajat Projekt)

```
Smart Start
   Port: 8300
   Project: ui5-splash-screen-poc

Port 8300 is already in use (PID: 54321)
Process belongs to this project (ui5-splash-screen-poc)
Killing existing process (PID: 54321)...
Process killed successfully

Waiting for port to be released...
Port 8300 is now free

Starting fiori run...
```

### Eset 3: Port Foglalt (Mas Projekt)

```
Smart Start
   Port: 8300
   Project: ui5-splash-screen-poc

Port 8300 is already in use (PID: 99999)
Port 8300 is used by another application (PID: 99999)
   This process does NOT belong to ui5-splash-screen-poc
   Please stop it manually or use a different port:
   PORT=9000 npm run smart-start
```

---

## Biztonsagi Funkciok

### 1. Projekt Vedelem

A script **NEM oli le** mas projektek folyamatait:

```javascript
// Ellenorzi:
if (cmdLine.includes('ui5-splash-screen-poc') ||
    cmdLine.includes('fiori') ||
    cmdLine.includes('ui5 serve')) {
    // Biztonsagos leolni
} else {
    // STOP! Mas projekt folyamata
    process.exit(1);
}
```

### 2. PORT Validacio

```javascript
const rawPort = process.env.PORT || '8300';
const DEFAULT_PORT = parseInt(rawPort, 10);

if (isNaN(DEFAULT_PORT) || DEFAULT_PORT < 1 || DEFAULT_PORT > 65535) {
    console.error('Invalid PORT: ' + rawPort);
    process.exit(1);
}
```

Ez megakadalyozza a command injection-t (pl. `PORT="8300; rm -rf /" npm start`).

### 3. Process Marker

A szerver environment valtozoval van megjelolve:

```javascript
const server = spawn('npx', args, {
    env: {
        ...process.env,
        UI5_SPLASH_PROJECT: 'ui5-splash-screen-poc'
    }
});
```

### 4. Varakozasi Ido

Port felszabaditas utan **max 3 masodperc** varakozas:

```javascript
const start = Date.now();
while (Date.now() - start < 3000) {
    if (!getPortPID(DEFAULT_PORT)) {
        break;  // Port felszabadult
    }
}
```

---

## Troubleshooting

### Problema: "Failed to kill process"

**Ok:** Nincs jogosultsag a process leolesehez

**Megoldas:**
```bash
# macOS/Linux
sudo npm run smart-start

# Windows (Admin CMD)
npm run smart-start
```

### Problema: Port meg mindig foglalt

**Ok:** A process nem szabadult fel 3 masodpercen belul

**Megoldas:**
```bash
# Manualis leallitas
lsof -ti:8300 | xargs kill -9  # macOS/Linux
taskkill /PID <PID> /F         # Windows

# Vagy hasznalj masik portot
PORT=9000 npm run smart-start
```

### Problema: "Port is used by another application"

**Ok:** A port-on futo process **NEM** ehhez a projekthez tartozik

**Megoldas:**

**Opcio 1** - Leallitod a masik folyamatot:
```bash
lsof -ti:8300  # Megkapod a PID-t
kill -9 <PID>  # Leolod
```

**Opcio 2** - Masik portot hasznalsz:
```bash
PORT=9000 npm run smart-start
```

**Opcio 3** - Megnezed, mi fut a porton:
```bash
# macOS/Linux
lsof -i:8300

# Windows
netstat -ano | findstr :8300
```

---

## Osszehasonlitas

| | Hagyomanyos Start | Smart Start |
|---|---|---|
| **Port foglalt** | Hibauzenet, manualis leallitas | Automatikus kezeles |
| **Ismetelt futtatas** | Ujra hibat dob | Mindig indul |
| **Mas projekt vedelme** | Nincs vedelem | Biztonsagos |
| **Egyszeruseg** | 3 lepes (find PID, kill, restart) | 1 parancs |
| **Hibakezelés** | Nincs | Van (exit code, error msg) |

---

## Package.json Konfiguracio

```json
{
  "scripts": {
    "start": "npx fiori run --port 8300 --open index.html",
    "start:cdn": "npx fiori run --port 8300 --config ui5-cdn.yaml --open index.html",
    "start:local": "npx fiori run --port 8300 --open index.html",
    "start:backend": "npx fiori run --port 8300 --config ui5-backend.yaml --open index.html",
    "smart-start": "node start.js",
    "smart-start:cdn": "node start.js ui5-cdn.yaml",
    "smart-start:local": "node start.js",
    "smart-start:backend": "node start.js ui5-backend.yaml"
  }
}
```

**Magyarazat:**
- `npm start` -> Direkt fiori run (default ui5.yaml, local SAPUI5)
- `npm run start:cdn` -> Direkt fiori run CDN konfiggal
- `npm run smart-start` -> Smart Start (port cleanup + fiori run)
- `npm run smart-start:cdn` -> Smart Start CDN konfiggal

**Modok es YAML fajlok:**

| Mod | YAML | Honnan jon a SAPUI5? |
|-----|------|---------------------|
| Local (default) | `ui5.yaml` | node_modules (framework section) |
| CDN | `ui5-cdn.yaml` | fiori-tools-proxy -> sapui5.hana.ondemand.com |
| Backend | `ui5-backend.yaml` | fiori-tools-proxy -> CDN + backend proxy |

---

## Fejlesztoi Megjegyzesek

### start.js Architektura (v4.0)

```javascript
main() {
    1. getPortPID(8300) -> PID vagy null
    2. if (PID exists) {
        3. isProjectProcess(PID) -> true/false
        4. if (true) {
            5. killProcess(PID)
            6. wait 3s for port release
        } else {
            7. error + exit
        }
    }
    8. spawn('npx', ['fiori', 'run', '--port', '8300', '--open', 'index.html', ...])
       // Optional: '--config', configFile
}
```

> **v4.0 valtozas:** Nincs tobb `execSync('node build.js cdn')` lepes.
> A build lepes megszunt, a start.js kozvetlenul a `fiori run`-t inditja.

### Cross-Platform Kompatibilitas

| Platform | Port Check | Process Info | Kill |
|----------|-----------|--------------|------|
| **macOS** | `lsof -ti:8300 -sTCP:LISTEN` | `ps -p <PID> -o command=` | `kill -9 <PID>` |
| **Linux** | `lsof -ti:8300 -sTCP:LISTEN` | `ps -p <PID> -o command=` | `kill -9 <PID>` |
| **Windows** | `netstat -ano \| findstr :8300` | `wmic process where "ProcessId=<PID>" get CommandLine` | `taskkill /PID <PID> /F` |

---

## Best Practices

### 1. Hasznald a smart-start-ot fejleszteskor

```bash
# HELYES - port cleanup + szerver
npm run smart-start
npm run smart-start:cdn

# KERULED - nincs port cleanup
npm start
npm run start:cdn
```

### 2. Custom port csak dev kornyezetben

```bash
# DEV kornyezetben
PORT=9000 npm run smart-start

# Prod kornyezetben (hasznald az alapertelmezett 8300-at)
```

### 3. VSCode launch.json integracio

```json
{
    "name": "UI5 Splash - Smart Start (Local)",
    "type": "node",
    "request": "launch",
    "runtimeExecutable": "npm",
    "runtimeArgs": ["run", "smart-start"],
    "console": "integratedTerminal"
}
```

---

## Kapcsolodo Dokumentacio

- [README.md](README.md) - Projekt attekintes
- [RUNBOOK.md](RUNBOOK.md) - Operacios utmutato
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Projekt statusz

---

**Smart Start - Egyszerubb fejlesztes, kevesebb manualis munka!**
