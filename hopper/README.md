# Hopper - Mukodesi Dokumentaciok

Ez a mappa tartalmazza a **UI5 Splash Screen POC** projekt mukodesi, fejlesztesi es tervezesi dokumentumait.

**Projekt verzio**: v4.0 (fiori run architektura)

---

## Dokumentumok Kategoriak

### **Gyors Kezdes & Operacios Utmutatok**

| Fajl | Leiras | Verzio | Celcsoport |
|------|--------|--------|------------|
| [JUST-RUN-IT.md](JUST-RUN-IT.md) | Gyors inditas (5 perc alatt futo projekt!) | v3.2+ | Minden user |
| [RUNBOOK.md](RUNBOOK.md) | Operacios utmutato (szabalyok, szerverek, debug) | pre-v4.0 | Ops, DevOps |
| [CHEAT_SHEET.md](CHEAT_SHEET.md) | Gyors referencia (parancsok, URL-ek, tippek) | pre-v4.0 | Minden fejleszto |
| [SMART_START_GUIDE.md](SMART_START_GUIDE.md) | Smart Start hasznalat (port management + fiori run) | **v4.0** | Fejlesztok |

### **Architektura & Koncepcio**

| Fajl | Leiras | Verzio | Celcsoport |
|------|--------|--------|------------|
| [APP_CONTROLLED_SPLASH.md](APP_CONTROLLED_SPLASH.md) | App-iranyitott splash (show/hide API, best practices) | v3.2 | Minden fejleszto |
| [WIRING.md](WIRING.md) | Mukodesi folyamat (komponens kapcsolatok, flow-k) | v3.2 | Minden fejleszto |
| [KONZEPCIÓ.md](KONZEPCIÓ.md) | Reszletes architektura es design dontesek | pre-v4.0 | Architekt, Lead Dev |
| [ARCHITECTURE_v2.txt](ARCHITECTURE_v2.txt) | v2.0 visual ASCII architektura diagram | v2.0 (legacy) | Minden fejleszto |
| [REFACTORING_NOTES.md](REFACTORING_NOTES.md) | v2.0 refactoring jegyzet (monolith -> modular) | v2.0 (legacy) | Code Reviewer |

### **Fejlesztoi Utmutatok**

| Fajl | Leiras | Verzio | Celcsoport |
|------|--------|--------|------------|
| [FEJLESZTOI_UTASITAS.md](FEJLESZTOI_UTASITAS.md) | Fejlesztoi utmutato (setup, workflow, best practices) | pre-v4.0 | Uj fejlesztok |
| [ERROR_HANDLING.md](ERROR_HANDLING.md) | Error handling (UI5 load failure, error overlay, ui5-error-handler.js) | **v4.0** | Fejlesztok |
| [LOCAL_MODE_SETUP.md](LOCAL_MODE_SETUP.md) | Local mod beallitas (node_modules, UI5 CLI) | pre-v4.0 (tortenelmi) | Fejlesztok |
| [HYBRID_MODE_GUIDE.md](HYBRID_MODE_GUIDE.md) | Hybrid mod utmutato (lokalis UI5 + backend proxy) | **v4.0** | Backend integrator |

### **Integracio & Planning**

| Fajl | Leiras | Celcsoport |
|------|--------|------------|
| [INTEGRATION_PLAN.md](INTEGRATION_PLAN.md) | WMS integracios terv (3 megkozelites) | Integrator, PM |
| [LINGO.md](LINGO.md) | Terminologia es roviditesek | Minden csapattag |

### **Security & Error Handling**

| Fajl | Leiras | Verzio | Celcsoport |
|------|--------|--------|------------|
| [SECURITY.md](SECURITY.md) | Biztonsagi elemzes es javitasok | v3.2 | Security, DevOps |
| [ERROR_HANDLING.md](ERROR_HANDLING.md) | Error overlay guide (ui5-error-handler.js) | **v4.0** | Fejlesztok |

### **Migration & Updates**

| Fajl | Leiras | Celcsoport |
|------|--------|------------|
| [OPENUI5_TO_SAPUI5_MIGRATION.md](OPENUI5_TO_SAPUI5_MIGRATION.md) | OpenUI5 -> SAPUI5 guide | Fejlesztok |

### **Session Notes & Version History**

