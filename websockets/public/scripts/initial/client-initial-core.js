class ClientInitialCore {

    constructor() {
        this.requiredScripts = ClientInitialCore.getRequiredScriptsUrls().length;
        this.totalLoaded = 0;
    }

    static getRequiredScriptsUrls() {
        return [
            ClientScriptDownloader.getClientCoreUrl(),
            ClientScriptDownloader.getClientLoginCoreUrl(),
            ClientScriptDownloader.getSocketIoUrl(),
            ClientScriptDownloader.getStorageWorkerUrl(),
        ];
    }

    onStart() {
        ClientInitialCore.getRequiredScriptsUrls().forEach(scriptUrl =>
            ClientScriptDownloader.downloadScript(scriptUrl,
                this.successHandlerForScript,
                ClientLoginCore.errorHandler)
        );
    }

    successHandlerForScript(data, textStatus, jqXHR) {
        this.start();
    }

    static errorHandler(jqXHR, textStatus, errorThrown) {
        ClientErrorPageRendering.showError(errorThrown);
    }

    start() {

        if (this.requiredScripts > ++this.totalLoaded) {
            return;
        }

        const socket = io.connect('http://localhost:3000');

        socket.on('connect', () => {

            socket.emit('authenticate', ClientStorageWorker.getToken());

            socket.on('authenticated', () => {
                (new ClientCore(socket)).onStart();
            });

            socket.on('notAuthenticated', () => {
                (new ClientLoginCore(socket)).onStart();
            });
        });
    }
}



