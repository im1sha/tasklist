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

            ClientScriptDownloader.getClientUtilsUrl(),

            ClientScriptDownloader.getEjsUrl(),
        ];
    }

    onStart() {
        ClientLoginCore.getRequiredScriptsUrls().forEach(scriptUrl =>
            ClientScriptDownloader.downloadScript(scriptUrl,
                this.successHandlerForScript,
                ClientLoginCore.errorHandler)
        );

        ClientScriptDownloader.downloadScript(ClientScriptDownloader.getLoginTemplateUrl(),
            this.successHandlerForTemplate,
            ClientLoginCore.errorHandler);
    }

    //
    // Handle responses
    //

    successHandlerForScript(data, textStatus, jqXHR) {
        this.tryRender();
    }

    successHandlerForTemplate(template, textStatus, jqXHR) {
        this.template = template;
        this.tryRender();
    }

    static errorHandler(jqXHR, textStatus, errorThrown) {
        ClientErrorPageRendering.showError(errorThrown);
    }

    tryRender() {
        this.totalLoaded++;
        if (this.totalLoaded === this.expectedFiles) {
            (new ClientLoginInteraction(this.socket, new ClientLoginPageConstructor(this.template))).startInteraction();
        }
    }
}
