# TLDR: Security

## Összefoglaló
6 azonosított sérülékenység: 1 kritikus (JAVÍTVA), 2 közepes, 2 alacsony, 1 védett.

## Javított
- **PORT Command Injection** (KRITIKUS → JAVÍTVA v3.2)
  - `start.js`: parseInt + range check (1-65535)
  - `PORT="; rm -rf /"` típusú injekció blokkolva

## Dokumentált (nem javított)
- **Process Kill Escalation** (közepes) — heurisztikus PID azonosítás, false positive lehetséges
  - Javaslat: PID file alapú azonosítás
- **CDN Supply Chain** (közepes) — nincs SRI (Subresource Integrity)
  - Javaslat: `integrity="sha384-..."` + `crossorigin="anonymous"`
- **Port Scanning Side Effect** (alacsony) — lsof hívások SIEM-ben láthatók
- **Env Variable Exposure** (alacsony) — PORT látható ps-ben (nem érzékeny)

## Validációk a kódban
- `start.js`: PORT integer parsing + 1-65535 range
- `purge.js`: projekt-specifikus process kill (csak saját marker-ek)
- `start.js`: 3-szintű process azonosítás (project marker, fiori, ui5 serve)

## Ellenőrzés
```bash
grep "name: SAPUI5" ui5*.yaml      # SAPUI5 check
grep -ri "openui5" ui5*.yaml index.html  # ÜRESNEK kell lennie
```
