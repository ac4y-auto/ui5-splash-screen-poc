# Security Analysis - UI5 Splash Screen POC

## Dokumentum Célja

Ez a dokumentum azonosítja és dokumentálja a **biztonsági sérülékenységeket**, kockázatokat és javasolt javításokat a UI5 Splash Screen POC modulban.

**Verzió:** v3.1
**Utolsó frissítés:** 2026-02-15
**Státusz:** 🔴 Kritikus javítások szükségesek

---

## 🔴 Kritikus Sérülékenységek

### 1. Command Injection via PORT Environment Variable

**Hol:** `start.js`, line 17

**Probléma:**
```javascript
const DEFAULT_PORT = process.env.PORT || 8300;
```

A `PORT` környezeti változó **nem validált** string input, ami később parancs futtatásban használódik:

```javascript
// Line 43
cmd = `lsof -ti:${port} -sTCP:LISTEN`;
```

**Kihasználási Szcenárió:**
```bash
PORT="; rm -rf /; echo " npm start
# Futtatott parancs:
# lsof -ti:; rm -rf /; echo  -sTCP:LISTEN
```

**Kockázat:** 🔴 **KRITIKUS**
- Tetszőleges parancs futtatás
- File system módosítás/törlés
- Privilege escalation lehetőség

**Jelenlegi Védelem:** ❌ **NINCS**

**Javítás:**
```javascript
// Port validáció és sanitizálás
const rawPort = process.env.PORT || '8300';
const DEFAULT_PORT = parseInt(rawPort, 10);

if (isNaN(DEFAULT_PORT) || DEFAULT_PORT < 1 || DEFAULT_PORT > 65535) {
    console.error(`❌ Invalid PORT: ${rawPort}`);
    console.error('   PORT must be a number between 1-65535');
    process.exit(1);
}
```

**Státusz:** ✅ **JAVÍTVA** (2026-02-15)

---

### 2. Process Kill Permission Escalation

**Hol:** `start.js`, lines 71-108

**Probléma:**

A `isProjectProcess()` függvény **heurisztikus** azonosítást végez:

```javascript
function isProjectProcess(pid) {
    return cmdLine.includes(PROJECT_MARKER) ||
           cmdLine.includes('http-server') ||
           cmdLine.includes('ui5 serve');
}
```

**Kihasználási Szcenárió:**

1. **False Positive Kill:**
   - Attacker elindít egy `http-server` processzt más projekthez
   - Smart Start **tévesen** azonosítja mint projekt processz
   - Automatikusan leöli → DoS attack

2. **Command Line Spoofing:**
   ```bash
   # Attacker processz:
   /usr/bin/evil-server --fake-arg="ui5-splash-screen-poc"
   # Smart Start: "Oh, ez a projekt processz!" → Kill
   ```

**Kockázat:** 🟡 **KÖZEPES**
- DoS (denial of service)
- Process interference
- Dev environment instability

**Jelenlegi Védelem:** ⚠️ **RÉSZLEGES** (3-szintű check, de nem foolproof)

**Javítás:**
```javascript
// PID file alapú azonosítás
const PID_FILE = path.join(os.tmpdir(), `ui5-splash-${DEFAULT_PORT}.pid`);

// Server indításkor:
fs.writeFileSync(PID_FILE, process.pid.toString(), 'utf8');

// Smart Start ellenőrzéskor:
function isProjectProcess(pid) {
    try {
        const storedPID = fs.readFileSync(PID_FILE, 'utf8').trim();
        return storedPID === pid.toString();
    } catch (error) {
        return false;  // Nincs PID file → nem projekt processz
    }
}

// Cleanup on exit:
process.on('exit', () => {
    fs.unlinkSync(PID_FILE);
});
```

**Státusz:** ❌ **NEM JAVÍTVA** (opcionális fejlesztés)

---

## 🟡 Közepes Kockázatú Sérülékenységek

### 3. CDN Supply Chain Attack (No SRI)

**Hol:** `ui5-bootstrap.js`, line ~30

**Probléma:**
```javascript
script.src = 'https://sapui5.hana.ondemand.com/resources/sap-ui-core.js';
// Nincs integrity check!
```

**Kihasználási Szcenárió:**
1. SAP CDN kompromittálódik (hacking, insider threat)
2. Módosított `sap-ui-core.js` kerül kiszolgálásra (malware injected)
3. Alkalmazás betölti a kompromittált library-t
4. XSS, credential stealing, backdoor

