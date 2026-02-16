# TLDR: Session History

> Kivonatok: SESSION_HANDOFF.md, SESSION_HANDOFF_20260212, _v2.0, _v3.1, _v3.2, SESSION_SUMMARY_v3.1

## Session 1 (v1.0)
- Projekt indítás, CDN splash screen
- Multi-env config alapok
- Backend offline, csak CDN működik

## Session 2 (v1.x)
- Poster kép 100% fix
- WMS integrációs terv készült
- UI5 1.105.0 CDN probléma felismerése (nincs a CDN-en)
- 7 új dokumentum

## Session 3 (v2.0)
- Moduláris refactoring: 1 fájl → 3 külső fájl
- `window.SplashScreen` globális API létrehozása
- 75% HTML méretcsökkenés

## Session 4 (v3.1)
- template → build → HTML pipeline
- Smart Start port management
- SAPUI5 CDN migráció (OpenUI5 → SAPUI5)
- VSCode launch configs

## Session 5 (v3.2)
- App-controlled splash (manuális show/hide)
- Error overlay UI5 hibákhoz
- PORT validation security fix
- Teljes splash ciklus: ~2.5s

## Session 6 (v4.0) — CURRENT
- fiori run migráció
- Build rendszer eltávolítva
- 4 YAML mód (Local, CDN, Backend, Hybrid)
- Purge külön eszköz
