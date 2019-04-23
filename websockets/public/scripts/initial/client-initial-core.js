class ClientInitialCore {

    constructor() {
        this.requiredScripts = ClientInitialCore.getRequiredScriptsUrls().length;
        this.totalLoaded = 0;
    }

    static getRequiredScriptsUrls() {
        return [
            ClientScriptDownloader.getClientCoreUrl(),
            ClientScriptDownloader.getSocketIoUrl(),
            ClientScriptDownloader.getStorageWorkerUrl(),
            ClientScriptDownloader.getClientLoginCoreUrl(),
        ];
    }

    onStart() {
        ClientInitialCore.getRequiredScriptsUrls().forEach(scriptUrl =>
            ClientScriptDownloader.downloadScript(scriptUrl,
                this.start,
                this,
                ClientErrorPageRendering.showError,
                null
            )
        );
    }

    //successHandlerParams is ClientInitialCore instance
    start(data, textStatus, jqXHR, successHandlerParams) {

        if (successHandlerParams.requiredScripts > ++successHandlerParams.totalLoaded) {
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



