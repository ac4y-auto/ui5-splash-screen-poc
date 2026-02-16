# TLDR: Runbook

## Kritikus szabályok
1. **SAPUI5 ONLY** — OpenUI5 TILOS, CDN: `sapui5.hana.ondemand.com`
2. **Claude tesztel először** böngészőben, csak utána szól a usernek
3. **Session végén debrief** — `hopper/DEBRIEF_v{VERSION}.md`

## Session start checklist
- [ ] `git status` + `git pull origin main`
- [ ] Szerver fut? `npm start` (port 8300)
- [ ] Böngésző: http://localhost:8300/index.html

## Session end checklist
- [ ] Minden commitolva + pusholva
- [ ] Debrief megírva

## Szerver kezelés
```bash
npm start                  # local mód
npm run smart-start:cdn    # CDN + port check
npm run purge              # port felszabadítás
npm run purge && npm run smart-start:hybrid  # teljes restart
```

## Hibaelhárítás
- **Port foglalt** → `npm run purge` majd újraindítás
- **UI5 nem tölt** → Network tab (F12), szerver fut?, próbáld más módban
- **Error overlay** → ui5-error-handler.js 15s timeout, ellenőrizd szerver+hálózat
- **Backend offline** → normális ha 192.168.1.10:9000 nem elérhető, használj local/CDN módot
- **i18n 404** → nem kritikus, i18n fájlok opcionálisak

## Git workflow
```
type: Short description

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```
Types: feat, fix, docs, refactor, test, chore
