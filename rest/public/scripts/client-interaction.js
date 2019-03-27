class ClientInteraction {

    constructor(pageConstructor) {
        this.pageConstructor = pageConstructor;
        this.filters = ClientPageStructure.getFilters();
    }

    startInteraction() {
        this.renderTable(ClientPageStructure.getDefaultFilters());
        this.registerHandlers(this);
    }

    registerHandlers(thisInstance) {
        $("form").submit(event => {
            event.preventDefault(event);

            if ($("[name='taskId'], [type='hidden']").attr('value') === '-1') {
                thisInstance.createTask();
            } else {
                thisInstance.updateTask();
            }
        });

        // filters
        $("input, [type='radio']").click(function() {

            let usedFilters = ClientPageStructure.getDefaultFilters();

            if (this.filters.completenessFilter === this.getAttribute('name')) {
                switch (this.getAttribute('value')) {
                    case this.filters.completeness.completed:
                        usedFilters.completeness
                            = this.filters.completeness.completed;
                        break;
                    case this.filters.completeness.incomplete:
                        usedFilters.completeness
                            = this.filters.completeness.incomplete;
                        break;
                    default:
                        break;
                }
            } else {
                switch (this.getAttribute('value')) {
                    case this.filters.date.expired:
                        usedFilters.date
                            = this.filters.date.expired;
                        break;
                    case this.filters.date.upcoming:
                        usedFilters.date
                            = this.filters.date.upcoming;
                        break;
                    default:
                        break;
                }
            }

            thisInstance.renderTable(usedFilters);
        });

        // working with task
        $("td button").click(function() {
            const id = this.getAttribute("data-id");

            switch (this.getAttribute('value')) {
                case 'complete':
                    thisInstance.completeTask(id);
                    break;
                case 'download':
                    thisInstance.downloadAttachment(id);
                    break;
                case 'edit':
                    thisInstance.renderMainForm(id);
                    break;
                case 'remove':
                    thisInstance.deleteTask(id);
                    break;
            }
        });
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

    // gets tasks and updates table
    renderTable(filters) {
        const pageConstructor = this.pageConstructor;
        $.ajax({
            method: "GET",
            url: ClientInteraction.getFilteredTasksPath(this.filters, filters),
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

    // deletes task from table
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

    // empties form and updates table
    createTask() {
        const pageConstructor = this.pageConstructor;
        const formData = new FormData($('form')[0]);

        // posts multipart/form-data content
        $.ajax({
            method: "POST",
            url: "http://localhost:3000/api/tasks",
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
    updateTask() {
        const pageConstructor = this.pageConstructor;
        const formData = new FormData($('form')[0]);

        // puts multipart/form-data content
        $.ajax({
            method: "PUT",
            url: "http://localhost:3000/api/tasks/" + String(id),
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

    downloadAttachment(id) {
        const pageConstructor = this.pageConstructor;

        $.ajax({
            method: "GET",
            url: "http://localhost:3000/api/attachments/" + String(id),
            success: (data, textStatus, jqXHR) => {
                if (jqXHR.status !==  ClientUtils.getStatusCodes().ok) {
                    pageConstructor.showError(jqXHR.statusText);
                }
            },
            error:(jqXHR, textStatus, errorThrown) => {
                pageConstructor.showError(jqXHR.statusText);
            },
        });
    }
}



