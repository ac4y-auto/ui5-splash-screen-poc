# WMS Splash Screen Integration Package

Ez a csomag tartalmazza az osszes fajlt es dokumentaciot, amely szukseges a splash screen integralasahoz a WMS projektbe.

## Csomag tartalma

### Forrasfajlok (`css/`)

| Fajl | Leiras | Tipusa |
|------|--------|--------|
| `css/splash-screen.css` | Splash screen + error overlay stilusok | **Uj fajl** |
| `css/splash-screen.js` | Splash screen logika (manualis vezerles + 60s fallback + error overlay) | **Uj fajl** |
| `css/ui5-error-handler.js` | SAPUI5 betoltesi hiba kezelo (180s timeout + script error) | **Uj fajl** |

### Modositott WMS fajlok (vegleges allapot)

| Fajl | Leiras |
|------|--------|
| `index.html` | Modositott WMS index.html (splash screen elemekkel) |
| `Component.ts` | Modositott WMS Component.ts (SplashScreen.hide() hivasokkal) |

### Eredeti fajlok (`original/`)

| Fajl | Leiras |
|------|--------|
| `original/index.html` | Eredeti (erintetetlen) WMS index.html |
| `original/Component.ts` | Eredeti (erintetetlen) WMS Component.ts |

### Diff fajlok (`diffs/`)

| Fajl | Leiras |
|------|--------|
| `diffs/index.html.diff` | Valtozasok az index.html-ben (unified diff) |
| `diffs/Component.ts.diff` | Valtozasok a Component.ts-ben (unified diff) |

### Dokumentacio

| Fajl | Leiras |
|------|--------|
| `INTEGRATION_GUIDE.md` | Reszletes integralasos utmutato (architektura, lepesek, API, troubleshooting) |
| `README.md` | Ez a fajl |

## Gyors telepites

### 1. Masold a CSS/JS fajlokat

```bash
cp css/splash-screen.css   <WMS_PROJEKT>/webapp/css/
cp css/splash-screen.js    <WMS_PROJEKT>/webapp/css/
cp css/ui5-error-handler.js <WMS_PROJEKT>/webapp/css/
```

### 2. Alkalmazd a patcheket

```bash
# index.html patch
cd <WMS_PROJEKT>/webapp/
patch -p0 < diffs/index.html.diff

# Component.ts patch
patch -p0 < diffs/Component.ts.diff
```

Vagy manualis szerkesztes: lasd az `INTEGRATION_GUIDE.md`-t.

### 3. Media fajlok (opcionalis)

A `splash-video.mp4` es `splash-poster.jpeg` fajlokat a POC projekt gyoker mappjabol masold:
```bash
mkdir -p <WMS_PROJEKT>/webapp/images/
cp <POC>/splash-video.mp4   <WMS_PROJEKT>/webapp/images/
cp <POC>/splash-poster.jpeg <WMS_PROJEKT>/webapp/images/
```

## Verifikalas

A diff fajlokat az eredeti baseline alapjan generaltuk:
- Baseline: `/Volumes/DevAPFS/work/ui5/prepared/sapui5-wms-main/wms/webapp/`
- Modositott: A WMS projekt a splash screen integraciot kovetoen

## Teljes dokumentacio

Reszletes informacio: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
