sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function(UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("myapp.Component", {

        metadata: {
            manifest: "json"
        },

        /**
         * Component initialization
         * Ez a metódus fut le amikor az app elindul
         */
        init: function() {
            // Call parent init
            UIComponent.prototype.init.apply(this, arguments);

            console.log('[App] Component init started');

            // ========================================
            // SPLASH SCREEN START
            // ========================================
            if (window.SplashScreen) {
                console.log('[App] Starting splash screen...');
                window.SplashScreen.show();
            }

            // ========================================
            // BUSINESS DATA LOADING
            // ========================================
            this.loadApplicationData()
                .then(function(data) {
                    console.log('[App] ✅ All data loaded successfully');
                    console.log('[App] Data:', data);

                    // Set data to model
                    var oModel = new JSONModel(data);
                    this.setModel(oModel, "app");

                    // ========================================
                    // SPLASH SCREEN END
                    // ========================================
                    if (window.SplashScreen) {
                        console.log('[App] Hiding splash screen...');
                        window.SplashScreen.hide(500); // 500ms fade-out
                    }

                }.bind(this))
                .catch(function(error) {
                    console.error('[App] ❌ Data loading failed:', error);

                    // Hide splash even on error
                    if (window.SplashScreen) {
                        window.SplashScreen.hide(0); // Immediate hide
                    }

                    // Show error message to user (optional)
                    if (sap.m.MessageBox) {
                        sap.m.MessageBox.error(
                            "Nem sikerült betölteni az alkalmazás adatait.",
                            { title: "Betöltési Hiba" }
                        );
                    }
                });
        },

        /**
         * Load master data (simulated backend calls)
         * Ez szimulálja a valódi backend hívásokat
         *
         * @returns {Promise} Promise that resolves with all loaded data
         */
        loadApplicationData: function() {
            console.log('[App] Loading application data...');

            return Promise.all([
                this._loadProducts(),
                this._loadCustomers(),
                this._loadOrders(),
                this._loadUserSettings()
            ]).then(function(results) {
                return {
                    products: results[0],
                    customers: results[1],
                    orders: results[2],
                    settings: results[3],
                    message: "UI5 Application betöltve!",
                    loadedAt: new Date().toISOString()
                };
            });
        },

        /**
         * Load products from backend (simulated)
         */
        _loadProducts: function() {
            return this._simulateBackendCall('products', 1000, [
                { id: 1, name: 'Product A', price: 100 },
                { id: 2, name: 'Product B', price: 200 },
                { id: 3, name: 'Product C', price: 300 }
            ]);
        },

        /**
         * Load customers from backend (simulated)
         */
        _loadCustomers: function() {
            return this._simulateBackendCall('customers', 1500, [
                { id: 1, name: 'Customer X', city: 'Budapest' },
                { id: 2, name: 'Customer Y', city: 'Debrecen' }
            ]);
        },

        /**
         * Load orders from backend (simulated)
         */
        _loadOrders: function() {
            return this._simulateBackendCall('orders', 800, [
                { id: 1, customerId: 1, productId: 1, quantity: 5 },
                { id: 2, customerId: 2, productId: 2, quantity: 3 }
            ]);
        },

        /**
         * Load user settings from backend (simulated)
         */
        _loadUserSettings: function() {
            return this._simulateBackendCall('settings', 500, {
                theme: 'sap_horizon',
                language: 'hu',
                dateFormat: 'dd.MM.yyyy'
            });
        },

        /**
         * Simulate backend call with delay
         *
         * @param {string} name - Data type name (for logging)
         * @param {number} delay - Simulated network delay in ms
         * @param {*} data - Data to return
         * @returns {Promise}
         */
        _simulateBackendCall: function(name, delay, data) {
            console.log('[App] Loading ' + name + '... (simulated ' + delay + 'ms delay)');

            return new Promise(function(resolve) {
                setTimeout(function() {
                    console.log('[App] ✅ ' + name + ' loaded');
                    resolve(data);
                }, delay);
            });
        }

    });

});
