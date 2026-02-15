# 📚 Hopper - Működési Dokumentációk

Ez a mappa tartalmazza a **UI5 Splash Screen POC** projekt működési, fejlesztési és tervezési dokumentumait.

---

## 📋 Dokumentumok Kategóriák

### 🚀 **Gyors Kezdés & Operációs Útmutatók**

| Fájl | Leírás | Célcsoport |
|------|--------|------------|
| [JUST-RUN-IT.md](JUST-RUN-IT.md) | 🆕 Gyors indítás (5 perc alatt futó projekt!) | Minden user |
| [RUNBOOK.md](RUNBOOK.md) | Operációs útmutató (szabályok, szerverek, debug) | Ops, DevOps |
| [CHEAT_SHEET.md](CHEAT_SHEET.md) | Gyors referencia (parancsok, URL-ek, tippek) | Minden fejlesztő |
| [SMART_START_GUIDE.md](SMART_START_GUIDE.md) | Smart Start használat (port management) | Fejlesztők |

### 🏗️ **Architektúra & Koncepció**

| Fájl | Leírás | Célcsoport |
|------|--------|------------|
| [KONZEPCIÓ.md](KONZEPCIÓ.md) | Részletes architektúra és design döntések | Architekt, Lead Dev |
| [WIRING.md](WIRING.md) | 🆕 Működési folyamat (komponens kapcsolatok, flow-k) | Minden fejlesztő |
| [SECURITY.md](SECURITY.md) | 🆕 Biztonsági elemzés és javítások | Security, DevOps |
| [ARCHITECTURE_v2.txt](ARCHITECTURE_v2.txt) | v2.0 visual ASCII architektúra diagram | Minden fejlesztő |
| [REFACTORING_NOTES.md](REFACTORING_NOTES.md) | v2.0 refactoring jegyzet (monolith → modular) | Code Reviewer |

### 🔧 **Fejlesztői Útmutatók**

| Fájl | Leírás | Célcsoport |
|------|--------|------------|
| [FEJLESZTOI_UTASITAS.md](FEJLESZTOI_UTASITAS.md) | Fejlesztői útmutató (setup, workflow, best practices) | Új fejlesztők |
| [APP_CONTROLLED_SPLASH.md](APP_CONTROLLED_SPLASH.md) | 🆕 App-irányított splash (show/hide API, best practices) | Minden fejlesztő |
| [ERROR_HANDLING.md](ERROR_HANDLING.md) | 🆕 Error handling (UI5 load failure, error overlay) | Fejlesztők |
| [LOCAL_MODE_SETUP.md](LOCAL_MODE_SETUP.md) | Local mód beállítás (node_modules, UI5 CLI) | Fejlesztők |
| [HYBRID_MODE_GUIDE.md](HYBRID_MODE_GUIDE.md) | Hybrid mód útmutató (proxy, backend) | Backend integrátor |

### 📦 **Integráció & Planning**

| Fájl | Leírás | Célcsoport |
|------|--------|------------|
| [INTEGRATION_PLAN.md](INTEGRATION_PLAN.md) | WMS integrációs terv (3 megközelítés) | Integrátor, PM |
| [LINGO.md](LINGO.md) | Terminológia és rövidítések | Minden csapattag |

### 📝 **Session Notes & Debrief**

| Fájl | Leírás | Verzió |
|------|--------|--------|
| [DEBRIEF_v3.1.md](DEBRIEF_v3.1.md) | 🆕 v3.1 session debrief (tanulságok, döntések) | 3.1 |
| [SESSION_SUMMARY_v3.1.md](SESSION_SUMMARY_v3.1.md) | v3.1 session összefoglaló (Smart Start) | 3.1 |
| [CHANGELOG_v3.0.md](CHANGELOG_v3.0.md) | v3.0 változásnapló (build-based) | 3.0 |
| [SESSION_HANDOFF_v2.0.md](SESSION_HANDOFF_v2.0.md) | v2.0 session handoff (modular refactor) | 2.0 |
| [SESSION_HANDOFF.md](SESSION_HANDOFF.md) | v1.0 session handoff (initial) | 1.0 |

---

## 🗂️ Dokumentum Struktúra

```
hopper/
├── README.md                    # Ez a fájl (index)
│
├── Gyors Kezdés
│   ├── RUNBOOK.md              # Ops útmutató
│   ├── CHEAT_SHEET.md          # Gyors referencia
│   └── SMART_START_GUIDE.md    # Smart Start
│
├── Architektúra
│   ├── KONZEPCIÓ.md            # Részletes koncepció
│   ├── ARCHITECTURE_v2.txt     # ASCII diagram
│   └── REFACTORING_NOTES.md    # Refactoring jegyzet
│
├── Fejlesztői Útmutatók
│   ├── FEJLESZTOI_UTASITAS.md  # Dev guide
│   ├── LOCAL_MODE_SETUP.md     # Local setup
│   └── HYBRID_MODE_GUIDE.md    # Hybrid setup
│
├── Integráció
│   ├── INTEGRATION_PLAN.md     # WMS integráció
│   └── LINGO.md                # Terminológia
│
└── History
    ├── SESSION_SUMMARY_v3.1.md # v3.1 summary
    ├── CHANGELOG_v3.0.md       # v3.0 changelog
    ├── SESSION_HANDOFF_v2.0.md # v2.0 handoff
    └── SESSION_HANDOFF.md      # v1.0 handoff
```

