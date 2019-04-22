class ClientLoginInteraction {
    constructor(socket, pageConstructor) {
        this.socket = socket;
        this.pageConstructor = pageConstructor;
    }

    startInteraction() {





        // socket.on('connect', () => {
        //
        //     socket.emit('authenticate', token);
        //
        //     socket.on('authenticated', () => {
        //         alert('authenticated');
        //
        //         socket.emit('getTask', 1);
        //     });
        //     socket.on('notAuthenticated', () => {
        //         socket.emit('logIn', login, password);
        //     });
        //     socket.on('loggedIn', (token) => {
        //         localStorage.setItem("jwt34", token);
        //         alert('loggedIn');
        //     });
        //     socket.on('notLoggedIn', (reason) => {
        //         alert(`notLoggedIn:: ${reason}`);
        //     });
        //
        //     socket.on('error', (error) => {
        //         alert(error);
        //     });
        //
        // });











        this.pageConstructor.showForm();
        this.pageConstructor.registerGlobalHandlers(this);
    }

    sendAuthorizationData(login, password) {
        $.ajax({
            method: "POST",
            url: 'http://localhost:3000/login',
            contentType: "application/json",
            data: JSON.stringify({login: login, password: password}),
            //dataType: "JSON",
            success: (data, textStatus, jqXHR) => {
                if (jqXHR.status === ClientUtils.getStatusCodes().ok) {
                    window.location.replace("http://localhost:3000/");
                } else {
                    ClientLoginPageConstructor.showError(textStatus);
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                if (jqXHR.status === ClientUtils.getStatusCodes().forbidden) {
                    window.location.replace("http://localhost:3000/login");
                } else {
                    ClientLoginPageConstructor.showError(errorThrown);
                }
            }
        });
    }
}

