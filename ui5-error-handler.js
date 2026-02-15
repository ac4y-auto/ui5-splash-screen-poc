/**
 * UI5 Load Error Handler
 * @description Shows error overlay when SAPUI5 fails to load
 * @version 2.0.0
 */

(function() {
    'use strict';

    var bootstrapScript = document.getElementById('sap-ui-bootstrap');
    if (!bootstrapScript) return;

    var LOAD_TIMEOUT_MS = 15000; // 15 seconds

    // Timeout fallback: if UI5 hasn't loaded after timeout, show error
    var loadTimeout = setTimeout(function() {
        if (typeof sap === 'undefined') {
            onLoadError('A SAPUI5 library nem töltődött be az elvárt időn belül (' + (LOAD_TIMEOUT_MS / 1000) + ' mp).');
        }
    }, LOAD_TIMEOUT_MS);

    // Script error event
    bootstrapScript.addEventListener('error', function() {
        clearTimeout(loadTimeout);
        onLoadError('A SAPUI5 library nem töltődött be (hálózati hiba vagy nem elérhető forrás).');
    });

    // Script load success
    bootstrapScript.addEventListener('load', function() {
        clearTimeout(loadTimeout);
        console.log('[UI5] SAPUI5 script loaded successfully');
    });

    /**
     * Handle UI5 load failure
     */
    function onLoadError(message) {
        console.error('[UI5] ' + message);

        // Hide splash screen immediately
        if (window.SplashScreen && window.SplashScreen.hide) {
            window.SplashScreen.hide(0);
        }

        showErrorOverlay({
            title: 'UI5 Betöltési Hiba',
            message: message,
            source: bootstrapScript.src,
            technicalDetails: {
                url: bootstrapScript.src,
                error: message
            }
        });
    }

    /**
     * Show error overlay when UI5 fails to load
     */
    function showErrorOverlay(errorInfo) {
        var overlay = document.createElement('div');
        overlay.id = 'ui5-load-error-overlay';
        overlay.className = 'error-overlay';

        overlay.innerHTML =
            '<div class="error-content">' +
                '<div class="error-icon">⚠️</div>' +
                '<h2>' + errorInfo.title + '</h2>' +
                '<p>' + errorInfo.message + '</p>' +
                '<div class="error-source">' +
                    '<strong>Forrás:</strong>' +
                    '<code>' + errorInfo.source + '</code>' +
                '</div>' +
                '<div class="error-actions">' +
                    '<button class="btn-primary" onclick="location.reload()">' +
                        '🔄 Oldal újratöltése' +
                    '</button>' +
                '</div>' +
                '<details class="error-details">' +
                    '<summary>Technikai részletek (kattints a megjelenítéshez)</summary>' +
                    '<pre>' + JSON.stringify(errorInfo.technicalDetails, null, 2) + '</pre>' +
                '</details>' +
                '<div class="error-suggestions">' +
                    '<h3>Lehetséges megoldások:</h3>' +
                    '<ul>' +
                        '<li>Ellenőrizd az internet kapcsolatot</li>' +
                        '<li>Ellenőrizd, hogy a fejlesztői szerver fut-e (fiori run)</li>' +
                        '<li>Nézd meg a konzolt további hibákért (F12)</li>' +
                    '</ul>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        // Fade in animation
        setTimeout(function() {
            overlay.classList.add('show');
        }, 10);

        console.log('[UI5] Error overlay displayed');
    }

})();
