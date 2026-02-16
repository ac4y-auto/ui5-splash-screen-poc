# Smart Start Guide - Port Conflict Management

**Verzio**: 4.0
**Letrehozva**: 2026-02-15
**Statusz**: Production Ready

---

## Mi az a Smart Start?

A Smart Start egy intelligens szerver indito script, amely ellenorzi a port elerehetoseget es elindtija a `fiori run`-t. A v4.0-tol a **start.js csak ellenorzi a portot** — NEM oli le a futo folyamatokat. A folyamatok leolesere kulon eszkoz all rendelkezesre: a **purge.js** (`npm run purge`).

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
npm run purge        # Leoli a futo projektet a porton (ha van)
npm run smart-start  # Ellenorzi a portot es inditja a szervert
```

**Vagy egyetlen sorban:**
```bash
npm run purge && npm run smart-start  # Biztonsagos ujrainditas
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
npm run smart-start:hybrid   # Hybrid mod (ui5-hybrid.yaml) - local UI5 + backend
```

### Hybrid Mod

A hybrid mod a **local SAPUI5 framework** es a **backend proxy** kombinacioja:
- **SAPUI5**: Local framework cache-bol (`~/.ui5/`, SAPUI5 1.105.0)
- **Backend**: `/sap` utvonal proxy-zva a `http://192.168.1.10:9000` cimre
- **`/resources` es `/test-resources`**: Lokalisan szolgalja a framework (NEM proxy-zott)

```bash
npm run smart-start:hybrid
# vagy
npm run purge && npm run smart-start:hybrid  # Ha a port foglalt
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
3. **Nem oli le a futo folyamatokat** - csak ellenorzi a portot (lasd `purge.js`)
4. `fiori run`-t indit opcionalis `--config` parameterrel
5. 4 mod: Local (ui5.yaml), CDN (ui5-cdn.yaml), Backend (ui5-backend.yaml), Hybrid (ui5-hybrid.yaml)

| Jellemzo | v3.x (regi) | v4.0 (uj) |
|----------|-------------|------------|
| **Szerver** | http-server / ui5 serve | fiori run |
| **Build** | build.js + index.template.html | Nincs (statikus index.html) |
| **Konfiguracio** | Environment valtozo injektalas | YAML fajlok (ui5.yaml, ui5-cdn.yaml, ui5-backend.yaml, ui5-hybrid.yaml) |
| **Modok szama** | 4 (cdn, local, backend, hybrid) | 4 (local, cdn, backend, hybrid) |
| **Process kill** | start.js vegzi | Kulon: purge.js (`npm run purge`) |
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

### 2. Dontes (start.js)

> **v4.0 valtozas:** A `start.js` **NEM oli le** a futo folyamatokat. Csak ellenorzi a portot.
> Ha a port foglalt, hibauzenettel leall es a `npm run purge` futtatast javasolja.

| Feltetel | Akcio |
|----------|-------|
| Port szabad | Szerver inditas |
| Port foglalt | Hibauzenet + `npm run purge` javaslat + Exit |

### 2b. Purge (purge.js) - Kulon Process Killer

A **purge.js** (`npm run purge`) vegzi a process azonositast es leolest:

```javascript
// Ellenorzi a command line-t
ps -p <PID> -o command=

// Keres:
// - 'ui5-splash-screen-poc' (projekt marker)
// - 'fiori' (fiori run szerver)
// - 'ui5 serve' (ui5 CLI szerver)
```

| Feltetel | Akcio |
|----------|-------|
| Port szabad | "Nothing to purge" + Exit 0 |
| Port foglalt + sajat projekt | Process leol + port felszabadul |
| Port foglalt + mas projekt | **Megtagadja** a leolest + Exit 1 |

**Biztonsag:** A purge.js **CSAK** a projekt sajat folyamatait oli le (ui5-splash-screen-poc / fiori / ui5 markerek). Mas alkalmazasokat NEM bant.

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

### Eset 2: Port Foglalt (start.js)

```
Smart Start
   Port: 8300

❌ Port 8300 is already in use (PID: 54321)
   Run first:  npm run purge
   Or use:     PORT=9000 npm run smart-start
