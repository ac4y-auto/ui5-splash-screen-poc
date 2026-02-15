# Splash Screen - WMS Integrációs Útmutató

Ez az útmutató leírja, hogyan kell integrálni a splash screen mechanizmust egy meglévő WMS SAPUI5/TypeScript projektbe. A splash screen **az app indulásakor** jelenik meg és **az inicializáció végén** tűnik el automatikusan.

---

## Koncepció: Miért kell splash screen?

A WMS alkalmazás indulása során a `Component.init()` metódus aszinkron módon:
1. Inicializálja a REST szolgáltatást
2. Betölti a felhasználói beállításokat
3. Lekéri a session adatokat, jogosultságokat, licenceket
4. Inicializálja a routert

Ez 2-5 másodpercig tarthat, ami alatt a felhasználó üres képernyőt vagy villogó UI elemeket lát.

A **splash screen** megoldás:
- Azonnal megjelenik (még a UI5 bootstrap előtt)
- Videót vagy statikus képet jelenít meg
- Eltakarja a háttérben töltődő alkalmazást
- Automatikusan eltűnik fade-out animációval, amikor az app kész

### Működési elv

```
index.html betöltődik
    ↓
Splash screen azonnal megjelenik (CSS + HTML, UI5 nélkül)
    ↓
Videó lejátszás indul (5x lassítás, loop)
    ↓
UI5 bootstrap elindul a háttérben
    ↓
Component.init() → initCompany() fut aszinkron
    ↓ [SPLASH SCREEN LÁTHATÓ]
    ↓
initCompany() befejeződik
    ↓
Component kód hívja: window.SplashScreen.hide()
    ↓
500ms várakozás + 1s fade-out animáció
    ↓
Splash screen eltávolítva a DOM-ból
    ↓
WMS alkalmazás megjelenik
```

---

## Előfeltételek

- SAPUI5 1.105+ (vagy OpenUI5 1.105+)
- TypeScript alapú UI5 projekt
- Splash videó (`splash-video.mp4`) és/vagy poster kép (`splash-poster.jpeg`)

---

## 1. Asset fájlok másolása

**Forrás:** `wms-integration/images/`
**Cél:** `webapp/images/`

| Fájl | Méret | Leírás |
|------|-------|--------|
| `splash-video.mp4` | ~908 KB | Splash videó (streaming, nem kell teljesen betölteni) |
| `splash-poster.jpeg` | ~25 KB | Poster kép (megjelenik amíg a videó nem indul) |

> **Megjegyzés:** A videó és poster fájlokat a POC projekt gyökeréből kell átmásolni: `ui5-splash-screen-poc/splash-video.mp4` és `ui5-splash-screen-poc/splash-poster.jpeg`

---

## 2. splash-screen.css bemásolása

**Forrás:** `wms-integration/css/splash-screen.css`
**Cél:** `webapp/css/splash-screen.css`

A CSS tartalmazza:
- Full-screen overlay (`position: fixed`, `z-index: 9999`)
- Fade-out animáció (`transition: opacity 1s ease-out`)
- Videó cover méretezés (`object-fit: cover`)
- Body loading állapot (elrejti a fő tartalmat amíg tölt)

### Responsive viselkedés

A splash screen alapból full-screen és `object-fit: cover`-t használ, ami minden képernyőméreten jól működik. A WMS projekt meglévő breakpoint-jai (600px, 374px, 320px, 280px) nem ütköznek vele.

---

## 3. index.html módosítása

### 3.1 CSS betöltése a `<head>`-be

A `<title>` tag után, a UI5 bootstrap script **előtt**:

```html
<title>UI5</title>

<!-- Splash Screen CSS -->                            <!-- ÚJ -->
<link rel="stylesheet" href="css/splash-screen.css">  <!-- ÚJ -->

<script>
    if (!window.location.pathname.endsWith('index.html') ...
```

### 3.2 Splash screen HTML a `<body>` elejére

A `<body>` tag után, a UI5 component div **előtt**:

