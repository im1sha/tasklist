class ClientPageConstructor {

    constructor(template) {
        this.template = template;
        this.maxDisplayedLength = 25;
        this.decorationChar = String.fromCharCode(9679);
        this.styles = ClientPageStructure.getStyles();
        this.checkboxesStyles = ClientPageStructure.getCheckboxesStyles();
        this.filters = ClientPageStructure.getFilters();
        this.entryStyles = ClientPageStructure.getEntryStyles();
        this.taskStatuses = ClientPageStructure.getTaskStatuses();
    }

    showError(errorThrown) {
        $('#body').html(errorThrown);
    }

    // fills table with tasks
    renderTable(jsonData) {

        //let row = ejs.render( taskTemplate , ????);
    }

    renderForm(isEmpty, jsonData = null) {

    }

    deleteTaskFromTable(id) {

    }

    completeTaskAtTable(id) {

    }

    changeTaskAtTable(multipartFormData) {

    }

    addTaskToTable(multipartFormData) {

    }


    // onEdit() {
    //         checkboxValues = editCheckboxStyles;
    //
    //         placeholders = {
    //             isMainFormEdited: "true",
    //             mainFormTaskId: mainFormTaskNumber.toString(),
    //             taskNameBackValue: task[tasksProperties.taskName],
    //             taskNameValue: task[tasksProperties.taskName],
    //             taskDateValue: Utils.createDateInStandardFormat(task.taskDateValue), // CORRECT
    //         };
    // }
    //
    // createTaskEntry(task) {
    //     return {
    //         taskId: task[tasksProperties.taskId],
    //         taskName: task[tasksProperties.taskName],
    //         taskDate: Utils.formatDateForOutput(task[tasksProperties.taskDate]),
    //         taskDateValue: task[tasksProperties.taskDate],
    //         taskAttachmentFileName: task[tasksProperties.taskAttachmentFileName],
    //         taskDisplayedName: task[tasksProperties.taskName].substr(0, MAX_DISPLAYED_LENGTH),
    //         taskAttachmentFileDisplayedName: task[tasksProperties.taskAttachmentFileName].substr(0, MAX_DISPLAYED_LENGTH),
    //         taskCompletedAsString: task[tasksProperties.taskCompleted]
    //             ? taskStatuses.completed
    //             : taskStatuses.incomplete,
    //         entryStyle:task[tasksProperties.taskExpired] === true
    //             ? entryStyles.expiredEntryStyle
    //             : entryStyles.defaultStyle,
    //         completeButtonStyle: task[tasksProperties.taskCompleted] === true
    //             ? styles.disabled
    //             : styles.empty,
    //         downloadButtonStyle: task[tasksProperties.taskAttachmentExists] !== true
    //             ? styles.disabled
    //             : styles.empty,
    //     };
    // }
}


