/**
 * UI5 Load Error Handler (Configurable Version)
 * @description Shows error overlay when SAPUI5 fails to load
 * @version 3.0.0
 */

(function() {
    'use strict';

    /**
     * Default Configuration
     * Override by setting window.UI5ErrorConfig BEFORE loading this script
     */
    var defaultConfig = {
        bootstrapScriptId: 'sap-ui-bootstrap',
        loadTimeoutMs: 15000,              // Timeout for UI5 load (ms)
        messages: {
            title: 'UI5 Loading Error',
            timeout: 'SAPUI5 library did not load within expected time',
            networkError: 'SAPUI5 library failed to load (network error or unavailable source)',
            reloadButton: '🔄 Reload Page',
            technicalDetails: 'Technical Details (click to expand)',
            suggestions: 'Possible Solutions:',
            suggestionList: [
                'Check your internet connection',
                'Verify the development server is running',
                'Check the console for additional errors (F12)'
            ]
        },
        debug: false
    };

    // Merge user config with defaults
    var config = window.UI5ErrorConfig || {};
    for (var key in defaultConfig) {
        if (config[key] === undefined) {
            config[key] = defaultConfig[key];
        }
    }

    // Merge nested messages
    if (window.UI5ErrorConfig && window.UI5ErrorConfig.messages) {
        for (var msgKey in defaultConfig.messages) {
            if (config.messages[msgKey] === undefined) {
                config.messages[msgKey] = defaultConfig.messages[msgKey];
            }
        }
    }

    /**
     * Logger (conditional)
     */
    function log(message, isError) {
        if (config.debug || isError) {
            var method = isError ? 'error' : 'log';
            console[method]('[UI5Error] ' + message);
        }
    }

    var bootstrapScript = document.getElementById(config.bootstrapScriptId);
    if (!bootstrapScript) {
        log('Bootstrap script not found (#' + config.bootstrapScriptId + ')', true);
        return;
    }

    // Timeout fallback: if UI5 hasn't loaded after timeout, show error
    var loadTimeout = setTimeout(function() {
        if (typeof sap === 'undefined') {
            onLoadError(config.messages.timeout + ' (' + (config.loadTimeoutMs / 1000) + 's)');
        }
    }, config.loadTimeoutMs);

    // Script error event
    bootstrapScript.addEventListener('error', function() {
        clearTimeout(loadTimeout);
        onLoadError(config.messages.networkError);
    });

    // Script load success
    bootstrapScript.addEventListener('load', function() {
        clearTimeout(loadTimeout);
        log('SAPUI5 script loaded successfully');
    });

    /**
     * Handle UI5 load failure
     */
    function onLoadError(message) {
        log(message, true);

        // Hide splash screen immediately
        if (window.SplashScreen && window.SplashScreen.hide) {
            window.SplashScreen.hide(0);
        }

        showErrorOverlay({
            title: config.messages.title,
            message: message,
            source: bootstrapScript.src,
            technicalDetails: {
                url: bootstrapScript.src,
                error: message,
                timestamp: new Date().toISOString()
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

        // Build suggestions HTML
        var suggestionsHTML = '';
        if (config.messages.suggestionList && config.messages.suggestionList.length > 0) {
            suggestionsHTML = '<div class="error-suggestions">' +
                '<h3>' + config.messages.suggestions + '</h3>' +
                '<ul>';
            for (var i = 0; i < config.messages.suggestionList.length; i++) {
                suggestionsHTML += '<li>' + config.messages.suggestionList[i] + '</li>';
            }
            suggestionsHTML += '</ul></div>';
        }

        overlay.innerHTML =
            '<div class="error-content">' +
                '<div class="error-icon">⚠️</div>' +
                '<h2>' + errorInfo.title + '</h2>' +
                '<p>' + errorInfo.message + '</p>' +
                '<div class="error-source">' +
                    '<strong>Source:</strong>' +
                    '<code>' + errorInfo.source + '</code>' +
                '</div>' +
                '<div class="error-actions">' +
                    '<button class="btn-primary" onclick="location.reload()">' +
                        config.messages.reloadButton +
                    '</button>' +
                '</div>' +
                '<details class="error-details">' +
                    '<summary>' + config.messages.technicalDetails + '</summary>' +
                    '<pre>' + JSON.stringify(errorInfo.technicalDetails, null, 2) + '</pre>' +
                '</details>' +
                suggestionsHTML +
            '</div>';

        document.body.appendChild(overlay);

        // Fade in animation
        setTimeout(function() {
            overlay.classList.add('show');
        }, 10);

        log('Error overlay displayed');
    }

})();
