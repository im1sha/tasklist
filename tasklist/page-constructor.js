const Task = require("./task");
const Utils = require('./utils');


const MAX_DISPLAYED_LENGTH = 30;
const NEW_ITEM_INDEX = Task.getNewItemIndex();

const styles = {
    checked: 'checked',
    empty: '',
    disabled: 'disabled',
};

// fields transferred by post method
const inputFields = {
    isMainFormEdited : 'isMainFormEdited',
    isMainForm : 'isMainForm',
    taskId : 'taskId',
    complete : 'complete',
    edit : 'edit',
    remove : 'remove',
};
const staticPlaceholders = {
    // LABELS
    titleText: "Task list",
    idText: "&#9679;",
    nameText: "Task",
    dateText: "Date",

    // Submit buttons content
    editText: "edit",
    removeText: "remove",
    saveText: "save",
    resetText: "reset",
    downloadText: "download",
    completeText: "complete",
};


// main form placeholders
const defaultMainFormPlaceholders = {
    taskDateValue : "",
    taskNameBackValue: "* required",
    taskNameValue: "",
    isMainFormEdited: "",
    mainFormTaskId: NEW_ITEM_INDEX.toString(),
};

const editCheckboxStyles = {
    checkboxDontChangeValue: styles.checked,
    checkboxCompleteValue: styles.empty,
};
const defaultCheckboxesStyles = {
    checkboxDontChangeValue: styles.disabled,
    checkboxCompleteValue: styles.empty,
};

//entryStyle
const entryStyles = {
    expiredEntryStyle: 'class=expired',
    defaultStyle: styles.empty,
};

const taskStatuses = {
    completed: 'Completed',
    incomplete: 'Incomplete',
};

const tasksProperties = Task.getRenderedPropertiesNamesAsList();

const checkboxesNames = {
    completeCheckbox: "completeCheckbox",
    dontChangeFileCheckbox:'dontChangeFileCheckbox',
};

//taskCompletedAsString


class PageConstructor{

    #worker;

    constructor(worker) {
        this.#worker = worker;
    }

    static isCreateAtMainForm(body){
        return (body[inputFields.isMainForm] === "true") &&
            (body[inputFields.isMainFormEdited] === "true");
    }

    static isEditAtMainForm(body) {
        return (body[inputFields.isMainForm] === "true") &&
            (body[inputFields.isMainFormEdited] !== "true");
    }

    static isDeleteRequest(body) {
        return (body[inputFields.isMainForm] !== "true") &&
            (body[inputFields.remove] === "true");
    }

    static isCompleteRequest(body) {
        return (body[inputFields.isMainForm] !== "true") &&
            (body[inputFields.complete] === "true");
    }

    static isEditRequest(body) {
        return (body[inputFields.isMainForm] !== "true") &&
            (body[inputFields.edit] === "true");
    }

    static getPassedId(body){
        return parseInt(body[inputFields.taskId]);
    }

    static retrieveAttachment(files) {
        return (files === undefined)
                ? undefined
                : files[tasksProperties.taskAttachmentFileName];
    }

    static retrieveTaskProperties(body){
        const result = {};

        result[tasksProperties.taskDate]
            = body[tasksProperties.taskDate];

        result[tasksProperties.taskCompleted]
            = body[checkboxesNames.completeCheckbox];

        result[tasksProperties.taskName]
            = body[tasksProperties.taskName];

        return result;
    }

    getPlaceholders(req, isMainFormEdited, mainFormTaskNumber) {

        const tasksToShow = [];

        if (Utils.isObjectEmpty(req.query)) {
            this.#worker.getTasksAsRenderedData()
                .forEach((value, index) =>
                    tasksToShow.push(PageConstructor.#createTaskEntry(value, index))
            );
        }

        // else {
        //     const statuses = req.query[tasksProperties.taskCompleted];
        //     let filters;
        //
        //     if (Array.isArray(statuses)) {
        //         filters = statuses;
        //     } else {
        //         filters = [];
        //         filters.push(statuses);
        //     }
        //
        //     let filteredTasks = taskWorker.tasks.filter(task =>
        //         filters.includes(task.isCompleted().toString())
        //     );
        //     for (let i = 0; i < filteredTasks.length; i++) {
        //         tasksToShow.push(createTaskEntry(filteredTasks[i], i));
        //     }
        // }

        const mainFormPlaceholders =
            PageConstructor.#getMainFormPlaceholders(isMainFormEdited,
                mainFormTaskNumber,
                tasksToShow[mainFormTaskNumber]);


        return  {
            content : tasksToShow,
            ...staticPlaceholders,
            ...mainFormPlaceholders,
        };
    }


    static #getMainFormPlaceholders(isMainFormEdited, mainFormTaskNumber, task) {

        let checkboxValues = defaultCheckboxesStyles;
        let placeholders = defaultMainFormPlaceholders;

        if (isMainFormEdited === true) {
            checkboxValues = editCheckboxStyles;




            placeholders = {
                isMainFormEdited: "true",
                mainFormTaskId: mainFormTaskNumber.toString(),
                taskNameBackValue: task[tasksProperties.taskName],
                taskNameValue: task[tasksProperties.taskName],
                taskDateValue: Utils.createDateInStandardFormat(task[tasksProperties.taskDate]),
            };
        }

        return {
            ...placeholders,
            ...checkboxValues
        }
    }


    static #createTaskEntry(task, taskId) {
        return {
            taskId: taskId,
            taskName: task[tasksProperties.taskName].substr(0, MAX_DISPLAYED_LENGTH),
            taskDate: Utils.formatDateForOutput(task[tasksProperties.taskDate]),
            taskAttachmentFileName: task[tasksProperties.taskAttachmentFileName].substr(0, MAX_DISPLAYED_LENGTH),
            taskCompletedAsString: task[tasksProperties.taskCompleted]
                ? taskStatuses.completed
                : taskStatuses.incomplete,

            entryStyle:task[tasksProperties.taskExpired] === true
                ? entryStyles.expiredEntryStyle
                : entryStyles.defaultStyle,

            completeButtonStyle: task[tasksProperties.taskCompleted] === true
                ? styles.disabled
                : styles.empty,

            downloadButtonStyle: task[tasksProperties.taskAttachmentExists] !== true
                ? styles.disabled
                : styles.empty,
        };
    }
}

module.exports = PageConstructor;