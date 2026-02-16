# TLDR: Migráció & Verziók

> Kivonatok: OPENUI5_TO_SAPUI5_MIGRATION.md, UI5_VERSION_NOTES.md, LOCAL_MODE_SETUP.md, HYBRID_MODE_GUIDE.md

## OpenUI5 → SAPUI5 Migráció

1. YAML: `framework.name: OpenUI5` → `SAPUI5`
2. CDN URL: `sdk.openui5.org` → `sapui5.hana.ondemand.com`
3. Library-k: SAPUI5-ban van `sap.ushell`, `sap.fe` stb.
4. Licenc: SAPUI5 = SAP kereskedelmi, OpenUI5 = Apache 2.0
5. **Szabály: OpenUI5 használata TILOS ebben a projektben**

## UI5 Verzió Stratégia

- **YAML-ban**: `1.105.0` (minimum)
- **1.105.0 nincs a CDN-en** → CDN módban `version` mező nélkül a latest jön
- Local módban nincs probléma (CLI letölti)
- Fontos: YAML `framework.version` és `proxy.version` egyezzen!

## Local Mode (v4.0)

Már NEM kell SDK-t manuálisan letölteni. A `@ui5/cli` automatikusan kezeli:
- Első futtatáskor letölti `~/.ui5/framework/` mappába
- Utána offline is működik

## Hybrid Mode

- Local UI5 framework (gyors, offline) + Backend proxy (/sap)
- `ui5-hybrid.yaml`: framework section + backend middleware
- Legjobb fejlesztői mód ha van backend szerver
