class ClientPageConstructor {

    constructor(indexTemplate, taskTemplate) {

        this.taskTemplate = taskTemplate;
        this.indexTemplate = indexTemplate;

        this.maxDisplayedLength = 25;

        this.decorationChar = String.fromCharCode(9679);

        this.styles = ClientPageStructure.getStyles();
        this.filters = ClientPageStructure.getFilters();
        this.entryStyles = ClientPageStructure.getEntryStyles();
        this.taskStatuses = ClientPageStructure.getTaskStatuses();

        this.staticPlaceholders = ClientPageStructure.getStaticPlaceholders();
        this.radiosPlaceholdersNames = ClientPageStructure.getRadiosPlaceholdersNames();
    }

    //
    // click handlers
    //

    registerGlobalHandlers(interactionInstance) {

        $(':reset').click(event => {

            if ($("[name='taskId'],[type='hidden']").attr('value') !== '-1') {
                event.preventDefault();

                interactionInstance.requestEdit($("[name='taskId'],[type='hidden']").attr('value'));
            }
        });

        $("form").submit(event => {
            event.preventDefault();

            if ($("[name='taskId'],[type='hidden']").attr('value') === '-1') {
                interactionInstance.createTask();
            } else {
                interactionInstance.editTask();
            }
        });

        // filters
        $("td input, [type='radio']").click(function(event) {

            interactionInstance.loadTable(ClientPageConstructor.getFilters(interactionInstance));
        });

        $("[name='logout']").click(function(event) {

            interactionInstance.logOut();
        });
    }

    static getFilters(interactionInstance) {
        let usedFilters = ClientPageStructure.getDefaultFilters();

        if ($('[value="incomplete"][name="completeness"]').is(':checked')) {
            usedFilters.completeness = interactionInstance.filters.completeness.incomplete;
        }
        if ($('[value="completed"][name="completeness"]').is(':checked')) {
            usedFilters.completeness = interactionInstance.filters.completeness.completed;
        }
        if ($('[value="upcoming"][name="date"]').is(':checked')) {
            usedFilters.date = interactionInstance.filters.date.upcoming;
        }
        if ($('[value="expired"][name="date"]').is(':checked')) {
            usedFilters.date = interactionInstance.filters.date.expired;
        }

        return usedFilters;
    }

    static registerTableHandlers(interactionInstance){

        // working with task
        $("td input").click(function() {

            const id = this.getAttribute("data-id");

            switch (this.getAttribute('value')) {
                case 'complete':
                    interactionInstance.completeTask(id);
                    break;
                case 'download':
                    interactionInstance.downloadAttachment(id);
                    break;
                case 'edit':
                    interactionInstance.requestEdit(id);
                    break;
                case 'remove':
                    interactionInstance.deleteTask(id);
                    break;
            }
        });
    }

    static registerNewTaskHandlers(interactionInstance, taskId){

        // working with task
        $("td input[data-id='"+ taskId +"']").click(function() {

            const id = this.getAttribute("data-id");

            switch (this.getAttribute('value')) {
                case 'complete':
                    interactionInstance.completeTask(id);
                    break;
                case 'download':
                    interactionInstance.downloadAttachment(id);
                    break;
                case 'edit':
                    interactionInstance.requestEdit(id);
                    break;
                case 'remove':
                    interactionInstance.deleteTask(id);
                    break;
            }
        });
    }

    //
    // INDEX
    //

    getPlaceholdersForRadioButtons() {
        let result = {};

        result[this.radiosPlaceholdersNames.completenessAllStyle] = this.styles.checked;
        result[this.radiosPlaceholdersNames.completenessIncompleteStyle] = '';
        result[this.radiosPlaceholdersNames.completenessCompletedStyle] = '';
        result[this.radiosPlaceholdersNames.dateAllStyle] = this.styles.checked;
        result[this.radiosPlaceholdersNames.dateExpiredStyle] = '';
        result[this.radiosPlaceholdersNames.dateUpcomingStyle] = '';

        return result;
    }