---

## 🎯 Ajánlott Olvasási Sorrend

### Új Fejlesztő Onboarding

1. **Start**: [CHEAT_SHEET.md](CHEAT_SHEET.md) - Gyors áttekintés
2. **Setup**: [FEJLESZTOI_UTASITAS.md](FEJLESZTOI_UTASITAS.md) - Környezet beállítás
3. **Deep Dive**: [KONZEPCIÓ.md](KONZEPCIÓ.md) - Architektúra megértés
4. **Operations**: [RUNBOOK.md](RUNBOOK.md) - Napi használat

### Ops/DevOps

1. **Start**: [RUNBOOK.md](RUNBOOK.md) - Kritikus szabályok
2. **Tools**: [SMART_START_GUIDE.md](SMART_START_GUIDE.md) - Port management
3. **Reference**: [CHEAT_SHEET.md](CHEAT_SHEET.md) - Parancsok

### Integrátor

1. **Planning**: [INTEGRATION_PLAN.md](INTEGRATION_PLAN.md) - 3 megközelítés
2. **Hybrid**: [HYBRID_MODE_GUIDE.md](HYBRID_MODE_GUIDE.md) - Backend proxy
3. **Terminology**: [LINGO.md](LINGO.md) - Rövidítések

---

## 📖 Dokumentum Konvenciók

### Fájlnevek
- **UPPERCASE.md** - Működési/operációs dokumentumok
- **PascalCase.md** - Projekt fájlok (Component.js)
- **lowercase.md** - Build scriptek dokumentációi

### Verzió Jelölések
- `SESSION_HANDOFF.md` - v1.0
- `SESSION_HANDOFF_v2.0.md` - v2.0
- `SESSION_SUMMARY_v3.1.md` - v3.1

### Nyelvek
- **Magyar**: Operációs dokumentumok (RUNBOOK, KONZEPCIÓ, stb.)
- **Angol**: Kód kommentek, commit messages

---

## 🔍 Keresési Tippek

### VS Code Search

```
# Keresés a hopper mappában
Ctrl+Shift+F → Files to include: hopper/**/*.md

# Keresés témakör szerint
"Smart Start"     → SMART_START_GUIDE.md, SESSION_SUMMARY_v3.1.md
"Hybrid"          → HYBRID_MODE_GUIDE.md
"WMS"             → INTEGRATION_PLAN.md
"v2.0 refactor"   → REFACTORING_NOTES.md
```

### Grep

```bash
# Keresés minden .md fájlban
grep -r "Smart Start" hopper/

# Fájlnevek listázása, amik tartalmaznak egy kulcsszót
grep -l "PORT" hopper/*.md
```

---

## 📝 Frissítési Irányelvek

### Mikor frissítsd a dokumentumokat?

| Változás | Frissítendő Dokumentumok |
|----------|--------------------------|
| Új feature | SESSION_SUMMARY, README (main) |
| Verzió bump | CHANGELOG, SESSION_SUMMARY |
| Kritikus szabály | RUNBOOK.md |
| Architektúra változás | KONZEPCIÓ.md, ARCHITECTURE diagram |
| NPM script változás | CHEAT_SHEET.md, FEJLESZTOI_UTASITAS.md |
| Új terminológia | LINGO.md |

### Dokumentáció Review Checklist

- [ ] Tartalom naprakész?
- [ ] Példák működnek?
- [ ] Parancsok validálva?
- [ ] Screenshot-ok frissek? (ha vannak)
- [ ] Cross-reference linkek működnek?
- [ ] Verzió jelölés helyes?

---

## 🤝 Hozzájárulás

Ha új dokumentumot adsz hozzá a `hopper/` mappához:

1. **Nevezd el** konvenció szerint (UPPERCASE.md)
2. **Add hozzá** ehhez a README-hez a táblázatokhoz
3. **Frissítsd** a `🗂️ Dokumentum Struktúra` részt
4. **Commit message**: `docs: Add <FILENAME> to hopper/`

---

## 📞 Kapcsolat

**Projekt**: UI5 Splash Screen POC
**GitHub**: https://github.com/ac4y-auto/ui5-splash-screen-poc
**Verzió**: 3.1

---

**Hopper - Minden működési tudás egy helyen!** 📚
