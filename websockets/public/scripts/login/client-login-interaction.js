class ClientLoginInteraction {

    constructor(socket, pageConstructor) {
        this.socket = socket;
        this.pageConstructor = pageConstructor;
    }

    startInteraction() {

        this.socket.on('loggedIn', (token) => {
            ClientStorageWorker.setToken(token);
            (new ClientCore(this.socket)).onStart();
        });

        this.socket.on('notLoggedIn', (reason) => {
            alert(`Check credentials: ${reason}`);
        });

        this.pageConstructor.showForm();
        this.pageConstructor.registerGlobalHandlers(this);
    }

    sendAuthorizationData(login, password) {
        this.socket.emit('logIn', login, password);
    }
}