| Fajl | Leiras | Verzio |
|------|--------|--------|
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Projekt statusz es attekintes | **v4.0** |
| [RELEASE_NOTES_v3.2.md](RELEASE_NOTES_v3.2.md) | v3.2 release notes | v3.2 |
| [CHANGELOG_v3.2.md](CHANGELOG_v3.2.md) | v3.2 valtozasnaplo | v3.2 |
| [CHANGELOG_v3.0.md](CHANGELOG_v3.0.md) | v3.0 valtozasnaplo | v3.0 |
| [DEBRIEF_v3.1.md](DEBRIEF_v3.1.md) | v3.1 session debrief | v3.1 |
| [SESSION_SUMMARY_v3.1.md](SESSION_SUMMARY_v3.1.md) | v3.1 session osszefoglalo | v3.1 |
| [SESSION_HANDOFF_v3.2.md](SESSION_HANDOFF_v3.2.md) | v3.2 session handoff | v3.2 |
| [SESSION_HANDOFF_v3.1.md](SESSION_HANDOFF_v3.1.md) | v3.1 session handoff | v3.1 |
| [SESSION_HANDOFF_v2.0.md](SESSION_HANDOFF_v2.0.md) | v2.0 session handoff | v2.0 |
| [SESSION_HANDOFF.md](SESSION_HANDOFF.md) | v1.0 session handoff | v1.0 |

---

## v4.0 Migracios Megjegyzes

A v4.0 a projekt legnagyobb architekturalis valtozasa. A kovetkezo dokumentumok **tortenelmi jelleggel** ertendok (pre-v4.0 tartalmat tartalmaznak es meg nem lettek frissitve):

- **RUNBOOK.md** - meg a regi http-server + build.js architekturara hivatkozik
- **CHEAT_SHEET.md** - a parancsok egy resze mar nem ervenyes (build.js, http-server)
- **FEJLESZTOI_UTASITAS.md** - a setup lepes a regi architekturara vonatkozik
- **LOCAL_MODE_SETUP.md** - a local mod beallitasa megvaltozott (most ui5.yaml + fiori run)
- **HYBRID_MODE_GUIDE.md** - frissitve v4.0-ra (lokalis UI5 framework + backend proxy)
- **KONZEPCIÓ.md** - a koncepcio resze mar nem aktualis (environment valtozok, build.js)
- **WIRING.md** - a modul kapcsolatok egy resze megvaltozott (ui5-bootstrap.js -> ui5-error-handler.js)

**Frissitve v4.0-ra:**
- **ERROR_HANDLING.md** - ui5-error-handler.js, script error + 15s timeout
- **SMART_START_GUIDE.md** - fiori run, --config parameter, yaml fajlok
- **PROJECT_STATUS.md** - technologiai stack, projekt struktura, NPM scriptek
- **HYBRID_MODE_GUIDE.md** - lokalis UI5 framework + backend proxy (ui5-hybrid.yaml)
- **README.md** - ez a fajl (dokumentum index)

---

## Ajanlott Olvasasi Sorrend

### Uj Fejleszto Onboarding (v4.0)

1. **Start**: [JUST-RUN-IT.md](JUST-RUN-IT.md) - Gyors inditas (`npm start`)
2. **Smart Start**: [SMART_START_GUIDE.md](SMART_START_GUIDE.md) - Port management + fiori run
3. **Architecture**: [APP_CONTROLLED_SPLASH.md](APP_CONTROLLED_SPLASH.md) - Splash API
4. **Error Handling**: [ERROR_HANDLING.md](ERROR_HANDLING.md) - Error overlay (ui5-error-handler.js)
5. **Status**: [PROJECT_STATUS.md](PROJECT_STATUS.md) - Teljes projekt attekintes

### Ops/DevOps

1. **Start**: [SMART_START_GUIDE.md](SMART_START_GUIDE.md) - fiori run + port management
2. **Security**: [SECURITY.md](SECURITY.md) - Biztonsagi audit
3. **Status**: [PROJECT_STATUS.md](PROJECT_STATUS.md) - Technologiai stack

### Integrator

1. **Planning**: [INTEGRATION_PLAN.md](INTEGRATION_PLAN.md) - WMS integracio
2. **Terminology**: [LINGO.md](LINGO.md) - Roviditesek
3. **Splash API**: [APP_CONTROLLED_SPLASH.md](APP_CONTROLLED_SPLASH.md) - show/hide API

---

## Dokumentum Strukturas

