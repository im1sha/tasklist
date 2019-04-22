class ClientCore {

    constructor(socket) {
        this.socket = socket;
        this.totalLoaded = 0;
        this.expectedFiles = ClientCore.getRequiredScriptsUrls().length +    2;
    }

    static getRequiredScriptsUrls() {
        return [
            ClientScriptDownloader.getEjsUrl(),
            ClientScriptDownloader.getClientUtilsUrl(),
            ClientScriptDownloader.getClientLoginPageConstructorUrl(),
            ClientScriptDownloader.getClientInteractionUrl(),
            ClientScriptDownloader.getClientPageStructureUrl(),
        ];
    }

    onStart() {

        // get scripts
        ClientCore.getRequiredScriptsUrls().forEach(scriptUrl =>
            ClientScriptDownloader.downloadScript(scriptUrl,
                this.successHandlerForScript,
                ClientCore.errorHandler)
        );

        // get templates
        ClientScriptDownloader.downloadScript(ClientScriptDownloader.getIndexTemplateUrl(),
            this.successHandlerForIndexTemplate,
            ClientCore.errorHandler);
        ClientScriptDownloader.downloadScript(ClientScriptDownloader.getTaskTemplateUrl(),
            this.successHandlerForTaskTemplate,
            ClientCore.errorHandler);
    }

    //
    // Handle GET response
    //

    successHandlerForScript(data, textStatus, jqXHR) {
        this.tryRender();
    }

    successHandlerForTaskTemplate(template, textStatus, jqXHR) {
        this.indexTemplate = template;
        this.tryRender();
    }
    successHandlerForIndexTemplate(template, textStatus, jqXHR) {
        this.taskTemplate = template;
        this.tryRender();
    }

    static errorHandler(jqXHR, textStatus, errorThrown) {
        ClientErrorPageRendering.showError(errorThrown);
    }

    //
    //
    //

    tryRender() {
        this.totalLoaded++;
        if (this.totalLoaded === this.expectedFiles) {
            (new ClientInteraction(this.socket,
                new ClientPageConstructor(this.indexTemplate, this.taskTemplate))).startInteraction();
        }
    }
}




