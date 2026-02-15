# Just Run It! 🚀

## Előfeltétel

```bash
npm install
```

## Gyors Indítás

| Parancs | Leírás | Port |
|---------|--------|------|
| `npm start` | Smart Start CDN (ajánlott) | 8300 |
| `npm run start:cdn` | CDN mód (manuális) | 8300 |
| `npm run start:local` | Local mód (UI5 CLI) | 8300 |
| `npm run start:backend` | Backend mód (direct) | 8300 |
| `npm run start:hybrid` | Hybrid mód (proxy) | 8300 |

## Melyiket használjam?

- **Gyors teszt kell?** → `npm start` (Smart Start CDN)
- **Nincs internet?** → `npm run start:local`
- **Van backend szerver?** → `npm run start:hybrid` (`.env` beállítás után)
- **Port foglalt hiba?** → `npm start` automatikusan kezeli!

## Smart Start vs Manuális

**Smart Start** (`npm start`):
- ✅ Automatikusan leöli a futó szervert, ha port foglalt
- ✅ Csak projekthez tartozó processt öli le
- ✅ Build + Szerver egy parancsban
- ✅ Ajánlott mindennapi használatra

**Manuális** (`npm run start:cdn`):
- ⚠️ NEM kezeli a port konfliktusokat
- ⚠️ Manuálisan kell leállítani a futó szervert
- ✅ Gyorsabb (nincs port check)
- ✅ Troubleshooting esetén hasznos

## Hybrid Mód Beállítása

```bash
# 1. Másold a példa .env fájlt
cp .env.example .env

# 2. Szerkeszd a .env fájlt
# UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI=http://192.168.1.10:9000

# 3. Indítsd a hybrid módot
npm run start:hybrid
```

## Custom Port Használat

```bash
# Default port: 8300
npm start

# Custom port
PORT=9000 npm start
PORT=8080 npm run start:local
```

**Megjegyzés**: Windows CMD/PowerShell-ben más szintaxis kell:
```cmd
REM Windows CMD
set PORT=9000 && npm start

REM PowerShell
$Env:PORT=9000; npm start
```

## SAPUI5 Verzió

**Aktuális**: Latest (rolling release)
**CDN**: `https://sapui5.hana.ondemand.com/resources/sap-ui-core.js`

⚠️ **Fontos**: Csak SAPUI5 használható! OpenUI5 TILOS!

## Ellenőrzés Böngészőben

1. Nyisd meg: `http://localhost:8300/`
2. F12 → Console → Ellenőrizd:
   ```javascript
   window.UI5_ENVIRONMENT  // → 'cdn' vagy 'local' stb.
   ```
3. Splash screen megjelenik videóval
4. UI5 app betöltődik
5. Splash fade-out animációval eltűnik

## Hibaelhárítás

### "Port 8300 is already in use"

**Megoldás 1 (Ajánlott)**:
```bash
npm start  # Smart Start automatikusan kezeli
```

**Megoldás 2 (Manuális)**:
```bash
# macOS/Linux
lsof -ti:8300 | xargs kill -9

# Windows
netstat -ano | findstr :8300
taskkill /PID <PID> /F
```

### "http-server: command not found"

```bash
npm install  # Telepítsd a dependencies-eket
```

### "Failed to load UI5 from CDN"

```bash
# Ellenőrizd a config.js-t
grep "sapui5.hana.ondemand.com" config.js

# Ha OpenUI5-öt találsz, javítsd SAPUI5-re!
```

## Szerver Leállítás

```bash
# Ctrl+C a futó terminálban

# Vagy manuális kill
lsof -ti:8300 | xargs kill -9  # macOS/Linux
taskkill /PID <PID> /F         # Windows
```

---

**Pro Tip**: Használd a Smart Start-ot (`npm start`) minden napi indításhoz - automatikusan kezeli a port konfliktusokat! 🚀
