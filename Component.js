sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("myapp.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // Set data model
            var oData = {
                message: "UI5 Application betöltve!"
            };
            var oModel = new JSONModel(oData);
            this.setModel(oModel);
        }
    });
});
