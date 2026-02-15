/**
 * Component.ts - Splash Screen integráció
 *
 * Ez a fájl a TELJES Component.ts-t tartalmazza a splash screen módosításokkal.
 * A módosított sorok "// SPLASH" kommenttel vannak jelölve.
 *
 * Módosítások:
 *   1. initCompany().then() → SplashScreen.hide() hívás hozzáadva
 *   2. initCompany().catch() → SplashScreen.hide(0) hívás hozzáadva (hiba esetén azonnal)
 *
 * FONTOS: Nem kell TypeScript importot hozzáadni!
 * A SplashScreen a window objektumon keresztül érhető el (plain JS, nem UI5 modul).
 */

// ... (meglévő importok változatlanul) ...

export default class Component extends BaseComponent {

    // ... (meglévő property-k változatlanul) ...

    public static metadata = {
        manifest: "json"
    };

    private restService: RestService
    /**
     * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
     * @public
     * @override
     */
    public init(): void {

        this.restService = new RestService({
            baseUrl: "/b1s/v2",
            urlParameters: {}
        });

        // call the base component's init function
        super.init();

        (Component as any).getMainComponent = () => {
            return this;
        };

        this._i18nBundle = (this.getModel("i18n") as ResourceModel).getResourceBundle();

        this.getDeviceSettings();

        this.initCompany().then( oUser => {

            // SPLASH: Sikeres inicializáció → splash screen elrejtése
            if ((window as any).SplashScreen) {
                (window as any).SplashScreen.hide();
            }

            this.getRouter().initialize();

        }).catch((err: any) => {

            // SPLASH: Hiba esetén is el kell rejteni (delay nélkül)
            if ((window as any).SplashScreen) {
                (window as any).SplashScreen.hide(0);
            }

            MessageBox.error(err.message);
        });
    }

    // ... (a Component.ts többi része változatlanul) ...
}