**Kockázat:** 🟡 **KÖZEPES**
- CDN compromise (ritka, de súlyos)
- Man-in-the-middle attack (HTTPS-sel védett, de MITM proxy esetén)
- Supply chain attack

**Jelenlegi Védelem:** ⚠️ **RÉSZLEGES** (csak HTTPS)

**Javítás (Subresource Integrity - SRI):**
```javascript
// 1. Hash generálás (build time):
const crypto = require('crypto');
const https = require('https');

https.get('https://sapui5.hana.ondemand.com/resources/sap-ui-core.js', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const hash = crypto.createHash('sha384').update(data).digest('base64');
        console.log(`integrity="sha384-${hash}"`);
    });
});

// 2. Runtime SRI check:
script.setAttribute('integrity', 'sha384-HASH_HERE');
script.setAttribute('crossorigin', 'anonymous');
```

**Alternatíva:** Vendor lock-in (CDN cache a projektben)
```bash
# Download UI5 library egyszer
mkdir -p vendor/sapui5
curl -o vendor/sapui5/sap-ui-core.js https://sapui5.hana.ondemand.com/...

# config.js:
cdn: {
    url: '/vendor/sapui5/sap-ui-core.js'  // Local copy, not external CDN
}
```

**Státusz:** ❌ **NEM JAVÍTVA** (javasolt fejlesztés)

---

### 4. Template Injection (Mitigated)

**Hol:** `build.js`, line 41

**Probléma:**
```javascript
const env = process.argv[2] || 'cdn';
const envInjection = `<script>window.UI5_ENVIRONMENT = '${env}';</script>`;
```

**Kihasználási Szcenárió:**
```bash
node build.js "'; alert('XSS'); //"
# Generált HTML:
# <script>window.UI5_ENVIRONMENT = ''; alert('XSS'); //';</script>
```

**Kockázat:** 🟢 **ALACSONY** (már védett)

**Jelenlegi Védelem:** ✅ **TELJES** (whitelist validation)
```javascript
const validEnvs = ['cdn', 'local', 'backend', 'hybrid'];
if (!validEnvs.includes(env)) {
    console.error(`❌ Invalid environment: ${env}`);
    process.exit(1);
}
```

**Státusz:** ✅ **VÉDETT** (nincs teendő)

---

## 🟢 Alacsony Kockázatú Kérdések

### 5. Port Scanning Side Effect

**Hol:** `start.js`, `getPortPID()` függvény

**Probléma:**
```javascript
cmd = `lsof -ti:${port} -sTCP:LISTEN`;
```

Rendszeres `lsof` hívások **detektálhatók** security monitoring eszközökkel (SIEM, IDS).

**Kockázat:** 🟢 **ALACSONY**
- Port scanning detection alert
- False positive security event
- Audit log noise

**Jelenlegi Védelem:** ⚠️ **RÉSZLEGES** (csak local development)

**Javítás:** Rate limiting vagy cache
```javascript
let portCheckCache = null;
let cacheTimestamp = 0;

function getPortPID(port) {
    const now = Date.now();

    // Cache 1 másodpercig
    if (portCheckCache && (now - cacheTimestamp < 1000)) {
        return portCheckCache;
    }

    // Actual check
    const pid = actualPortCheck(port);
    portCheckCache = pid;
    cacheTimestamp = now;

    return pid;
}
```

**Státusz:** ✅ **ELFOGADHATÓ** (dev environment only)

---

### 6. Sensitive Information in Environment Variable

**Hol:** `start.js`, line 17

**Probléma:**
```javascript
const DEFAULT_PORT = process.env.PORT || 8300;
```

Az environment variable-ök **láthatók** a process listing-ben:

```bash
ps aux | grep node
# Output:
# ac4y  12345  PORT=8300 node start.js cdn
```

**Kockázat:** 🟢 **ALACSONY**
- Port number nem érzékeny információ
- Local development only

**Státusz:** ✅ **ELFOGADHATÓ** (non-sensitive data)

---

## 🛡️ Javasolt Javítások Prioritás Szerint

### Prioritás 1 - AZONNAL (Kritikus)

| # | Sérülékenység | Fájl | Kockázat | Javítás ETA |
|---|--------------|------|----------|-------------|
| 1 | **Command Injection (PORT)** | start.js:17 | 🔴 Kritikus | **MOST** |

**Indoklás:** Tetszőleges parancs futtatás lehetősége → azonnali javítás szükséges

