/**
 * Splash Screen Controller (WMS Integration)
 * @description Manages splash screen lifecycle: video playback, UI5 init detection, fade-out
 * @version 1.0.0
 *
 * Global API:
 *   window.SplashScreen.hide(delay)  - Hide splash with optional delay (ms), default 500
 *   window.SplashScreen.show()       - Re-show splash (if still in DOM)
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
     * Hide splash screen with fade-out animation
     * @param {number} [delay=500] - Delay in ms before starting fade-out
     */
    function hideSplashScreen(delay) {
        delay = delay || 500;

        setTimeout(function() {
            // Remove loading class from body
            document.body.classList.remove('loading');

            var splash = document.getElementById('splash-screen');
            if (splash) {
                console.log('[Splash] Hiding splash screen with fade-out...');
                splash.classList.add('fade-out');

                // Remove from DOM after CSS transition completes
                setTimeout(function() {
                    splash.remove();
                    console.log('[Splash] Splash screen removed from DOM');
                }, 1000); // Match CSS transition duration (1s)
            }
        }, delay);
    }

    /**
     * Detect UI5 Core initialization via polling
     * Falls back to timeout if UI5 never loads
     */
    if (typeof sap !== 'undefined') {
        console.log('[Splash] UI5 already loaded, hiding splash...');
        hideSplashScreen();
    } else {
        console.log('[Splash] Waiting for UI5 Core to initialize...');

        var checkUI5Interval = setInterval(function() {
            if (typeof sap !== 'undefined' && sap.ui && sap.ui.getCore) {
                clearInterval(checkUI5Interval);
                console.log('[Splash] UI5 Core detected, attaching init handler...');

                sap.ui.getCore().attachInit(function() {
                    console.log('[Splash] UI5 Core initialized successfully');
                    // Alapértelmezés: UI5 init-kor elrejtjük
                    // Ha a Component.ts kezeli, kommentezd ki az alábbi sort:
                    hideSplashScreen();
                });
            }
        }, 100);

        // Fallback: hide after 10 seconds no matter what
        setTimeout(function() {
            clearInterval(checkUI5Interval);
            if (document.getElementById('splash-screen')) {
                console.warn('[Splash] UI5 init timeout (10s), forcing splash screen hide');
                hideSplashScreen(0);
            }
        }, 10000);
    }

    /**
     * Global SplashScreen API
     */
    window.SplashScreen = {
        hide: hideSplashScreen,
        show: function() {
            var splash = document.getElementById('splash-screen');
            if (splash) {
                splash.classList.remove('fade-out');
                document.body.classList.add('loading');
                console.log('[Splash] Splash screen shown');
            }
        }
    };

})();
