class ClientScriptDownloader{

    //
    // external
    //

    static getSocketIoUrl() { return 'http://localhost:3000/scripts/socket.io.js'; }
    static getEjsUrl() { return 'http://localhost:3000/scripts/ejs.min.js'; }

    //
    // login scripts
    //

    static getClientLoginPageConstructorUrl() { return 'http://localhost:3000/scripts/login/client-login-page-constructor.js'; }
    static getClientLoginInteractionUrl() { return 'http://localhost:3000/scripts/login/client-login-interaction.js'; }

    //
    // core scripts
    //
    static getClientLoginCoreUrl() {return 'http://localhost:3000/scripts/login/client-login-core.js'; }
    static getClientCoreUrl() { return 'http://localhost:3000/scripts/main/client-core.js'}

    //
    // other
    //

    static getClientUtilsUrl() { return 'http://localhost:3000/scripts/client-utils.js'; }

    //
    // templates
    //

    static getLoginTemplateUrl() { return "http://localhost:3000/views/login.ejs"; }

    //
    //
    //

    static downloadScript(url, successHandler, errorHandler) {
        $.ajax({
            method: "GET",
            url: url,
            success: (data, textStatus, jqXHR) => {
                successHandler(data, textStatus, jqXHR);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                errorHandler(jqXHR, textStatus, errorThrown);
            }
        })
    }
}