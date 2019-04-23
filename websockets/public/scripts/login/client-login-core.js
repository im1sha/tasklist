class ClientLoginCore {

    constructor(socket) {
        this.socket = socket;
        this.totalLoaded = 0;
        this.expectedFiles = ClientLoginCore.getRequiredScriptsUrls().length + 1; // 1 is rendering template
    }

    static getRequiredScriptsUrls() {
        return [
            ClientScriptDownloader.getClientLoginPageConstructorUrl(),
            ClientScriptDownloader.getClientLoginInteractionUrl(),
            ClientScriptDownloader.getEjsUrl(),
        ];
    }

    onStart() {
        ClientLoginCore.getRequiredScriptsUrls().forEach(scriptUrl =>
            ClientScriptDownloader.downloadScript(
                scriptUrl,
                ClientLoginCore.tryRender,
                this,
                ClientErrorPageRendering.showError,
                null
            )
        );

        ClientScriptDownloader.downloadScript(ClientScriptDownloader.getLoginTemplateUrl(),
            ClientLoginCore.successHandlerForTemplate, this,
            ClientErrorPageRendering.showError, null);
    }

    //successHandler(data, textStatus, jqXHR, successHandlerParams); // of client-script-downloader
    //successHandlerParams === this
    static successHandlerForTemplate(data, textStatus, jqXHR, successHandlerParams) {
        successHandlerParams.template = data;
        ClientLoginCore.tryRender(null, null, null, successHandlerParams);
    }

    static tryRender(arg0, arg1, arg2, additionalParams) {
        additionalParams.totalLoaded++;
        if (additionalParams.totalLoaded === additionalParams.expectedFiles) {
            (new ClientLoginInteraction(additionalParams.socket,
                new ClientLoginPageConstructor(additionalParams.template))).startInteraction();
        }
    }
}
