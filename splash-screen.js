/**
 * Splash Screen Controller
 * @description External JavaScript for UI5 Splash Screen
 * @version 1.0.0
 */

(function() {
    'use strict';

    /**
     * Initialize splash screen on DOMContentLoaded
     */
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Splash] DOM loaded, initializing splash screen...');

        // Set video playback rate (slow motion)
        var video = document.getElementById('splash-video');
        if (video) {
            video.playbackRate = 0.2; // 5x slower (20% speed)
            console.log('[Splash] Video playback rate set to 0.2 (5x slower)');
        }

    });

    /**
     * Hide splash screen when UI5 is ready
     */
    function hideSplashScreen(delay) {
        delay = delay || 500; // Default 500ms delay

        setTimeout(function() {
            // Remove loading class from body
            document.body.classList.remove('loading');

            var splash = document.getElementById('splash-screen');
            if (splash) {
                console.log('[Splash] Hiding splash screen with fade-out...');
                splash.classList.add('fade-out');

                // Remove from DOM after animation
                setTimeout(function() {
                    splash.remove();
                    console.log('[Splash] Splash screen removed from DOM');
                }, 1000); // Match CSS transition duration
            }
        }, delay);
    }

    /**
     * MANUAL CONTROL MODE
     *
     * Splash screen NEM indul automatikusan!
     * Az UI5 alkalmazás irányítja a show/hide-ot:
     *
     * - window.SplashScreen.show() → Splash látható (app init-kor)
     * - window.SplashScreen.hide() → Splash eltűnik (adatok betöltve)
     *
     * Példa használat Component.js-ben:
     *
     *   init: function() {
     *       UIComponent.prototype.init.apply(this, arguments);
     *
     *       // Splash START
     *       if (window.SplashScreen) {
     *           window.SplashScreen.show();
     *       }
     *
     *       // Business data loading
     *       this.loadMasterData().then(function() {
     *           // Splash END
     *           if (window.SplashScreen) {
     *               window.SplashScreen.hide();
     *           }
     *       });
     *   }
     */
    console.log('[Splash] Manual control mode - waiting for app to call show()');

    /**
     * BIZTONSÁGI FALLBACK: Ha az app nem hívja meg a hide()-ot
     * (pl. backend timeout, elakadt Promise), a splash 60 mp után
     * automatikusan eltűnik.
     */
    var FALLBACK_TIMEOUT_MS = 60000; // 60 másodperc
    var fallbackTimer = setTimeout(function() {
        if (document.getElementById('splash-screen')) {
            console.warn('[Splash] Fallback timeout (' + (FALLBACK_TIMEOUT_MS / 1000) + 's) - forcing splash screen hide');
            hideSplashScreen(0);
            showFallbackErrorOverlay();
        }
    }, FALLBACK_TIMEOUT_MS);

    /**
     * Show error overlay when fallback timeout fires
     * Ugyanazt a stílust használja, mint az ui5-error-handler.js
     */
    function showFallbackErrorOverlay() {
        // Ne jelenjen meg, ha már van error overlay (pl. ui5-error-handler már megjelenítette)
        if (document.getElementById('ui5-load-error-overlay')) return;

        var overlay = document.createElement('div');
        overlay.id = 'ui5-load-error-overlay';
        overlay.className = 'error-overlay';

        overlay.innerHTML =
            '<div class="error-content">' +
                '<div class="error-icon">⚠️</div>' +
                '<h2>Alkalmazás Betöltési Hiba</h2>' +
                '<p>Az alkalmazás nem töltődött be az elvárt időn belül (' + (FALLBACK_TIMEOUT_MS / 1000) + ' mp).<br>' +
                'Valószínűleg a backend szerver nem elérhető.</p>' +
                '<div class="error-actions">' +
                    '<button class="btn-primary" onclick="location.reload()">' +
                        '🔄 Oldal újratöltése' +
                    '</button>' +
                '</div>' +
                '<div class="error-suggestions">' +
                    '<h3>Lehetséges megoldások:</h3>' +
                    '<ul>' +
                        '<li>Ellenőrizd, hogy a backend szerver fut-e</li>' +
                        '<li>Ellenőrizd a hálózati kapcsolatot</li>' +
                        '<li>Nézd meg a konzolt további hibákért (F12)</li>' +
                    '</ul>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        // Fade in animation
        setTimeout(function() {
            overlay.classList.add('show');
        }, 10);

        console.log('[Splash] Fallback error overlay displayed');
    }

    /**
     * Public API for UI5 App Control
     *
     * Az UI5 alkalmazás ezekkel a metódusokkal irányítja a splash screen-t
     */
    window.SplashScreen = {
        /**
         * Show splash screen
         * Hívd meg az app init-kor, mielőtt az adatok betöltődnek
         */
        show: function() {
            var splash = document.getElementById('splash-screen');
            if (splash) {
                // Remove fade-out class if present
                splash.classList.remove('fade-out');
                splash.classList.remove('hidden');

                // Make visible
                splash.style.display = 'flex';
                splash.style.opacity = '1';

                // Start video playback
                var video = splash.querySelector('video');
                if (video) {
                    video.play();
                }

                console.log('[Splash] ✅ Splash screen SHOWN (app initiated)');
            } else {
                console.warn('[Splash] ⚠️  Splash screen element not found in DOM');
            }
        },

        /**
         * Hide splash screen
         * Hívd meg amikor az app készen áll (adatok betöltve)
         * @param {number} delay - Optional delay in ms (default 500ms)
         */
        hide: function(delay) {
            console.log('[Splash] Hide requested by app');
            clearTimeout(fallbackTimer);
            hideSplashScreen(delay);
        },

        /**
         * Check if splash is currently visible
         * @returns {boolean}
         */
        isVisible: function() {
            var splash = document.getElementById('splash-screen');
            if (!splash) return false;

            var style = window.getComputedStyle(splash);
            return style.display !== 'none' && style.opacity !== '0';
        }
    };

})();
