class ClientPageConstructor {

    constructor(template) {
        this.template = template;
        this.maxDisplayedLength = 25;
        this.decorationChar = String.fromCharCode(9679);
        this.styles = ClientPageStructure.getStyles();
        this.filters = ClientPageStructure.getFilters();
        this.entryStyles = ClientPageStructure.getEntryStyles();
        this.taskStatuses = ClientPageStructure.getTaskStatuses();
    }

    showError(errorThrown) {
        $('#body').html(errorThrown);
    }

    // fills table with tasks
    // jsonData is [{}, {}, {} ...]
    renderTable(jsonData) {
        let table = '';
        for (let i = 0; i < jsonData.length; i++) {
            table += ejs.render(this.template, this.createTaskEntry(jsonData[i]));
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
        $("tbody").append(ejs.render(this.template,
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


