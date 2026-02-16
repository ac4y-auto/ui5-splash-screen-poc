# TLDR: Changelog & Release History

> Kivonatok: CHANGELOG_v3.0.md, CHANGELOG_v3.2.md, RELEASE_NOTES_v3.2.md, DEBRIEF_v3.1.md

## v4.0.0 (2026-02-15) — CURRENT

- **fiori run** migráció (http-server + build.js törölve)
- Statikus index.html (nincs template/build)
- YAML konfigurációk (4 mód)
- Hybrid mód visszakerült
- Purge: külön process killer (`purge.js`)
- Törölt fájlok: build.js, config.js, ui5-bootstrap.js, index.template.html

## v3.2.0 — App-Controlled Splash

- **Breaking**: splash manuális API (show/hide)
- Error overlay (ui5-error-handler.js)
- PORT command injection fix (CRITICAL)
- Namespace mismatch fix (Component.js 404)

## v3.1.0 — Smart Start

- Port conflict management (`start.js`)
- VSCode launch configs
- Process tagging
- **Tanulság**: Windows PORT szintaxis nem működik macOS-en

## v3.0.0 — Build-Based

- index.template.html → build → index.html pipeline
- 4 environment mód (CDN, Local, Hybrid, Build)

## v2.0.0 — Moduláris

- Monolitikus → 3 külső fájl (CSS, JS, API)
- HTML 155→40 sor (75% csökkenés)

## v1.0.0 — Alap

- Automatikus UI5 polling splash
- CDN only
