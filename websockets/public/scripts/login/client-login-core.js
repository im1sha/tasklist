class ClientLoginCore {

    constructor() {
        this.totalLoaded = 0;
        this.expectedFiles = ClientLoginCore.getRequiredScriptsUrls().length + 1;
    }

    //
    // Urls
    //

    static getTemplateUrl() { return "http://localhost:3000/views/login.ejs"; }

    static getPageConstructorUrl() { return 'http://localhost:3000/scripts/login/client-login-page-constructor.js'; }
    static getInteractionUrl() { return 'http://localhost:3000/scripts/login/client-login-interaction.js'; }
    static getEjsUrl() { return 'http://localhost:3000/scripts/ejs.min.js'; }
    static getUtils() { return 'http://localhost:3000/scripts/client-utils.js'; }
    static getSocketUrl() { return 'http://localhost:3000/scripts/socket.io.js'; }
    static getRequiredScriptsUrls() {
        return [
            ClientLoginCore.getPageConstructorUrl(),
            ClientLoginCore.getInteractionUrl(),
            ClientLoginCore.getUtils(),
            ClientLoginCore.getEjsUrl(),
            ClientLoginCore.getSocketUrl(),
        ];
    }

    //
    // Starts interaction
    //

    onStart() {

        ClientLoginCore.getRequiredScriptsUrls().forEach(scriptUrl =>
            $.ajax({
                method: "GET",
                url: scriptUrl,
                success: (data, textStatus, jqXHR) => {
                    this.successHandlerForScript(data, textStatus, jqXHR);
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    ClientLoginCore.errorHandler(jqXHR, textStatus, errorThrown);
                }
            })
        );

        $.ajax({
            method: "GET",
            url: ClientLoginCore.getTemplateUrl(),
            success: (data, textStatus, jqXHR) => {
                this.successHandlerForTemplate(data, textStatus, jqXHR);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                ClientLoginCore.errorHandler(jqXHR, textStatus, errorThrown);
            }
        });

    }

    //
    // Handle GET response
    //

    successHandlerForScript(data, textStatus, jqXHR) {
        this.tryRender();
    }

    successHandlerForTemplate(template, textStatus, jqXHR) {
        this.template = template;
        this.tryRender();
    }

    static errorHandler(jqXHR, textStatus, errorThrown) {
        ClientLoginPageConstructor.showError(errorThrown);
    }

    //
    //
    //

    tryRender() {
        this.totalLoaded++;
        if (this.totalLoaded === this.expectedFiles) {
            (new ClientLoginInteraction(new ClientLoginPageConstructor(this.template))).startInteraction();
        }
    }
}
