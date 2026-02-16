/**
 * Splash Screen Controller (Configurable Version)
 * @description Lightweight, portable splash screen with external config
 * @version 2.0.0
 */

(function() {
    'use strict';

    /**
     * Default Configuration
     * Override by setting window.SplashConfig BEFORE loading this script
     */
    var defaultConfig = {
        videoId: 'splash-video',
        splashId: 'splash-screen',
        videoPlaybackRate: 0.2,           // Video speed (0.2 = 5x slower)
        hideDelay: 500,                   // Default delay before hide animation (ms)
        fadeOutDuration: 1000,            // Fade-out animation duration (ms)
        removeAfterHide: true,            // Remove from DOM after hide
        autoPlay: true,                   // Auto-play video on show
        debug: false                      // Console logging
    };

    // Merge user config with defaults
    var config = window.SplashConfig || {};
    for (var key in defaultConfig) {
        if (config[key] === undefined) {
            config[key] = defaultConfig[key];
        }
    }

    /**
     * Logger (conditional)
     */
    function log(message) {
        if (config.debug) {
            console.log('[Splash] ' + message);
        }
    }

    /**
     * Initialize splash screen on DOMContentLoaded
     */
    document.addEventListener('DOMContentLoaded', function() {
        log('DOM loaded, initializing splash screen...');

        // Set video playback rate
        var video = document.getElementById(config.videoId);
        if (video && config.videoPlaybackRate) {
            video.playbackRate = config.videoPlaybackRate;
            log('Video playback rate set to ' + config.videoPlaybackRate);
        }
    });

    /**
     * Hide splash screen with animation
     */
    function hideSplashScreen(delay) {
        delay = delay !== undefined ? delay : config.hideDelay;

        setTimeout(function() {
            // Remove loading class from body
            document.body.classList.remove('loading');

            var splash = document.getElementById(config.splashId);
            if (splash) {
                log('Hiding splash screen with fade-out...');
                splash.classList.add('fade-out');

                // Remove from DOM after animation
                if (config.removeAfterHide) {
                    setTimeout(function() {
                        splash.remove();
                        log('Splash screen removed from DOM');
                    }, config.fadeOutDuration);
                }
            }
        }, delay);
    }

    /**
     * Public API for UI5 App Control
     */
    window.SplashScreen = {
        /**
         * Show splash screen
         */
        show: function() {
            var splash = document.getElementById(config.splashId);
            if (splash) {
                // Remove fade-out class if present
                splash.classList.remove('fade-out');
                splash.classList.remove('hidden');

                // Make visible
                splash.style.display = 'flex';
                splash.style.opacity = '1';

                // Start video playback
                if (config.autoPlay) {
                    var video = splash.querySelector('video');
                    if (video) {
                        video.play().catch(function(err) {
                            log('Video autoplay failed (expected in some browsers): ' + err.message);
                        });
                    }
                }

                log('Splash screen SHOWN');
            } else {
                console.warn('[Splash] Splash screen element not found (#' + config.splashId + ')');
            }
        },

        /**
         * Hide splash screen
         * @param {number} delay - Optional delay in ms (default from config)
         */
        hide: function(delay) {
            log('Hide requested');
            hideSplashScreen(delay);
        },

        /**
         * Check if splash is currently visible
         * @returns {boolean}
         */
        isVisible: function() {
            var splash = document.getElementById(config.splashId);
            if (!splash) return false;

            var style = window.getComputedStyle(splash);
            return style.display !== 'none' && style.opacity !== '0';
        },

        /**
         * Get current configuration
         * @returns {object}
         */
        getConfig: function() {
            return config;
        }
    };

    log('Manual control mode - waiting for app to call show()');

})();