```html
<body class="sapUiBody sapUiSizeCompact loading" id="content">

    <!-- Splash Screen -->                                                          <!-- ÚJ -->
    <div id="splash-screen">                                                        <!-- ÚJ -->
        <video id="splash-video" autoplay loop muted playsinline                    <!-- ÚJ -->
               poster="images/splash-poster.jpeg">                                  <!-- ÚJ -->
            <source src="images/splash-video.mp4" type="video/mp4">                 <!-- ÚJ -->
        </video>                                                                    <!-- ÚJ -->
    </div>                                                                          <!-- ÚJ -->

    <div data-sap-ui-component
        data-name="ntt.wms"
```

> **Fontos:** A `<body>` tag-hoz hozzá kell adni a `loading` class-t: `class="sapUiBody sapUiSizeCompact loading"`

### 3.3 Splash screen JavaScript a `</body>` elé

A záró `</body>` tag előtt:

```html
    </div>

    <!-- Splash Screen Controller -->                                               <!-- ÚJ -->
    <script src="css/splash-screen.js"></script>                                    <!-- ÚJ -->
</body>
```

> **Megjegyzés:** A `splash-screen.js`-t a `css/` mappába tesszük a `splash-screen.css` mellé, mert összetartoznak. Alternatívaként mehet `utils/`-ba is.

---

## 4. splash-screen.js bemásolása

**Forrás:** `wms-integration/css/splash-screen.js`
**Cél:** `webapp/css/splash-screen.js`

A JavaScript tartalmazza:
- Videó lejátszási sebesség beállítás (0.2 = 5x lassítás)
- UI5 Core init polling (100ms intervallum)
- Fallback timeout (10 másodperc max)
- Globális `window.SplashScreen` API:
  - `window.SplashScreen.hide(delay)` – elrejti a splash screen-t
  - `window.SplashScreen.show()` – újra megjeleníti

### Alapértelmezett viselkedés

A `splash-screen.js` **automatikusan** elrejti a splash screen-t amikor a UI5 Core inicializálódik. Ez azt jelenti, hogy **minimális integráció esetén a 3. lépéssel kész is vagy** – a splash screen működni fog.

---

## 5. Component.ts módosítása (opcionális, ajánlott)

Az alapértelmezett viselkedés a UI5 Core init-kor rejti el a splash screen-t. De a WMS app esetében a `initCompany()` aszinkron hívás **tovább tarthat** mint a UI5 init. Ezért ajánlott a splash screen-t az `initCompany()` befejeződésekor elrejteni.

### 5.1 init() metódus módosítása

A jelenlegi kód:

```typescript
this.initCompany().then( oUser => {
    this.getRouter().initialize();

}).catch((err: any) => {
    MessageBox.error(err.message);
});
```

Módosított kód:

```typescript
this.initCompany().then( oUser => {
    // Splash screen elrejtése az inicializáció végén
    if ((window as any).SplashScreen) {                     // ÚJ
        (window as any).SplashScreen.hide();                // ÚJ
    }                                                       // ÚJ

    this.getRouter().initialize();

}).catch((err: any) => {
    // Hiba esetén is el kell rejteni a splash screen-t
    if ((window as any).SplashScreen) {                     // ÚJ
        (window as any).SplashScreen.hide(0);               // ÚJ
    }                                                       // ÚJ

    MessageBox.error(err.message);
});
```

### 5.2 A splash-screen.js fallback kikapcsolása (opcionális)

Ha a Component.ts-ben kezeled a splash elrejtését, a `splash-screen.js` automatikus UI5 Core init elrejtését kikapcsolhatod. Ehhez a `splash-screen.js`-ben a `hideSplashScreen()` hívást az `attachInit` callback-ben kommentezd ki, és növeld a fallback timeout-ot:

```javascript
sap.ui.getCore().attachInit(function() {
    console.log('[Splash] UI5 Core initialized successfully');
    // hideSplashScreen();  // ← KIKOMMENTEZVE: Component.ts kezeli
});

// Fallback timeout növelése (30 sec, mert a Component kezeli)
setTimeout(function() { ... }, 30000);
```

---

## Fájlok összefoglalása

