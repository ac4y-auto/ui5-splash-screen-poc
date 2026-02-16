# TLDR: Tanulságok & Buktatók

> Kivonatok: RABBIT_HOLES.md, DEBRIEF_v3.1.md

## Rabbit Holes (zsákutcák)

### URL paraméterek vs Build-time injection
- **Próba**: `?env=cdn` URL paraméterrel mód váltás
- **Probléma**: UI5 bootstrap `src` nem változtatható runtime-ban
- **Megoldás**: Build-time injection → majd v4.0-ban YAML config

### Több index.html fájl
- **Próba**: index-cdn.html, index-local.html külön fájlok
- **Probléma**: Karbantarthatatlan, duplikáció
- **Megoldás**: Egy statikus index.html + YAML módok

### OpenUI5 1.105.0 CDN
- **Probléma**: Nincs fent a CDN-en (404)
- **Megoldás**: SAPUI5 CDN-re váltás, vagy local mód

## Jó Döntések (v3.1 debrief)

- Template + build rendszer bevezetése (v3.0) — átmeneti, de tanulságos
- Smart Start alapértelmezett → kevesebb port conflict
- SAPUI5-re váltás → teljes library support

## Rossz Döntések

- Windows PORT szintaxis (`set PORT=...`) macOS-en nem megy → `PORT=9000 npm run...` kell
- Túl sok npm script (14 db v3.1-ben) → v4.0-ban 11-re csökkent
- Build rendszer felesleges komplexitás volt → v4.0 törölte

## Fő Tanulság

**Egyszerűsíts!** A fiori run + YAML a legegyszerűbb és legstabilabb megoldás. Nincs build, nincs template, nincs config.js — csak YAML és statikus HTML.
