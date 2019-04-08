class ClientLoginInteraction {
    constructor(pageConstructor) {
        this.pageConstructor = pageConstructor;
    }

    startInteraction() {
        this.pageConstructor.showForm();
        this.pageConstructor.registerGlobalHandlers(this);
    }

    sendAuthorizationData(login, password) {
        $.ajax({
            method: "POST",
            url: 'http://localhost:3000/login',
            contentType: "application/json",
            data: JSON.stringify({login: login, password: password}),
            dataType: "JSON",
            success: (data, textStatus, jqXHR) => {
                if (jqXHR.status === ClientUtils.getStatusCodes().ok) {
                    window.location.replace("http://localhost:3000/");
                } else {
                    this.pageConstructor.showError(textStatus);
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                this.pageConstructor.showError(errorThrown);
            }
        });
    }
}