| Fájl | Művelet | Leírás |
|------|---------|--------|
| `webapp/images/splash-video.mp4` | **ÚJ** | Splash videó fájl |
| `webapp/images/splash-poster.jpeg` | **ÚJ** | Poster kép (videó fallback) |
| `webapp/css/splash-screen.css` | **ÚJ** | Splash screen stílusok és animációk |
| `webapp/css/splash-screen.js` | **ÚJ** | Splash screen logika és globális API |
| `webapp/index.html` | **MÓDOSÍTÁS** | +1 CSS link, +1 HTML blokk, +1 script tag, +1 body class |
| `webapp/Component.ts` | **MÓDOSÍTÁS** (opcionális) | +2 SplashScreen.hide() hívás az initCompany() then/catch-ben |

---

## Gyors integráció (3 perc)

Ha csak a minimális verziót akarod:

1. Másold át a 4 fájlt (`splash-video.mp4`, `splash-poster.jpeg`, `splash-screen.css`, `splash-screen.js`)
2. Módosítsd az `index.html`-t (3 helyen: CSS link, HTML blokk, script tag + body class)
3. Kész – a splash screen automatikusan működik a UI5 Core init alapján

A Component.ts módosítás **opcionális** – csak ha azt akarod, hogy a splash az `initCompany()` végéig maradjon.

---

## Testreszabás

### Videó nélküli splash (csak poster kép)

Ha nem akarsz videót, csak a poster kép jelenik meg:

```html
<div id="splash-screen">
    <img id="splash-poster" src="images/splash-poster.jpeg"
         style="width: 100%; height: 100%; object-fit: cover;">
</div>
```

### Lassítás mértékének változtatása

A `splash-screen.js`-ben:
```javascript
video.playbackRate = 0.2;  // 5x lassabb (alapértelmezett)
video.playbackRate = 0.5;  // 2x lassabb
video.playbackRate = 1.0;  // normál sebesség
```

### Fade-out sebesség változtatása

A `splash-screen.css`-ben:
```css
#splash-screen {
    transition: opacity 1s ease-out;  /* 1 másodperc (alapértelmezett) */
    transition: opacity 0.5s ease-out; /* fél másodperc (gyorsabb) */
    transition: opacity 2s ease-out;   /* 2 másodperc (lassabb) */
}
```

### Háttérszín változtatása

```css
#splash-screen {
    background-color: #000;    /* fekete (alapértelmezett) */
    background-color: #0854a0; /* SAP kék */
    background-color: #fff;    /* fehér */
}
```

---

## Hibakeresés

### A splash screen nem jelenik meg
- Ellenőrizd, hogy a `<link rel="stylesheet" href="css/splash-screen.css">` benne van a `<head>`-ben
- Ellenőrizd, hogy a `<div id="splash-screen">` benne van a `<body>`-ban
- F12 → Console → keress `[Splash]` prefix-ű üzenetekre

### A splash screen nem tűnik el
- F12 → Console → keress `[Splash] UI5 Core detected` üzenetet
- Ha nincs ilyen: a UI5 bootstrap nem töltődik be (ellenőrizd a `resources/sap-ui-core.js` útvonalat)
- Ha van, de nem tűnik el: a `hideSplashScreen()` nem fut le
- Fallback: 10 másodperc után automatikusan eltűnik

### A videó nem indul el
- A `muted` attribútum kötelező (böngésző autoplay policy)
- A `playsinline` attribútum kötelező iOS-en
- Ellenőrizd a videó fájl útvonalát: `images/splash-video.mp4`

### A splash screen villog / újra megjelenik
- Ellenőrizd, hogy a `body` tag-on rajta van a `loading` class
- Ellenőrizd, hogy a CSS-ben a `body.loading #content { visibility: hidden; }` aktív

---

## Összehasonlítás a Theme Manager integrációval

| Szempont | VirtualThemeManager | Splash Screen |
|----------|-------------------|---------------|
| **Új fájlok** | 1 (VirtualThemeManager.ts) | 4 (video, poster, CSS, JS) |
| **Módosított fájlok** | 1 (Component.ts) | 1-2 (index.html + opcionálisan Component.ts) |
| **TypeScript szükséges?** | Igen | Nem (plain JS) |
| **UI5 függőség** | Igen (Theming API) | Nem (pure HTML/CSS/JS, UI5 előtt fut) |
| **Mikor aktív?** | Futás közben, eseményvezérelten | Csak app induláskor |
| **Perzisztencia** | Nincs (session) | Nincs (egyszer fut le) |