```
hopper/
|-- README.md                    # Ez a fajl (index) - v4.0
|
|-- Gyors Kezdes
|   |-- JUST-RUN-IT.md           # Quick start
|   |-- SMART_START_GUIDE.md     # Smart Start (v4.0)
|   |-- CHEAT_SHEET.md           # Parancs referencia (pre-v4.0)
|   +-- RUNBOOK.md               # Ops utmutato (pre-v4.0)
|
|-- Architektura
|   |-- APP_CONTROLLED_SPLASH.md # Splash API (v3.2)
|   |-- WIRING.md                # Module mukodes (v3.2)
|   |-- KONZEPCIÓ.md             # Koncepcio (pre-v4.0)
|   |-- ARCHITECTURE_v2.txt      # ASCII diagram (v2.0)
|   +-- REFACTORING_NOTES.md     # Refactoring (v2.0)
|
|-- Fejlesztoi Utmutatok
|   |-- ERROR_HANDLING.md        # Error handling (v4.0)
|   |-- FEJLESZTOI_UTASITAS.md   # Dev guide (pre-v4.0)
|   |-- LOCAL_MODE_SETUP.md      # Local setup (pre-v4.0)
|   +-- HYBRID_MODE_GUIDE.md     # Hybrid setup (v4.0)
|
|-- Security
|   +-- SECURITY.md              # Security audit
|
|-- Integracio
|   |-- INTEGRATION_PLAN.md      # WMS integracio
|   +-- LINGO.md                 # Terminologia
|
|-- Migration
|   +-- OPENUI5_TO_SAPUI5_MIGRATION.md
|
+-- History
    |-- PROJECT_STATUS.md        # Projekt statusz (v4.0)
    |-- RELEASE_NOTES_v3.2.md
    |-- CHANGELOG_v3.2.md
    |-- CHANGELOG_v3.0.md
    |-- DEBRIEF_v3.1.md
    |-- SESSION_SUMMARY_v3.1.md
    |-- SESSION_HANDOFF_v3.2.md
    |-- SESSION_HANDOFF_v3.1.md
    |-- SESSION_HANDOFF_v2.0.md
    +-- SESSION_HANDOFF.md
```

---

## Dokumentum Konvenciok

### Fajlnevek
- **UPPERCASE.md** - Mukodesi/operacios dokumentumok
- **PascalCase.md** - Projekt fajlok (Component.js)
- **lowercase.md** - Build scriptek dokumentacioi

### Verzio Jelolesek
- `v4.0` jelolt dokumentumok: Aktualis, frissitett tartalom
- `pre-v4.0` jelolt dokumentumok: Tortenelmi tartalom, a regi architekturara vonatkozik
- `v2.0 (legacy)` jelolt dokumentumok: Regi verzio, referenciakent

### Nyelvek
- **Magyar**: Operacios dokumentumok (RUNBOOK, KONCEPCIO, stb.)
- **Angol**: Kod kommentek, commit messages

---

## Keresesi Tippek

### VS Code Search

```
# Kereses a hopper mappaban
Ctrl+Shift+F -> Files to include: hopper/**/*.md

# Kereses temakor szerint
"fiori run"       -> SMART_START_GUIDE.md, PROJECT_STATUS.md
"error-handler"   -> ERROR_HANDLING.md
"Smart Start"     -> SMART_START_GUIDE.md
"ui5.yaml"        -> SMART_START_GUIDE.md, PROJECT_STATUS.md
"hybrid"          -> HYBRID_MODE_GUIDE.md, SMART_START_GUIDE.md
"purge"           -> SMART_START_GUIDE.md
```

---

## Frissitesi Iranyelvek

### Mikor frissitsd a dokumentumokat?

| Valtozas | Frissitendo Dokumentumok |
|----------|--------------------------|
| Uj feature | PROJECT_STATUS.md, README.md |
| Verzio bump | PROJECT_STATUS.md |
| Kritikus szabaly | RUNBOOK.md |
| Architektura valtozas | APP_CONTROLLED_SPLASH.md, WIRING.md |
| NPM script valtozas | SMART_START_GUIDE.md, PROJECT_STATUS.md |
| Port/process valtozas | SMART_START_GUIDE.md (start.js, purge.js) |
| Uj terminologia | LINGO.md |
| Error handling valtozas | ERROR_HANDLING.md |

---

## Hozzajarulas

Ha uj dokumentumot adsz hozza a `hopper/` mappahoz:

1. **Nevezd el** konvencio szerint (UPPERCASE.md)
2. **Add hozza** ehhez a README-hez a tablazatokhoz
3. **Frissitsd** a Dokumentum Struktura reszt
4. **Jelold** a verziot (v4.0, pre-v4.0, stb.)
5. **Commit message**: `docs: Add <FILENAME> to hopper/`

---

## Kapcsolat

**Projekt**: UI5 Splash Screen POC
**GitHub**: https://github.com/ac4y-auto/ui5-splash-screen-poc
**Verzio**: 4.0

---

**Hopper - Minden mukodesi tudas egy helyen!**
