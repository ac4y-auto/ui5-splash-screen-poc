# TLDR: Cheat Sheet

## Alapadatok
- **Port**: 8300 | **URL**: http://localhost:8300/index.html
- **SAPUI5**: 1.105.0 | **Theme**: sap_horizon | **OpenUI5 TILOS**
- **Szerver**: `fiori run` (@sap/ux-ui5-tooling)

## Parancsok

| Cél | Parancs |
|-----|---------|
| Indítás (local) | `npm start` |
| CDN mód | `npm run start:cdn` |
| Backend mód | `npm run start:backend` |
| Hybrid mód | `npm run start:hybrid` |
| Smart start | `npm run smart-start` |
| Port kill | `npm run purge` |
| Purge + start | `npm run purge && npm run smart-start:hybrid` |

## 4 mód

| Mód | YAML | UI5 forrás | Backend |
|-----|------|------------|---------|
| Local | `ui5.yaml` | ~/.ui5/ cache | - |
| CDN | `ui5-cdn.yaml` | SAP CDN proxy | - |
| Backend | `ui5-backend.yaml` | SAP CDN proxy | /sap → 192.168.1.10:9000 |
| Hybrid | `ui5-hybrid.yaml` | ~/.ui5/ cache | /sap → 192.168.1.10:9000 |

## Fontos fájlok
- `index.html` — statikus, SAPUI5 bootstrap + splash
- `splash-screen.js` — SplashScreen API (show/hide/isVisible)
- `splash-screen.css` — splash stílusok (display: flex, opacity: 1)
- `ui5-error-handler.js` — error overlay (180s timeout + script error)
- `Component.js` — app logika, splash vezérlés
- `start.js` — Smart Start (port check), `purge.js` — process killer
- `WMS-INTEGRATION-INSTANT/` — integrációs csomag (install.sh + 9 fájl)

## Gyors debug
```bash
lsof -ti:8300                    # ki foglalja a portot?
npm run purge                    # projekt process leállítás
grep "name: SAPUI5" ui5*.yaml    # SAPUI5 ellenőrzés
```