```

> A start.js **NEM** probalja leolni a folyamatot — egyszeruen megallit es javaslatot ad.

### Eset 3: Purge — Sajat Projekt

```
🧹 Purge
   Port: 8300
   Project: ui5-splash-screen-poc

⚠️  Port 8300 is in use (PID: 54321)
✓  Process belongs to ui5-splash-screen-poc
🔄 Killing PID 54321...
✅ Purged — port 8300 is free
```

### Eset 4: Purge — Mas Projekt (MEGTAGADVA)

```
🧹 Purge
   Port: 8300
   Project: ui5-splash-screen-poc

⚠️  Port 8300 is in use (PID: 99999)
❌ Process does NOT belong to ui5-splash-screen-poc
   Refusing to kill. Stop it manually or use a different port:
   PORT=9000 npm run smart-start
```

### Eset 5: Purge + Smart Start (Teljes Workflow)

```bash
npm run purge && npm run smart-start:hybrid
```

```
🧹 Purge
   Port: 8300
   Project: ui5-splash-screen-poc

✓  Port 8300 is free — nothing to purge

🚀 Smart Start
   Port: 8300
   Config: ui5-hybrid.yaml

✓  Port 8300 is available
🚀 Starting fiori run...
```

---

## Biztonsagi Funkciok

### 1. Projekt Vedelem (purge.js)

A **purge.js** (NEM a start.js) vegzi a folyamat leoleseket, es **NEM oli le** mas projektek folyamatait:

```javascript
// purge.js - Ellenorzi:
if (cmdLine.includes('ui5-splash-screen-poc') ||
    cmdLine.includes('fiori') ||
    cmdLine.includes('ui5 serve')) {
    // Biztonsagos leolni
} else {
    // STOP! Mas projekt folyamata — MEGTAGADVA
    process.exit(1);
}
```

> **v4.0 valtozas:** A start.js-bol kikerult a process kill logika.
> A start.js csak port-ellenorzest vegez, a purge.js a dedikalt kill eszkoz.

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

### Problema: "Port is already in use" (start.js)

**Ok:** A port foglalt es a start.js nem tud indulni

**Megoldas:**
```bash
# Eloszor purge, aztan start
npm run purge && npm run smart-start
```

### Problema: "Failed to kill process" (purge.js)

**Ok:** Nincs jogosultsag a process leolesehez

**Megoldas:**
```bash
# macOS/Linux
sudo npm run purge

# Windows (Admin CMD)
npm run purge
```

### Problema: Port meg mindig foglalt (purge utan)

**Ok:** A process nem szabadult fel 3 masodpercen belul

**Megoldas:**
```bash
# Manualis leallitas
lsof -ti:8300 | xargs kill -9  # macOS/Linux
taskkill /PID <PID> /F         # Windows

