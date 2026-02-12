# UI5 Splash Screen POC

UI5 alkalmazás splash screen-nel, amely webm videót játszik le a betöltés alatt.

## Fájlok

- `index.html` - Fő HTML fájl a splash screen implementációval
- `Component.js` - UI5 Component
- `manifest.json` - Alkalmazás manifest
- `view/App.view.xml` - Fő view
- `controller/App.controller.js` - Fő controller

## Splash Screen Funkciók

- **Video attribútumok**: autoplay, loop, muted, playsinline
- **Automatikus elrejtés**: A splash screen automatikusan eltűnik, amikor az UI5 betöltődik
- **Smooth átmenet**: Fade-out animáció
- **Responsive**: Teljes képernyős, object-fit: cover

## Használat

1. Helyezd el a `splash-video.mp4` (vagy .webm) fájlt a projekt gyökérkönyvtárába
2. **(Opcionális)** Helyezd el a `splash-poster.jpg` előnézeti képet is
3. Nyisd meg az `index.html` fájlt egy böngészőben vagy web szerverrel

### Fejlesztési szerver (opcionális)

```bash
# Python 3
python -m http.server 8080

# Node.js (http-server)
npx http-server -p 8080
```

Majd nyisd meg: http://localhost:8080

## Testreszabás

### Video cseréje
Cseréld le a `splash-video.webm` fájlt a saját videódra.

### Háttérszín módosítása
Az `index.html` fájlban módosítsd a `#splash-screen` background-color értékét.

### Átmenet sebességének változtatása
Az `index.html` fájlban módosítsd a transition és setTimeout értékeket.