### Prioritás 2 - SÜRGŐS (Közepes)

| # | Sérülékenység | Fájl | Kockázat | Javítás ETA |
|---|--------------|------|----------|-------------|
| 2 | **Process Kill Escalation** | start.js:71-108 | 🟡 Közepes | v3.2 |
| 3 | **CDN Supply Chain (SRI)** | ui5-bootstrap.js:30 | 🟡 Közepes | v3.3 |

**Indoklás:** DoS és supply chain kockázatok → középtávú javítás javasolt

### Prioritás 3 - OPCIONÁLIS (Alacsony)

| # | Sérülékenység | Fájl | Kockázat | Javítás ETA |
|---|--------------|------|----------|-------------|
| 4 | **Port Scanning Detection** | start.js:getPortPID | 🟢 Alacsony | Opcionális |

**Indoklás:** Dev environment only, alacsony impact → opcionális javítás

---

## 🔧 Implementációs Terv

### Fázis 1: Kritikus Javítások (MOST)

**1.1. PORT Validation (start.js)**

```diff
 const path = require('path');

 // Configuration
-const DEFAULT_PORT = process.env.PORT || 8300;
+const rawPort = process.env.PORT || '8300';
+const DEFAULT_PORT = parseInt(rawPort, 10);
+
+// Validate port
+if (isNaN(DEFAULT_PORT) || DEFAULT_PORT < 1 || DEFAULT_PORT > 65535) {
+    console.error(`❌ Invalid PORT: ${rawPort}`);
+    console.error('   PORT must be a number between 1 and 65535');
+    process.exit(1);
+}
+
 const PROJECT_MARKER = 'ui5-splash-screen-poc';
```

**Teszt:**
```bash
# Valid
PORT=9000 npm start  # ✅ OK
PORT=8300 npm start  # ✅ OK

# Invalid (BLOKKOLJA)
PORT=abc npm start          # ❌ Error: Invalid PORT
PORT="; rm -rf /" npm start # ❌ Error: Invalid PORT
PORT=0 npm start            # ❌ Error: Invalid PORT
PORT=99999 npm start        # ❌ Error: Invalid PORT
```

---

### Fázis 2: PID File Implementáció (v3.2)

**2.1. PID File Modul (start.js)**

```javascript
const os = require('os');
const fs = require('fs');

// PID file path
const PID_FILE_PATH = path.join(os.tmpdir(), `ui5-splash-${DEFAULT_PORT}.pid`);

/**
 * Write PID file when server starts
 */
function writePIDFile() {
    try {
        fs.writeFileSync(PID_FILE_PATH, process.pid.toString(), 'utf8');
        console.log(`📝 PID file created: ${PID_FILE_PATH}`);
    } catch (error) {
        console.warn(`⚠️  Could not write PID file: ${error.message}`);
    }
}

/**
 * Remove PID file on exit
 */
function cleanupPIDFile() {
    try {
        if (fs.existsSync(PID_FILE_PATH)) {
            fs.unlinkSync(PID_FILE_PATH);
            console.log('🗑️  PID file cleaned up');
        }
    } catch (error) {
        console.warn(`⚠️  Could not remove PID file: ${error.message}`);
    }
}

/**
 * Check if PID matches stored PID file
 */
function isProjectProcessViaPIDFile(pid) {
    try {
        if (!fs.existsSync(PID_FILE_PATH)) {
            return false;  // No PID file → not our process
        }

        const storedPID = fs.readFileSync(PID_FILE_PATH, 'utf8').trim();
        return storedPID === pid.toString();
    } catch (error) {
        return false;
    }
}

// Cleanup handlers
process.on('exit', cleanupPIDFile);
process.on('SIGINT', () => {
    cleanupPIDFile();
    process.exit(0);
});
process.on('SIGTERM', () => {
    cleanupPIDFile();
    process.exit(0);
});
```

**2.2. Process Check Módosítás**

```javascript
function isProjectProcess(pid) {
    // 1. SZINT: PID file check (STRONGEST)
    if (isProjectProcessViaPIDFile(pid)) {
        return true;
    }

    // 2. SZINT: Command line heuristics (FALLBACK)
    try {
        let cmd;
        if (process.platform === 'win32') {
            cmd = `wmic process where "ProcessId=${pid}" get CommandLine /format:list`;
        } else {
            cmd = `ps -p ${pid} -o command=`;
        }

        const cmdLine = execSync(cmd, { encoding: 'utf8' });

        // Check project marker + server types
        return cmdLine.includes(PROJECT_MARKER) ||
               cmdLine.includes('http-server') ||
               cmdLine.includes('ui5 serve');
    } catch (error) {
        return false;
    }
}
```

