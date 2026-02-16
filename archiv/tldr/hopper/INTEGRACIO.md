# TLDR: Integráció & Fejlesztés

> Kivonatok: INTEGRATION_PLAN.md, SMART_START_GUIDE.md, REFACTORING_NOTES.md

## WMS Integrációs Terv

3 megközelítés a splash screen beépítéséhez más projektekbe:

| Módszer | Leírás | Ajánlott? |
|---------|--------|-----------|
| Componential | Minden UI5 Component-ben | Nem — túl bonyolult |
| HTML-only | Csak index.html módosítás | Részben — nincs app kontroll |
| **Hybrid** | HTML markup + Component lifecycle | **Igen** — legjobb UX |

**Integrációs lépések:**
1. Másold: `splash-screen.js`, `splash-screen.css`, video/poster fájlok
2. index.html: CSS link + script src + splash div
3. Component.js: `SplashScreen.show()` / `.hide()` hívások

## Smart Start

```bash
npm run smart-start          # port check + fiori run
npm run smart-start:cdn      # CDN módban
npm run purge                # port felszabadítás (külön)
PORT=9000 npm run smart-start # egyedi port
```

- `start.js`: ellenőrzi a portot, hibát dob ha foglalt
- `purge.js`: projekt-specifikus process killer (csak saját folyamatokat öl)

## Refactoring Tanulságok

- Monolitikus HTML → moduláris fájlok = karbantarthatóbb
- Globális API (`window.SplashScreen`) = egyszerű integráció
- Build rendszer → statikus fájl = kevesebb komplexitás
