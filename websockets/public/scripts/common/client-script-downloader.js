class ClientScriptDownloader{

    //
    // external
    //

    static getSocketIoUrl() { return 'http://localhost:3000/scripts/socket.io.js'; }
    static getEjsUrl() { return 'http://localhost:3000/scripts/ejs.min.js'; }


    //
    // core scripts
    //

    static getClientLoginCoreUrl() {return 'http://localhost:3000/scripts/login/client-login-core.js'; }
    static getClientCoreUrl() { return 'http://localhost:3000/scripts/main/client-core.js'}


    //
    // login scripts
    //

    static getClientLoginPageConstructorUrl() { return 'http://localhost:3000/scripts/login/client-login-page-constructor.js'; }
    static getClientLoginInteractionUrl() { return 'http://localhost:3000/scripts/login/client-login-interaction.js'; }


    //
    // main scripts
    //

    static getClientPageConstructorUrl() { return "http://localhost:3000/scripts/main/client-page-constructor.js"; }
    static getClientInteractionUrl() { return 'http://localhost:3000/scripts/main/client-interaction.js'; }
    static getClientPageStructureUrl() { return 'http://localhost:3000/scripts/main/client-page-structure.js'; }

    //
    // other
    //

    static getClientUtilsUrl() { return 'http://localhost:3000/scripts/common/client-utils.js'; }
    static getStorageWorkerUrl() { return 'http://localhost:3000/scripts/common/client-storage-worker.js'; }


    //
    // templates
    //

    static getLoginTemplateUrl() { return "http://localhost:3000/views/login.ejs"; }
    static getTaskTemplateUrl() { return "http://localhost:3000/views/task.ejs"; }
    static getIndexTemplateUrl() {return "http://localhost:3000/views/index.ejs"}

    //
    //
    //

    //
    static downloadScript(url, successHandler, successHandlerParams, errorHandler, errorHandlerParams) {
        $.ajax({
            method: "GET",
            url: url,
            success: (data, textStatus, jqXHR) => {
                successHandler(data, textStatus, jqXHR, successHandlerParams);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                errorHandler(jqXHR, textStatus, errorThrown, errorHandlerParams);
            }
        })
    }
}