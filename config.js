// UI5 Environment Configuration
const UI5_CONFIGS = {
    cdn: {
        name: 'CDN (OpenUI5 SDK)',
        url: 'https://sdk.openui5.org/resources/sap-ui-core.js',
        description: 'Uses OpenUI5 from official CDN'
    },
    local: {
        name: 'Local (node_modules)',
        url: './node_modules/@openui5/sap.ui.core/resources/sap-ui-core.js',
        description: 'Uses locally installed OpenUI5 from node_modules'
    },
    backend: {
        name: 'Backend Server',
        url: 'http://192.168.1.10:9000/resources/sap-ui-core.js',
        description: 'Uses UI5 from custom backend server'
    }
};

// Get current environment (default: cdn)
function getCurrentEnv() {
    const urlParams = new URLSearchParams(window.location.search);
    const envParam = urlParams.get('env');
    const envFromStorage = localStorage.getItem('ui5_env');
    return envParam || envFromStorage || 'cdn';
}

// Save environment preference
function saveEnvPreference(env) {
    if (UI5_CONFIGS[env]) {
        localStorage.setItem('ui5_env', env);
    }
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