    static getIndexPlaceholders(placeholdersForRadioButtons, defaultMainFormPlaceholders,
                    defaultCheckboxesStyles, staticPlaceholders) {
        return {
            ...staticPlaceholders,
            ...defaultCheckboxesStyles,
            ...defaultMainFormPlaceholders,
            ...placeholdersForRadioButtons,
        };
    }


    renderIndex() {
        $('body').html(ejs.render(
            this.indexTemplate,
            ClientPageConstructor.getIndexPlaceholders(
                this.getPlaceholdersForRadioButtons(),
                ClientPageStructure.getDefaultMainFormPlaceholders(),
                ClientPageStructure.getDefaultCheckboxesStyles(),
                this.staticPlaceholders
            )
        ));
    }

    //
    // FORM & TABLE
    //

    getMainFormId(){
        return $('[type="hidden"][name="taskId"]').attr('value'); // mainForm task id
    }

    getMainFormData() {
        return new FormData($('form')[0]);
    }

    // fills table with tasks
    // jsonData is [{}, {}, {} ...]
    renderTable(jsonData) {
        let table = '';
        for (let i = 0; i < jsonData.length; i++) {
            table += ejs.render(this.taskTemplate, this.createTaskEntry(jsonData[i]));
        }
        $('tbody').html(table);
    }

    completeTaskAtTable(id) {
        $("input[value='complete'][data-id='"+String(id)+"']").attr(this.styles.disabled, '');
        $(".displayedAttachmentName[data-id='"+String(id)+"']").text(this.taskStatuses.completed);
        $("tr[data-id='"+String(id)+"']").removeClass('expired');
    }

    deleteTaskFromTable(id) {
        $("tr[data-id='"+String(id)+"']").remove();
    }

    renderForm(isEmpty, jsonData = null) {

        const defaultPlaceholders
            = ClientPageStructure.getDefaultMainFormPlaceholders();

        const placeholders = {
            taskIdValue: isEmpty
                ? defaultPlaceholders.mainFormTaskId
                : jsonData.taskId,
            taskNameValue: isEmpty
                ? defaultPlaceholders.taskNameValue
                : jsonData.taskName,
            taskNamePlaceholder: isEmpty
                ? defaultPlaceholders.taskNameBackValue
                : jsonData.taskName,
            taskDate: isEmpty
                ? defaultPlaceholders.taskDateValue
                : ClientUtils.createDateInStandardFormat(new Date(jsonData.taskDate)),
        };

        $('[name="taskName"]').prop('placeholder', placeholders.taskNamePlaceholder);
        $('[name="taskAttachment"]').prop('value', '');
        $('[name="updateCheckbox"]').prop('checked', false);
        $('[name="completeCheckbox"]').prop('checked', false);

        $(':hidden[name="taskId"]').prop('value', placeholders.taskIdValue);
        $('[name="taskName"]').prop('value', placeholders.taskNameValue);

        $('[name="taskDate"]').prop('value', placeholders.taskDate);

        $('[name="updateCheckbox"]').prop('disabled', isEmpty);
    }

    addTaskToTable(jsonData) {
        $("tbody").append(ejs.render(this.taskTemplate,
            this.createTaskEntry(jsonData)));
    }

    createTaskEntry(task) {
        return {
            idText: this.decorationChar,
            taskId: task.taskId,
            taskName: task.taskName,
            taskDisplayedName: task.taskName.substr(0, this.maxDisplayedLength),
            taskDate: ClientUtils.formatDateForOutput(new Date(task.taskDate)),
            taskDateValue: task.taskDate,
            taskAttachmentFileName: task.taskAttachmentFileName,
            taskAttachmentFileDisplayedName: task.taskAttachmentFileName.substr(0, this.maxDisplayedLength),
            taskCompletedAsString: task.taskCompleted
                ? this.taskStatuses.completed
                : this.taskStatuses.incomplete,
            entryStyle:task.taskExpired === true
                ? this.entryStyles.expiredEntryStyle
                : this.entryStyles.defaultStyle,
            downloadButtonStyle: task.taskAttachmentExists !== true
                ? this.styles.disabled
                : this.styles.empty,
            completeButtonStyle: task.taskCompleted === true
                ? this.styles.disabled
                : this.styles.empty,
        };
    }
}


