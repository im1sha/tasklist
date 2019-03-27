class ClientInteraction {

    constructor(pageConstructor) {
        this.pageConstructor = pageConstructor;
    }

    startInteraction(){
        this.renderTable();
        ClientInteraction.registerHandlers();
    }

    static registerHandlers() {

        $("#mainForm").submit(event => {
            event.preventDefault(event);

            // const id = this.elements["id"].value;

            if ($("[taskId='-1']")  ) {

            } else {

            }
            
            $("[href='default.htm']")

            alert("OGO");
            // todo
            //  handle it
        });

        // $(document).on("click", "*",  () => {
        //     // const id = $(this).data("id");
        //     // GetUser(id);
        // });
        //JSON.stringify

       // $("p").filter(".intro").css("background-color", "yellow");
       // $("tr[data-rowid='" + user.id + "']").remove();
        //$("table tbody").append(row(user));
    }

    // gets tasks and updates table
    renderTable() {
        const pageConstructor = this.pageConstructor;
        $.ajax({
            method: "GET",
            url: "/api/tasks",
            dataType: 'JSON',
            success: function (data, textStatus, jqXHR) {
                if (jqXHR.status ===  ClientUtils.getStatusCodes().ok) {
                    pageConstructor.renderTable(data);
                } else {
                    pageConstructor.showError(jqXHR.statusText);
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                pageConstructor.showError(jqXHR.statusText);
            },
        });
    }

    // gets task and updates main form
    renderMainForm(id) {
        const pageConstructor = this.pageConstructor;

        $.ajax({
            method: "GET",
            url: "api/tasks/" + String(id),
            dataType: 'JSON',
            success: (data, textStatus, jqXHR) => {
                if (jqXHR.status ===  ClientUtils.getStatusCodes().ok) {
                    pageConstructor.renderForm(false, data);
                } else {
                    pageConstructor.showError(jqXHR.statusText);
                }
            },
            error:(jqXHR, textStatus, errorThrown) => {
                pageConstructor.showError(jqXHR.statusText);
            },
        });
    }

    // deletes task from table
    deleteTask(id) {
        const pageConstructor = this.pageConstructor;

        $.ajax({
            method: "DELETE",
            url: "api/tasks/" + String(id),
            dataType: 'JSON',
            success: (data, textStatus, jqXHR) => {
                if (jqXHR.status ===  ClientUtils.getStatusCodes().successNoContent) {
                    pageConstructor.deleteTaskFromTable(id);
                } else {
                    pageConstructor.showError(jqXHR.statusText);
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                pageConstructor.showError(jqXHR.statusText);
            },
        });
    }


    completeTask(id) {
        const pageConstructor = this.pageConstructor;

        $.ajax({
            method: "PATCH",
            url: "api/tasks/" + String(id),
            contentType: "application/json",
            data: JSON.stringify({ taskCompleted: true }),
            dataType: "JSON",
            success: (data, textStatus, jqXHR) => {
                if (jqXHR.status ===  ClientUtils.getStatusCodes().successNoContent) {
                    pageConstructor.completeTaskAtTable(id);
                } else {
                    pageConstructor.showError(jqXHR.statusText);
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                pageConstructor.showError(jqXHR.statusText);
            },
        });
    }

    // empties form and updates table
    createTask() {
        const pageConstructor = this.pageConstructor;

        const formData = new FormData($('form')[0]);

        // posts multipart/form-data content
        $.ajax({
            method: "POST",
            url: "api/tasks",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            dataType: "JSON",
            success: (data, textStatus, jqXHR) => {
                if (jqXHR.status ===  ClientUtils.getStatusCodes().created) {
                    pageConstructor.renderForm(true);
                    pageConstructor.addTaskToTable(formData);
                } else {
                    pageConstructor.showError(jqXHR.statusText);
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                pageConstructor.showError(jqXHR.statusText);
            },
        });
    }

    // empties form and updates table
    updateTask(taskObject) {
        const pageConstructor = this.pageConstructor;

        const formData = new FormData($('form')[0]);

        // puts multipart/form-data content
        $.ajax({
            method: "PUT",
            url: "api/tasks/" + String(id),
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            dataType: "JSON",

            success: (data, textStatus, jqXHR) => {
                if (jqXHR.status ===  ClientUtils.getStatusCodes().successNoContent) {
                    pageConstructor.renderForm(true);
                    pageConstructor.changeTaskAtTable(formData);
                } else {
                    pageConstructor.showError(jqXHR.statusText);
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                pageConstructor.showError(jqXHR.statusText);
            },
        });
    }
}


