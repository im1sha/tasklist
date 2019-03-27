class ClientCore {

    constructor() {
        this.totalLoaded = 0;
        this.expectedFiles = ClientCore.getRequiredScriptsUrls().length + 1;
    }

    //
    // Urls
    //

    static getTaskTemplateUrl() { return "http://localhost:3000/views/task.ejs"; }

    static getConstructorUrl() { return "http://localhost:3000/scripts/client-page-constructor.js"; }
    static getEjsUrl() { return 'http://localhost:3000/scripts/ejs.min.js'; }
    static getUtilsUrl() { return 'http://localhost:3000/scripts/client-utils.js'; }
    static getInteractionUrl() { return 'http://localhost:3000/scripts/client-interaction.js'; }
    static getPageStructureUrl() { return 'http://localhost:3000/scripts/client-page-structure.js'; }
    static getRequiredScriptsUrls(){
        return [ ClientCore.getEjsUrl(),
            ClientCore.getUtilsUrl(),
            ClientCore.getConstructorUrl(),
            ClientCore.getInteractionUrl(),
            ClientCore.getPageStructureUrl(),];
    }

    //
    // Starts interaction
    //

    onStart() {

        ClientCore.getRequiredScriptsUrls().forEach(scriptUrl =>
            $.ajax({
                method: "GET",
                url: scriptUrl,
                success: (data, textStatus, jqXHR) => {
                    this.successHandlerForScript(data, textStatus, jqXHR);
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    ClientCore.errorHandler(jqXHR, textStatus, errorThrown);
                }
            })
        );

        $.ajax({
            method: "GET",
            url: ClientCore.getTaskTemplateUrl(),
            success: (data, textStatus, jqXHR) => {
                this.successHandlerForTemplate(data, textStatus, jqXHR);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                ClientCore.errorHandler(jqXHR, textStatus, errorThrown);
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
        this.tryRender(template);
    }

    static errorHandler(jqXHR, textStatus, errorThrown) {
        ClientPageConstructor.showError(errorThrown);
    }

    //
    //
    //

    tryRender(template) {
        this.totalLoaded++;
        if (this.totalLoaded === this.expectedFiles) {
            (new ClientInteraction(new ClientPageConstructor(template))).startInteraction();
        }
    }
}




