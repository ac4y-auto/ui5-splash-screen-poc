/**
 * UI5 Bootstrap Controller
 * @description Dynamic UI5 bootstrap script injection based on environment
 * @version 1.0.0
 */

(function() {
    'use strict';

    // Get current environment
    var env = getCurrentEnv();
    var config = UI5_CONFIGS[env];

    // Show environment badge
    var badge = document.getElementById('env-badge');
    if (badge) {
        badge.textContent = 'UI5 ENV: ' + config.name;
        badge.classList.add('show');
        setTimeout(function() {
            badge.classList.remove('show');
        }, 3000);
    }

    // Log configuration
    console.log('[UI5 Bootstrap] Environment:', config.name);
    console.log('[UI5 Bootstrap] Bootstrap URL:', config.url);
    console.log('[UI5 Bootstrap] Description:', config.description);

    // Create and inject UI5 bootstrap script
    var script = document.createElement('script');
    script.id = 'sap-ui-bootstrap';
    script.src = config.url;
    script.setAttribute('data-sap-ui-theme', 'sap_horizon');
    script.setAttribute('data-sap-ui-libs', 'sap.m');
    script.setAttribute('data-sap-ui-compatVersion', 'edge');
    script.setAttribute('data-sap-ui-async', 'true');
    script.setAttribute('data-sap-ui-onInit', 'module:sap/ui/core/ComponentSupport');
    script.setAttribute('data-sap-ui-resourceroots', JSON.stringify({
        "myapp": "./"
    }));

    // Handle script load error
    script.onerror = function() {
        console.error('[UI5 Bootstrap] Failed to load UI5 from:', config.url);

        // Signal error to splash screen
        window.UI5_LOAD_ERROR = true;

        // Hide splash screen immediately
        if (window.SplashScreen && window.SplashScreen.hide) {
            window.SplashScreen.hide(0); // Immediate hide (no delay)
        }

        // Show error overlay
        showErrorOverlay({
            title: 'UI5 Betöltési Hiba',
            message: 'Az UI5 library nem töltődött be a következő forrásból:',
            source: config.url,
            environment: config.name,
            technicalDetails: {
                environment: env,
                url: config.url,
                error: 'Failed to load resource (network error or 404)'
            }
        });
    };

    // Handle script load success
    script.onload = function() {
        console.log('[UI5 Bootstrap] UI5 script loaded successfully');
    };

    // Inject script into document head
    document.head.appendChild(script);

    console.log('[UI5 Bootstrap] Bootstrap script injected into DOM');

    /**
     * Show error overlay when UI5 fails to load
     */
    function showErrorOverlay(errorInfo) {
        // Create overlay container
        var overlay = document.createElement('div');
        overlay.id = 'ui5-load-error-overlay';
        overlay.className = 'error-overlay';

        // Build error content HTML
        overlay.innerHTML = `
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <h2>${errorInfo.title}</h2>
                <p>${errorInfo.message}</p>
                <div class="error-source">
                    <strong>Forrás:</strong> ${errorInfo.environment}
                    <br>
                    <code>${errorInfo.source}</code>
                </div>

                <div class="error-actions">
                    <button class="btn-primary" onclick="location.reload()">
                        🔄 Oldal újratöltése
                    </button>
                    <button class="btn-secondary" onclick="console.table(window.UI5_CONFIGS)">
                        📋 Konfiguráció megtekintése
                    </button>
                </div>

                <details class="error-details">
                    <summary>Technikai részletek (kattints a megjelenítéshez)</summary>
                    <pre>${JSON.stringify(errorInfo.technicalDetails, null, 2)}</pre>
                </details>

                <div class="error-suggestions">
                    <h3>Lehetséges megoldások:</h3>
                    <ul>
                        <li>Ellenőrizd az internet kapcsolatot</li>
                        <li>Próbáld meg másik környezetet (pl. Local Mode)</li>
                        <li>Ellenőrizd a backend szerver elérhetőségét (Backend/Hybrid mód esetén)</li>
                        <li>Nézd meg a konzolt további hibákért (F12)</li>
                    </ul>
                </div>
            </div>
        `;

        // Inject into body
        document.body.appendChild(overlay);

        // Fade in animation
        setTimeout(function() {
            overlay.classList.add('show');
        }, 10);

        console.log('[UI5 Bootstrap] Error overlay displayed');
    }

})();
