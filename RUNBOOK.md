# 📘 RUNBOOK - UI5 Splash Screen POC

**Projekt**: UI5 Splash Screen POC
**Lokáció**: `C:\work\ui5\ui5-splash-screen-poc`
**Port**: 8300
**Létrehozva**: 2026-02-12

---

## 🎯 KRITIKUS SZABÁLYOK

### 1. **Tesztelési Protokoll** ⚠️

**MINDIG Claude tesztel először böngészőben, CSAK UTÁNA szól a usernek!**

#### Lépések:
1. ✅ Claude megnyitja a böngészőt
2. ✅ Claude navigál a megfelelő URL-re
3. ✅ Claude ellenőrzi a funkciót (screenshot, console, network)
4. ✅ Claude elemzi az eredményt
5. ✅ **CSAK EZUTÁN** szól a usernek, hogy nézzen rá

#### Miért?
- User időt spórol
- Claude előre észleli a problémákat
- Csak működő funkciókat mutatunk be

---

## 🚀 Szerver Működés

### Aktív Szerver
- **Port**: 8300
- **URL**: http://localhost:8300
- **Főoldal**: http://localhost:8300/index-configurable.html

### Szerver Indítás
```bash
npm start
```

### Szerver Leállítás
```bash
# Port használat ellenőrzése
netstat -ano | findstr :8300

# Process leállítása (PID-t helyettesítsd)
cmd //c "taskkill /PID [PID] /F"
```

### Háttérben Futó Task Ellenőrzése
Ha a szerver task ID-vel fut (pl. b079a0d), akkor a TaskOutput tool-lal ellenőrizhető.

---

## 🌍 Environment URL-ek

### CDN Mode (Alapértelmezett)
```
http://localhost:8300/index-configurable.html?env=cdn
```

### Backend Mode
```
http://localhost:8300/index-configurable.html?env=backend
```

### Local Mode
```
http://localhost:8300/index-configurable.html?env=local
```

---

## 🧪 Tesztelési Checklist

### Minden Változtatás Után:

1. **Fájl mentés** - Ensure file is saved
2. **Browser tesztelés Claude által**:
   - [ ] Screenshot készítés
   - [ ] Console log ellenőrzés
   - [ ] Network requests ellenőrzés
   - [ ] Funkció validálás
3. **User értesítés** - "Kész, nézd meg te is!"

### Splash Screen Specifikus:
- [ ] Videó betöltődik
- [ ] Poster megjelenik
- [ ] Autoplay működik
- [ ] Fade-out animáció smooth
- [ ] UI5 app betöltődik utána
- [ ] Environment badge látható

---

## 📝 Git Workflow

### Minden Commit Előtt:
```bash
git status
```

### Commit Üzenet Formátum:
```
type: Short description

- Detailed change 1
- Detailed change 2

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Types:
- `feat:` - Új funkció
- `fix:` - Bugfix
- `docs:` - Dokumentáció
- `refactor:` - Refaktorálás
- `test:` - Tesztek
- `chore:` - Karbantartás

### Push
```bash
git push origin main
```

---

## 🔧 Gyakori Műveletek

### Config.js Módosítás
Backend URL változtatás:
```javascript
backend: {
    url: 'http://YOUR_IP:PORT/resources/sap-ui-core.js'
}
```

### Splash Screen Időzítés
`index-configurable.html`:
```javascript
}, 500); // <- ms delay
```

### Videó Sebesség
```javascript
video.playbackRate = 0.2; // 0.2 = 5x lassabb
```

---

## 🐛 Hibaelhárítás

### Port Foglalt Hiba
```bash
# Ellenőrizd mi használja a portot
netstat -ano | findstr :8300

# Állítsd le a folyamatot
cmd //c "taskkill /PID [PID] /F"
```

### Backend Nem Elérhető
- Normális ha 192.168.1.10:9000 offline
- Fallback: Használd CDN mode-ot

### i18n 404 Errorok
- Nem kritikus
- i18n fájlok opcionálisak

### UI5 Nem Tölt Be
1. Ellenőrizd Network tab-ot
2. Ellenőrizd Console error-okat
3. Próbáld CDN mode-ot
4. Clear cache + hard reload (Ctrl+Shift+R)

---

## 📊 Monitoring

### Browser DevTools
- **Console**: Hibaüzenetek, logok
- **Network**: Resource betöltés, timing
- **Application**: LocalStorage értékek

### Ellenőrizendő:
- UI5 bootstrap script betöltődik
- Splash video letöltődik (908KB)
- Poster image betöltődik (25KB)
- Environment badge helyesen jelenik meg
- Nincs CORS error

---

## 📞 Gyors Referencia

### Dokumentációk
- **README.md** - Használati útmutató
- **KONZEPCIÓ.md** - Architektúra
- **FEJLESZTOI_UTASITAS.md** - Integráció
- **SESSION_HANDOFF.md** - Session handoff

### GitHub
- **Repo**: https://github.com/ac4y-auto/ui5-splash-screen-poc
- **User**: ac4y-auto
- **Branch**: main

### Eszközök
- Node.js: v20.20.0
- Git: Telepítve
- GitHub CLI: Bejelentkezve (ac4y)

---

## ✅ Session Start Checklist

1. [ ] Ellenőrizd git status
2. [ ] Ellenőrizd szerver fut-e (port 8300)
3. [ ] Ha nem fut, indítsd: `npm start`
4. [ ] Nyisd meg böngészőben: http://localhost:8300/index-configurable.html
5. [ ] **Claude tesztel először**
6. [ ] Git pull ha kell: `git pull origin main`

---

## ✅ Session End Checklist

1. [ ] Minden változtatás commit-olva
2. [ ] Push GitHub-ra
3. [ ] SESSION_HANDOFF.md frissítve
4. [ ] Szerver leállítható (vagy futhat)

---

**Frissítve**: 2026-02-12
**Verzió**: 1.0
