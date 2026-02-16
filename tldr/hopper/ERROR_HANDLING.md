# TLDR: Error Handling

## Lényeg
UI5 betöltési hiba → splash eltűnik → error overlay megjelenik (retry gomb + tech details).

## Két detekciós mechanizmus (ui5-error-handler.js)
1. **Script error event** — azonnali (404, hálózati hiba)
2. **15s timeout** — ha `typeof sap === 'undefined'` 15 mp után

## Sikeres betöltés
- `bootstrapScript.load` event → `clearTimeout` → nincs overlay

## Error overlay tartalma
- Warning ikon (pulse animáció)
- Cím: "UI5 Betöltési Hiba" (piros)
- Hibaüzenet + forrás URL
- **"Oldal újratöltése" gomb**
- Technikai részletek (expandable JSON)
- Megoldási javaslatok (internet, szerver, F12)

## Flow
```
Hiba → onLoadError() → SplashScreen.hide(0) → showErrorOverlay()
                        ↑ azonnali               ↑ fade-in animáció
```

## Tesztelés
```bash
npm start
open http://localhost:8300/test-error-overlay.html
# → splash → ~1s → error overlay megjelenik
```

## v3.2 → v4.0 változás
- `ui5-bootstrap.js` → `ui5-error-handler.js`
- Timeout hozzáadva (15s) a script error mellé
- Nincs config gomb (YAML-ból jön a konfig)
