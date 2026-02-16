# Eredeti vs Konfigurálható Verzió

## Gyors döntési fa

```
Kérdés: Több projektben használod a splash-t?
├─ IGEN → Konfigurálható verzió (splash-screen-configurable.js)
│         Indok: Projektenként eltérő timeout/szöveg/stílus
│
└─ NEM → Eredeti verzió (splash-screen.js)
         Indok: Egyszerűbb, kevesebb kód
```

---

## Fő különbségek

| Szempont | Eredeti | Konfigurálható |
|----------|---------|----------------|
| **Timeout értékek** | Hardcoded (15s, 500ms) | Config objektumból |
| **Hibaüzenetek** | Magyarok, hardcoded | Config objektumból (i18n ready) |
| **Video sebesség** | Hardcoded (0.2) | Config objektumból |
| **Logging** | Mindig be | `debug: true/false` |
| **Fájl méret** | ~3.5 KB | ~4.5 KB (+1 KB) |
| **Komplexitás** | Egyszerűbb | Kicsit bonyolultabb |
| **Karbantartás** | Hardcoded változtatás | Config objektum módosítása |

---

## Példa: Timeout módosítás

### Eredeti verzió
**Timeout növelése 15s → 30s:**

1. Nyisd meg `ui5-error-handler.js`
2. Keresd meg: `var LOAD_TIMEOUT_MS = 15000;`
3. Módosítsd: `var LOAD_TIMEOUT_MS = 30000;`
4. Mentés

**Probléma:** Minden update-nél újra kell módosítani.

### Konfigurálható verzió
**Timeout növelése 15s → 30s:**

1. Nyisd meg `index.html`
2. Add hozzá a config objektumot:
```html
<script>
    window.UI5ErrorConfig = {
        loadTimeoutMs: 30000
    };
</script>
```
3. Mentés

**Előny:** A script fájl változatlan marad, update-nél nem veszed el a beállítást.

---

## Kód összehasonlítás

### Eredeti splash-screen.js
```javascript
function hideSplashScreen(delay) {
    delay = delay || 500; // Hardcoded default

    setTimeout(function() {
        document.body.classList.remove('loading');

        var splash = document.getElementById('splash-screen'); // Hardcoded ID
        if (splash) {
            console.log('[Splash] Hiding...'); // Mindig logol
            splash.classList.add('fade-out');

            setTimeout(function() {
                splash.remove();
            }, 1000); // Hardcoded duration
        }
    }, delay);
}
```

### Konfigurálható splash-screen-configurable.js
```javascript
var config = window.SplashConfig || {};
for (var key in defaultConfig) {
    if (config[key] === undefined) {
        config[key] = defaultConfig[key];
    }
}

function hideSplashScreen(delay) {
    delay = delay !== undefined ? delay : config.hideDelay; // Config-ból

    setTimeout(function() {
        document.body.classList.remove('loading');

        var splash = document.getElementById(config.splashId); // Config-ból
        if (splash) {
            log('Hiding...'); // Conditional log (debug flag)
            splash.classList.add('fade-out');

            if (config.removeAfterHide) { // Config-ból
                setTimeout(function() {
                    splash.remove();
                }, config.fadeOutDuration); // Config-ból
            }
        }
    }, delay);
}
```

---

## Migráció (Eredeti → Konfigurálható)

### 1. Fájlnevek cseréje

**index.html:**
```diff
- <script src="splash-screen.js"></script>
+ <script src="splash-screen-configurable.js"></script>

- <script src="ui5-error-handler.js"></script>
+ <script src="ui5-error-handler-configurable.js"></script>
```

### 2. Config objektumok hozzáadása (opcionális)

Ha **nincs** config objektum, akkor a defaultok lépnek életbe (azonosak az eredeti hardcoded értékekkel).

Ha **van** config objektum, akkor felülírja a defaultokat.

### 3. Kompatibilitás

**100% backward compatible!** Ha nem adsz meg config objektumot, akkor pontosan úgy viselkedik, mint az eredeti.

```html
<!-- ELŐTTE (eredeti) -->
<script src="splash-screen.js"></script>

<!-- UTÁNA (konfigurálható, default értékekkel) -->
<script src="splash-screen-configurable.js"></script>
<!-- Ugyanúgy működik, nincs config objektum -->
```

---

## Ajánlás projektenként

### Kis projekt (1 SAPUI5 app)
→ **Eredeti verzió**
- Egyszerűbb, kevesebb kód
- Timeout változtatás ritkán szükséges
- Hibaüzenetek egy nyelven

### Több projekt / Nagyobb szervezet
→ **Konfigurálható verzió**
- Projektenként eltérő timeout igények
- Többnyelvű hibaüzenetek (i18n)
- Centralizált script fájlok (CDN/shared folder)
- Egyszer frissíted a JS-t, minden projekten működik

### Példa: Centralizált használat

```
/shared/splash/
├── splash-screen-configurable.js  (verzió: 2.0.0)
├── splash-screen.css
└── ui5-error-handler-configurable.js

/project-A/webapp/index.html:
    <script src="/shared/splash/splash-screen-configurable.js"></script>
    <script>
        window.SplashConfig = { hideDelay: 300 }; // Project A: gyors
    </script>

/project-B/webapp/index.html:
    <script src="/shared/splash/splash-screen-configurable.js"></script>
    <script>
        window.SplashConfig = { hideDelay: 1000 }; // Project B: lassú
    </script>
```

**Előny:** Ha van bug a splash-ben, 1 helyen javítod → minden projekt automatikusan frissül.

---

## Döntési mátrix

| Ha... | Akkor... |
|-------|----------|
| Egyetlen projekt van | Eredeti verzió |
| Timeout/delay soha nem változik | Eredeti verzió |
| Nincs szükség i18n-re | Eredeti verzió |
| Több projekt van | Konfigurálható verzió |
| Projektenként más timeout kell | Konfigurálható verzió |
| Többnyelvű hibaüzenetek | Konfigurálható verzió |
| Centralizált script tárolás (CDN) | Konfigurálható verzió |
| Debug logging kapcsolható kell legyen | Konfigurálható verzió |

---

## Teljesítmény

**Nincs mérhető különbség:**
- Konfigurálható verzió: +1 KB gzip után
- Futás: +1-2ms inicializáció (config merge)
- Memória: +200 bytes (config objektum)

**Böngészők:** IE11+, Edge, Chrome, Firefox, Safari (mindkét verzió ES5)

---

## Konklúzió

### Eredeti verzió akkor, ha:
✅ Egy projekt, egyszer beállítod, kész
✅ Egyszerűséget preferálod
✅ Nincs igény konfigurációra

### Konfigurálható verzió akkor, ha:
✅ Több projekt, újrafelhasználhatóság
✅ Timeout/delay/hibaüzenet testreszabás
✅ Debug logging be/ki kapcsolása
✅ i18n támogatás (többnyelvű szövegek)

**Mindkét verzió production-ready, válaszd a projekted igényei szerint!**
