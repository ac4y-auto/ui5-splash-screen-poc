// UI5 Environment Configuration
const UI5_CONFIGS = {
    cdn: {
        name: 'CDN (SAPUI5 Latest)',
        url: 'https://sapui5.hana.ondemand.com/resources/sap-ui-core.js',
        description: 'Uses SAPUI5 latest version from official SAP CDN (always up-to-date)'
    },
    local: {
        name: 'Local (UI5 CLI serve)',
        url: '/resources/sap-ui-core.js',
        description: 'Uses locally installed SAPUI5 served by UI5 CLI (ui5 serve)'
    },
    backend: {
        name: 'Backend Server (direct)',
        url: 'http://192.168.1.10:9000/resources/sap-ui-core.js',
        description: 'Uses UI5 directly from backend server (requires CORS or same-origin)'
    },
    hybrid: {
        name: 'Hybrid (backend via proxy)',
        url: '/proxy/resources/sap-ui-core.js',
        description: 'Uses UI5 from backend server via local reverse proxy (CORS-safe, SAP recommended)'
    }
};

// Get current environment (set at build/server start)
// This value is injected by the server via placeholder replacement
// Default: 'cdn' (if not replaced by build process)
function getCurrentEnv() {
    // Environment is set at build time, not runtime
    // The placeholder {{UI5_ENV}} will be replaced by server startup script
    return window.UI5_ENVIRONMENT || 'cdn';
}

// Get UI5 bootstrap URL for current environment
function getUI5BootstrapUrl() {
    const env = getCurrentEnv();
    return UI5_CONFIGS[env]?.url || UI5_CONFIGS.cdn.url;
}

// Export for use in HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UI5_CONFIGS, getCurrentEnv, getUI5BootstrapUrl, saveEnvPreference };
}
