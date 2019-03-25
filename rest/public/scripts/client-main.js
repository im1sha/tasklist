
let taskTemplate = '';

$(document).ready(function() {

    // todo implement as GET
    $.ajax({
        url: ClientPageConstructor.getTaskTemplateUrl(),
        async: false,
        success: function (data) {
            taskTemplate = data;
            ClientPageConstructor.renderTable();
        }
    });

    //todo: move to static method
    // $("form").submit(function (e) {
    //     e.preventDefault();
    //     const id = this.elements["id"].value;
    //     const name = this.elements["name"].value;
    //     const age = this.elements["age"].value;
    //     if (id === 0)
    //         CreateUser(name, age);
    //     else
    //         EditUser(id, name, age);
    // });
    // // click on edit
    // $("body").on("click", ".editLink",  () => {
    //     const id = $(this).data("id");
    //     GetUser(id);
    // });
    // $("body").on("click", ".removeLink", () => {
    //     const id = $(this).data("id");
    //     DeleteUser(id);
    // });
});



