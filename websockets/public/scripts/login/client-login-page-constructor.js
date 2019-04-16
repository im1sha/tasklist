class ClientLoginPageConstructor{

    constructor(template) {
        this.template = template;
    }

    registerGlobalHandlers(interactionInstance) {

        $("form").submit(event => {
            event.preventDefault();
            const login = $('#login').val();
            const password = $('#password').val();
            interactionInstance.sendAuthorizationData(login, password);
        });
    }

    static showError(errorThrown) {
        $('body').html(errorThrown);
    }

    showForm() {
        $('body').html(ejs.render(this.template, { }));
    }
}