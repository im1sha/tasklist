class ClientLoginCore {

    constructor() {
        this.totalLoaded = 0;
        this.expectedFiles = ClientLoginCore.getRequiredScriptsUrls().length + 1;
    }

    //
    // Urls
    //

    static getTemplateUrl() { return "http://localhost:3000/views/login.ejs"; }

    static getPageConstructorUrl() { return 'http://localhost:3000/scripts/login/client-login-page-constructor.js'; }
    static getInteractionUrl() { return 'http://localhost:3000/scripts/login/client-login-interaction.js'; }
    static getEjsUrl() { return 'http://localhost:3000/scripts/ejs.min.js'; }
    static getUtils() { return 'http://localhost:3000/scripts/client-utils.js'; }
    static getSocketIo() { return 'http://localhost:3000/scripts/socket.io.js'; }
    static getRequiredScriptsUrls() {
        return [
            ClientLoginCore.getPageConstructorUrl(),
            ClientLoginCore.getInteractionUrl(),
            ClientLoginCore.getUtils(),
            ClientLoginCore.getEjsUrl(),
            ClientLoginCore.getSocketIo(),
        ];
    }

    //
    // Starts interaction
    //

    onStart() {

        ClientLoginCore.getRequiredScriptsUrls().forEach(scriptUrl =>
            $.ajax({
                method: "GET",
                url: scriptUrl,
                success: (data, textStatus, jqXHR) => {
                    this.successHandlerForScript(data, textStatus, jqXHR);
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    ClientLoginCore.errorHandler(jqXHR, textStatus, errorThrown);
                }
            })
        );

        $.ajax({
            method: "GET",
            url: ClientLoginCore.getTemplateUrl(),
            success: (data, textStatus, jqXHR) => {
                this.successHandlerForTemplate(data, textStatus, jqXHR);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                ClientLoginCore.errorHandler(jqXHR, textStatus, errorThrown);
            }
        });

    }

    //
    // Handle GET response
    //

    successHandlerForScript(data, textStatus, jqXHR) {
        this.tryRender();
    }

    successHandlerForTemplate(template, textStatus, jqXHR) {
        this.template = template;
        this.tryRender();
    }

    static errorHandler(jqXHR, textStatus, errorThrown) {
        ClientLoginPageConstructor.showError(errorThrown);
    }

    //
    //
    //

    tryRender() {
        this.totalLoaded++;
        if (this.totalLoaded === this.expectedFiles) {
            //  (new ClientLoginInteraction(new ClientLoginPageConstructor(this.template))).startInteraction();


            let token = localStorage.getItem("jwt34");

            const socket = io.connect('http://localhost:3000');

            const login = 'qazswed1';
            const password = '1234567';

            socket.on('connect', () => {

                socket.emit('authenticate', token);

                socket.on('authenticated', () => {
                    alert('authenticated');

                    socket.emit('getTask', 1);
                });
                socket.on('notAuthenticated', () => {
                    socket.emit('logIn', login, password);
                });
                socket.on('loggedIn', (token) => {
                    localStorage.setItem("jwt34", token);
                    alert('loggedIn');
                });
                socket.on('notLoggedIn', (reason) => {
                    alert(`notLoggedIn:: ${reason}`);
                });

                socket.on('error', (error) => {
                    alert(error);
                });

            });

        }
    }
}

        // const reader = new FileReader();
        // reader.onload = (e) =>
        // {
        //     socket.emit('createTask',  e.target.result, file.files[0].name, (error) => {
        //         updateTable();
        //     });
        // };


        //
        //
        // socket.on('connect', (data) => {
        //
        //     socket.emit('login', login, password);
        //
        //     socket.on('login', (token) => {
        //
        //     });
        // });


                // socket.on('authenticated', function () {
                //     //do other things
                // })
                //
                //
                // socket.on('login', (token) => {
                //     alert(`${token} `);
                //     socket.emit('authenticate', {token: token});
                // });


                //socket.emit('authenticate', { token: "token" }); //send the jwt

                // socket.on("error", (error) => {
                //     if (error.type === "UnauthorizedError" ||
                //         error.code === "invalid_token") {
                //         // redirect to login page
                //
                //         alert('invalid token')
                //     }
                // });
                //
                // socket.on("unauthorized", (error/*, callback*/) => {
                //     if (error.data.type === "UnauthorizedError" ||
                //         error.data.code === "invalid_token") {
                //         // redirect user to login page perhaps or execute callback:
                //         //callback();
                //         alert("unauthorized");
                //     }
                // });

                //




            //localStorage.setItem("string_a", "value_a");
            //localStorage.getItem("string_a");
            //localStorage.removeItem("string_a");