# Vagy hasznalj masik portot
PORT=9000 npm run smart-start
```

### Problema: "Process does NOT belong to..." (purge.js)

**Ok:** A port-on futo process **NEM** ehhez a projekthez tartozik — a purge.js megtagadja a leolest

**Megoldas:**

**Opcio 1** - Leallitod a masik folyamatot manualisan:
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

| | Hagyomanyos Start | Purge + Smart Start |
|---|---|---|
| **Port foglalt** | Hibauzenet, manualis leallitas | `npm run purge && npm run smart-start` |
| **Ismetelt futtatas** | Ujra hibat dob | Mindig indul |
| **Mas projekt vedelme** | Nincs vedelem | Biztonsagos (purge.js ellenorzi) |
| **Egyszeruseg** | 3 lepes (find PID, kill, restart) | 1-2 parancs |
| **Hibakezelés** | Nincs | Van (exit code, error msg) |

---

## Package.json Konfiguracio

```json
{
  "scripts": {
    "start": "npx fiori run --port 8300 --open index.html",
    "start:local": "npx fiori run --port 8300 --open index.html",
    "start:cdn": "npx fiori run --port 8300 --config ui5-cdn.yaml --open index.html",
    "start:backend": "npx fiori run --port 8300 --config ui5-backend.yaml --open index.html",
    "start:hybrid": "npx fiori run --port 8300 --config ui5-hybrid.yaml --open index.html",
    "smart-start": "node start.js",
    "smart-start:local": "node start.js",
    "smart-start:cdn": "node start.js ui5-cdn.yaml",
    "smart-start:backend": "node start.js ui5-backend.yaml",
    "smart-start:hybrid": "node start.js ui5-hybrid.yaml",
    "purge": "node purge.js"
  }
}
```

**Magyarazat:**
- `npm start` -> Direkt fiori run (default ui5.yaml, local SAPUI5)
- `npm run start:cdn` -> Direkt fiori run CDN konfiggal
- `npm run start:hybrid` -> Direkt fiori run Hybrid konfiggal (local UI5 + backend)
- `npm run smart-start` -> Smart Start (port ellenorzes + fiori run)
- `npm run smart-start:cdn` -> Smart Start CDN konfiggal
- `npm run smart-start:hybrid` -> Smart Start Hybrid konfiggal
- `npm run purge` -> Kulon process killer (leoli a sajat projektet a porton)

**Ajanlott workflow (port foglaltsag eseten):**
```bash
npm run purge && npm run smart-start:hybrid
```

**Modok es YAML fajlok:**

| Mod | YAML | Honnan jon a SAPUI5? | Backend |
|-----|------|---------------------|---------|
| Local (default) | `ui5.yaml` | Local framework cache (~/.ui5/) | Nincs |
| CDN | `ui5-cdn.yaml` | fiori-tools-proxy -> sapui5.hana.ondemand.com | Nincs |
| Backend | `ui5-backend.yaml` | fiori-tools-proxy -> CDN | /sap -> 192.168.1.10:9000 |
| **Hybrid** | `ui5-hybrid.yaml` | **Local framework cache (~/.ui5/)** | **/sap -> 192.168.1.10:9000** |

---

## Fejlesztoi Megjegyzesek

### start.js Architektura (v4.0)

```javascript
// start.js - Csak port check + szerver inditas
main() {
    1. getPortPID(8300) -> PID vagy null
    2. if (PID exists) {
        3. error("Port in use, run: npm run purge") + exit(1)
    }
    4. spawn('npx', ['fiori', 'run', '--port', '8300', '--open', 'index.html', ...])
       // Optional: '--config', configFile
}
```

### purge.js Architektura (v4.0)

```javascript
// purge.js - Kulon process killer
main() {
    1. getPortPID(8300) -> PID vagy null
    2. if (!PID) {
        3. "Nothing to purge" + exit(0)
    }
    4. isProjectProcess(PID) -> true/false
    5. if (!isProjectProcess) {
        6. "Refusing to kill" + exit(1)
    }
    7. killProcess(PID)
    8. wait max 3s for port release
    9. verify port is free
}
```

> **v4.0 valtozas:** A process kill logika kulon fajlba (purge.js) kerult.
> A start.js mar NEM tartalmaz kill funkciót — csak port ellenorzest vegez.
> Nincs tobb `execSync('node build.js cdn')` lepes.
> A build lepes megszunt, a start.js kozvetlenul a `fiori run`-t inditja.

### Cross-Platform Kompatibilitas

| Platform | Port Check | Process Info | Kill |
|----------|-----------|--------------|------|
| **macOS** | `lsof -ti:8300 -sTCP:LISTEN` | `ps -p <PID> -o command=` | `kill -9 <PID>` |
| **Linux** | `lsof -ti:8300 -sTCP:LISTEN` | `ps -p <PID> -o command=` | `kill -9 <PID>` |
| **Windows** | `netstat -ano \| findstr :8300` | `wmic process where "ProcessId=<PID>" get CommandLine` | `taskkill /PID <PID> /F` |

---

## Best Practices

### 1. Hasznald a purge + smart-start-ot fejleszteskor

```bash
# HELYES - purge + port check + szerver
npm run purge && npm run smart-start
npm run purge && npm run smart-start:cdn
npm run purge && npm run smart-start:hybrid

# HELYES - ha tudod, hogy a port szabad
npm run smart-start
npm run smart-start:hybrid

# KERULED - nincs port check
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
