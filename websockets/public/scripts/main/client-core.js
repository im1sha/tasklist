class ClientCore {

    constructor(socket) {
        this.socket = socket;
        this.totalLoaded = 0;
        this.expectedFiles = ClientCore.getRequiredScriptsUrls().length + 2; // 2 templates
    }

    static getRequiredScriptsUrls() {
        return [
            ClientScriptDownloader.getEjsUrl(),
            ClientScriptDownloader.getClientUtilsUrl(),
            ClientScriptDownloader.getClientPageConstructorUrl(),
            ClientScriptDownloader.getClientInteractionUrl(),
            ClientScriptDownloader.getClientPageStructureUrl(),
        ];
    }

    onStart() {

        // get scripts
        ClientCore.getRequiredScriptsUrls().forEach(scriptUrl =>
            ClientScriptDownloader.downloadScript(scriptUrl,
                ClientCore.tryRender, this,
                ClientErrorPageRendering.showError, null)
        );

        // get templates
        ClientScriptDownloader.downloadScript(ClientScriptDownloader.getIndexTemplateUrl(),
            ClientCore.successHandlerForIndexTemplate, this,
            ClientErrorPageRendering.showError, null);
        ClientScriptDownloader.downloadScript(ClientScriptDownloader.getTaskTemplateUrl(),
            ClientCore.successHandlerForTaskTemplate, this,
            ClientErrorPageRendering.showError, null);
    }

    //
    // Handle GET response
    //

    // should take
    //   this as additionalParams
    static successHandlerForTaskTemplate(template, textStatus, jqXHR, additionalParams) {
        additionalParams.indexTemplate = template;
        ClientCore.tryRender(null, null, null, additionalParams);
    }
    static successHandlerForIndexTemplate(template, textStatus, jqXHR, additionalParams) {
        additionalParams.taskTemplate = template;
        ClientCore.tryRender(null, null, null, additionalParams);
    }

    //
    //
    //
    // successHandlerParams === ClientCore instance
    // successHandler(data, textStatus, jqXHR, successHandlerParams);
    static tryRender(arg0, arg1, arg2, additionalParams) {
        additionalParams.totalLoaded++;
        if (additionalParams.totalLoaded === additionalParams.expectedFiles) {
            (new ClientInteraction(additionalParams.socket,
                new ClientPageConstructor(additionalParams.indexTemplate,
                    additionalParams.taskTemplate))).startInteraction();
        }
    }
}