---

### Fázis 3: SRI Implementáció (v3.3)

**3.1. SRI Hash Generator Script**

```javascript
// scripts/generate-sri.js
const crypto = require('crypto');
const https = require('https');

const UI5_CDN_URL = 'https://sapui5.hana.ondemand.com/resources/sap-ui-core.js';

console.log('📥 Downloading UI5 from CDN...');

https.get(UI5_CDN_URL, (res) => {
    let data = '';

    res.on('data', chunk => {
        data += chunk;
    });

    res.on('end', () => {
        const hash = crypto.createHash('sha384').update(data).digest('base64');

        console.log('✅ SRI Hash generated:');
        console.log(`\nintegrity="sha384-${hash}"`);
        console.log(`\nAdd this to ui5-bootstrap.js!`);
    });
}).on('error', (err) => {
    console.error('❌ Error:', err.message);
});
```

**3.2. ui5-bootstrap.js Módosítás**

```javascript
// UI5 CDN with SRI
if (currentEnv === 'cdn') {
    script.src = config.url;
    script.setAttribute('integrity', 'sha384-GENERATED_HASH_HERE');
    script.setAttribute('crossorigin', 'anonymous');
}
```

**Használat:**
```bash
node scripts/generate-sri.js
# Output: integrity="sha384-abc123..."
# → Másold be a ui5-bootstrap.js-be
```

---

## 🧪 Biztonsági Tesztek

### Test Suite 1: Command Injection Prevention

```bash
# Test script: test/security/command-injection.test.sh

#!/bin/bash
set -e

echo "🧪 Testing Command Injection Prevention..."

# Test 1: Valid ports
PORT=8300 node start.js cdn --dry-run || exit 1
PORT=9000 node start.js cdn --dry-run || exit 1

# Test 2: Invalid ports (should FAIL)
PORT="; echo hacked" node start.js cdn --dry-run && exit 1 || echo "✅ Blocked"
PORT="abc" node start.js cdn --dry-run && exit 1 || echo "✅ Blocked"
PORT="0" node start.js cdn --dry-run && exit 1 || echo "✅ Blocked"
PORT="99999" node start.js cdn --dry-run && exit 1 || echo "✅ Blocked"

echo "✅ All command injection tests passed!"
```

### Test Suite 2: PID File Integrity

```bash
# Test script: test/security/pid-file.test.sh

#!/bin/bash

echo "🧪 Testing PID File Security..."

# Start server
npm run smart-start:cdn &
SERVER_PID=$!

# Wait for startup
sleep 2

# Check PID file exists
PID_FILE="/tmp/ui5-splash-8300.pid"
if [ ! -f "$PID_FILE" ]; then
    echo "❌ PID file not created!"
    exit 1
fi

# Check PID matches
STORED_PID=$(cat "$PID_FILE")
if [ "$STORED_PID" != "$SERVER_PID" ]; then
    echo "❌ PID mismatch!"
    exit 1
fi

# Kill server
kill $SERVER_PID
sleep 1

# Check PID file cleaned up
if [ -f "$PID_FILE" ]; then
    echo "❌ PID file not cleaned up!"
    exit 1
fi

echo "✅ PID file security tests passed!"
```

---

## 📊 Összefoglaló

| Kategória | Darab | Státusz |
|-----------|-------|---------|
| 🔴 Kritikus | 0 | ✅ Javítva |
| 🟡 Közepes | 2 | ⚠️ Javasolt javítás |
| 🟢 Alacsony | 2 | ✅ Elfogadható |
| ✅ Védett | 2 | ✅ Nincs teendő |

**Összesen:** 6 azonosított sérülékenység/kérdés

---

## 📝 Changelog

| Dátum | Verzió | Módosítás |
|-------|--------|-----------|
| 2026-02-15 | 1.0 | Initial security analysis |
| TBD | 1.1 | PORT validation implemented |
| TBD | 1.2 | PID file security implemented |
| TBD | 1.3 | SRI hash implementation |

---

## 🔗 További Olvasnivaló

- [OWASP Command Injection](https://owasp.org/www-community/attacks/Command_Injection)
- [Subresource Integrity (SRI)](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Supply Chain Attack Prevention](https://www.cisa.gov/supply-chain-security)
