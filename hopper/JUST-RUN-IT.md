# Just Run It!

## Elofeltetel

```bash
npm install
```

## Gyors Inditas

### Smart Start (ajanlott)

| Parancs | Leiras | Mod | Port |
|---------|--------|-----|------|
| `npm run smart-start` | Smart Start Local (alapertelmezett) | Local | 8300 |
| `npm run smart-start:local` | Smart Start Local | Local | 8300 |
| `npm run smart-start:cdn` | Smart Start CDN | CDN proxy | 8300 |
| `npm run smart-start:backend` | Smart Start Backend | CDN + Backend proxy | 8300 |

### Manualis (halado)

| Parancs | Leiras | Mod | Port |
|---------|--------|-----|------|
| `npm start` | Local mod (alapertelmezett) | Local | 8300 |
| `npm run start:local` | Local mod | Local | 8300 |
| `npm run start:cdn` | CDN proxy mod | CDN proxy | 8300 |
| `npm run start:backend` | CDN + Backend proxy mod | CDN + Backend proxy | 8300 |

## Melyiket hasznaljam?

- **Gyors teszt kell?** --> `npm start` (Local mod, nincs internet szukseges)
- **SAP CDN-rol akarok tolteni?** --> `npm run smart-start:cdn`
- **Van backend szerver (192.168.1.10:9000)?** --> `npm run smart-start:backend`
- **Port foglalt hiba?** --> Barmelyik `smart-start:*` automatikusan kezeli!

## 3 Uzemeltetesi Mod

### Local (alapertelmezett)

- **Konfiguracio**: `ui5.yaml` (nincs `--config` flag)
- **SAPUI5 forras**: a `@ui5/cli` framework szolgalja ki (SAPUI5 1.105.0)
- **Internet szukseges**: Nem
- **Mikor hasznald**: Alapertelmezett fejlesztes, offline munka

### CDN

- **Konfiguracio**: `ui5-cdn.yaml`
- **SAPUI5 forras**: `fiori-tools-proxy` --> `https://sapui5.hana.ondemand.com`
- **Internet szukseges**: Igen
- **Mikor hasznald**: Ha a legfrissebb CDN verziot akarod hasznalni

### Backend

- **Konfiguracio**: `ui5-backend.yaml`
- **SAPUI5 forras**: CDN proxy (mint CDN mod) + backend proxy (`/sap` --> `http://192.168.1.10:9000`)
- **Internet szukseges**: Igen + elerheto backend szerver
- **Mikor hasznald**: Ha backend szerverre is szukseged van (OData, stb.)

## Smart Start vs Manualis

**Smart Start** (`npm run smart-start` / `npm run smart-start:*`):
- Ellenorzi, hogy a port (8300) foglalt-e
- Csak projekthez tartozo processt oli le (biztonsagos)
- `fiori run` inditas egy parancsban
- Ajanlott mindennapi hasznalatra
- Elerheto: `smart-start`, `smart-start:cdn`, `smart-start:local`, `smart-start:backend`

**Manualis** (`npm start` / `npm run start:*`):
- NEM kezeli a port konfliktusokat
- Manualisan kell leallitani a futo szervert
- Gyorsabb (nincs port check)
- Troubleshooting eseten hasznos

## Custom Port Hasznalat

```bash
# Default port: 8300
npm start

# Custom port
PORT=9000 npm start
PORT=8080 npm run start:cdn
```

**Megjegyzes**: Windows CMD/PowerShell-ben mas szintaxis kell:
```cmd
REM Windows CMD
set PORT=9000 && npm start

REM PowerShell
$Env:PORT=9000; npm start
```

## SAPUI5 Verzio

**Aktualis**: 1.105.0 (a YAML fajlokban konfiguralhato)
**CDN**: `https://sapui5.hana.ondemand.com/resources/sap-ui-core.js`

**FONTOS**: Csak SAPUI5 hasznalhato! OpenUI5 TILOS!

## Ellenorzes Bongeszben

1. Nyisd meg: `http://localhost:8300/index.html`
2. F12 --> Console --> Ellenorizd:
   ```
   [UI5] SAPUI5 script loaded successfully
   ```
3. **Sikeres betoltes**: Splash screen megjelenik videoval --> UI5 app betoltodik --> Splash fade-out
4. **Sikertelen betoltes**: Splash --> Error overlay ("UI5 Betoltesi Hiba") --> Technikai reszletek + megoldasi javaslatok

## Hibaelharitas

### "Port 8300 is already in use"

**Megoldas 1 (Ajanlott)**:
```bash
npm run smart-start  # Smart Start automatikusan kezeli
```

**Megoldas 2 (Manualis)**:
```bash
# macOS/Linux
lsof -ti:8300 | xargs kill -9

# Windows
netstat -ano | findstr :8300
taskkill /PID <PID> /F
```

### "fiori: command not found"

```bash
npm install  # Telepitsd a devDependencies-eket (@sap/ux-ui5-tooling)
```

### UI5 nem toltodik be (Error Overlay)

Az error overlay 2 esetben jelenik meg:
1. **Timeout** (15 mp): a SAPUI5 nem toltodott be idoben
2. **Script error**: a `sap-ui-core.js` halozati hiba vagy nem elerheto

Megoldas:
- Ellenorizd, hogy a `fiori run` szerver fut-e
- Local mod (`npm start`): futtasd ujra `npm install`
- CDN mod: ellenorizd az internet kapcsolatot es a `sapui5.hana.ondemand.com` eleresehetoseget
- Backend mod: ellenorizd, hogy a backend szerver elerheto-e a `http://192.168.1.10:9000` cimen

### YAML konfiguracios hiba

```bash
# Ellenorizd a YAML szintaxist
cat ui5.yaml
cat ui5-cdn.yaml
cat ui5-backend.yaml
```

A YAML fajlok `specVersion: "3.0"` formatumban vannak. A `fiori-tools-proxy` middleware konfiguracio a `server.customMiddleware` szekcioban talalhato.

## Szerver Leallitas

```bash
# Ctrl+C a futo terminalban

# Vagy manualis kill
lsof -ti:8300 | xargs kill -9  # macOS/Linux
taskkill /PID <PID> /F         # Windows
```

---

**Pro Tip**: Hasznald a Smart Start-ot (`npm run smart-start`) minden napi inditashoz - automatikusan kezeli a port konfliktusokat!
