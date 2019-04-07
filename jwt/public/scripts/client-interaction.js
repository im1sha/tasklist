///
/// class that
///     gets data from server;
///     sends data to server;
///     calls page elements to update;
///

class ClientInteraction {

    constructor(pageConstructor) {
        this.pageConstructor = pageConstructor;
        this.filters = ClientPageStructure.getFilters();
    }

    startInteraction() {
        this.loadTable(ClientPageStructure.getDefaultFilters());
        this.pageConstructor.registerGlobalHandlers(this);
    }

    static getFilteredTasksPath(allFilters, requiredFilters) {

        // required format /api/tasks/?completeness=incomplete&date=expired

        let path = "http://localhost:3000/api/tasks";
        let appliedFilters = 0;

        switch(requiredFilters.completeness) {
            case allFilters.completeness.completed:
                path += '/?completeness=completed';
                appliedFilters++;
                break;
            case allFilters.completeness.incomplete:
                path += '/?completeness=incomplete';
                appliedFilters++;
                break;
        }
        switch(requiredFilters.date) {
            case allFilters.date.expired:
                if (appliedFilters !== 0) {
                    path += '&date=expired';
                } else {
                    path += '/?date=expired';
                }
                break;
            case allFilters.date.upcoming:
                if (appliedFilters !== 0) {
                    path += '&date=upcoming';
                } else {
                    path += '/?date=upcoming';
                }
                break;
        }
        return path;
    }

    //
    // createTask() finalization
    //

    addTaskToTable(id) {
        const thisInstance = this;
        const pageConstructor = this.pageConstructor;
        $.ajax({
            method: "GET",
            url: "http://localhost:3000/api/tasks/" + String(id),
            dataType: 'JSON',
            success: (data, textStatus, jqXHR) => {
                if (jqXHR.status ===  ClientUtils.getStatusCodes().ok) {
                    pageConstructor.addTaskToTable(data);
                    ClientPageConstructor.registerTableHandlers(thisInstance);
                } else {
                    pageConstructor.showError(jqXHR.statusText);
                }
            },
            error:(jqXHR, textStatus, errorThrown) => {
                pageConstructor.showError(jqXHR.statusText);
            },
        });
    }


    //
    // working with main form
    // empty form and update table
    //

    createTask() {
        const thisInstance = this;
        const pageConstructor = this.pageConstructor;
        const formData = pageConstructor.getMainFormData();

        // posts multipart/form-data content
        $.ajax({
            method: "POST",
            url: "http://localhost:3000/api/tasks",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            dataType: 'JSON',
            success: (data, textStatus, jqXHR) => {
                if (jqXHR.status === ClientUtils.getStatusCodes().created) {
                    pageConstructor.renderForm(true);
                    thisInstance.addTaskToTable(JSON.parse(data));
                } else {
                    pageConstructor.showError(jqXHR.statusText);
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                pageConstructor.showError(jqXHR.statusText);
            },
        });
    }

    editTask() {
        const thisInstance = this;
        const pageConstructor = this.pageConstructor;
        const id = pageConstructor.getMainFormId();
        const formData = pageConstructor.getMainFormData();

        // puts multipart/form-data content
        $.ajax({
            method: "PUT",
            url: "http://localhost:3000/api/tasks/" + String(id),
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            dataType: 'JSON',
            success: (data, textStatus, jqXHR) => {
                if (jqXHR.status ===  ClientUtils.getStatusCodes().successNoContent) {
                    pageConstructor.renderForm(true);
                    thisInstance.loadTable(ClientPageConstructor.getFilters(thisInstance));
                } else {
                    pageConstructor.showError(jqXHR.statusText);
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                pageConstructor.showError(jqXHR.statusText);
            },
        });
    }

    //
    // working with table
    //

    // gets task and updates main form
    requestEdit(id) {
        const pageConstructor = this.pageConstructor;

        $.ajax({
            method: "GET",
            url: "http://localhost:3000/api/tasks/" + String(id),
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

    deleteTask(id) {
        const pageConstructor = this.pageConstructor;

        $.ajax({
            method: "DELETE",
            url: "http://localhost:3000/api/tasks/" + String(id),
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

    downloadAttachment(id) {
        const pageConstructor = this.pageConstructor;

        $.ajax({
            method: "GET",
            url: "http://localhost:3000/api/attachments/" + String(id),
            success: (data, textStatus, jqXHR) => {
                if (jqXHR.status !==  ClientUtils.getStatusCodes().ok) {
                    pageConstructor.showError("+"+jqXHR.statusText);
                } else {
                    window.location = 'http://localhost:3000/api/attachments/' + String(id);
                }
            },
            error:(jqXHR, textStatus, errorThrown) => {
                pageConstructor.showError(jqXHR.statusText);
            },
        });
    }

    completeTask(id) {
        const pageConstructor = this.pageConstructor;

        $.ajax({
            method: "PATCH",
            url: "http://localhost:3000/api/tasks/" + String(id),
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

    loadTable(filters) {
        const pageConstructor = this.pageConstructor;
        const thisInstance = this;
        $.ajax({
            method: "GET",
            url: ClientInteraction.getFilteredTasksPath(this.filters, filters),
            dataType: 'JSON',
            success: function (data, textStatus, jqXHR) {
                if (jqXHR.status ===  ClientUtils.getStatusCodes().ok) {
                    pageConstructor.renderTable(data);
                    ClientPageConstructor.registerTableHandlers(thisInstance)
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



