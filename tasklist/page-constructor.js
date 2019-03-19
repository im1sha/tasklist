const Task = require("./task");
const Utils = require('./utils');


const MAX_DISPLAYED_LENGTH = 15;
const NEW_ITEM_INDEX = Task.getNewItemIndex();
const ATTACHMENT_PAGE_ID = "taskAttachment";

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
    idText: String.fromCharCode(9679) ,
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


const filters = {
    completenessFilter: "completeness",
    dateFilter: 'date',
    completeness: { all: "all", incomplete: 'incomplete', completed: 'completed'},
    date : { all: 'all',  upcoming: 'upcoming', expired: 'expired'}
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
    checkboxUpdateValue: styles.checked,
    checkboxCompleteValue: styles.empty,
};
const defaultCheckboxesStyles = {
    checkboxUpdateValue: styles.disabled,
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
    updateCheckbox:'updateCheckbox',
};

const radiosPlaceholdersNames = {
    completenessAllStyle: 'completenessAllStyle',
    completenessIncompleteStyle: 'completenessIncompleteStyle',
    completenessCompletedStyle:'completenessCompletedStyle',
    dateAllStyle:'dateAllStyle',
    dateUpcomingStyle:'dateUpcomingStyle',
    dateExpiredStyle:'dateExpiredStyle',
}

//taskCompletedAsString


class PageConstructor{

    constructor(worker) {
        this.worker = worker;
    }

    static isCreateAtMainForm(body){
        return (body[inputFields.isMainForm] === "true") &&
            (body[inputFields.isMainFormEdited] !== "true");
    }

    static isEditAtMainForm(body) {
        return (body[inputFields.isMainForm] === "true") &&
            (body[inputFields.isMainFormEdited] === "true");
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

    static shouldRewriteAttachment(body){
        return PageConstructor.isCheckboxOn(body[checkboxesNames.updateCheckbox]);
    }

    static getPassedId(body){
        return parseInt(body[inputFields.taskId]);
    }

    static retrieveAttachment(files) {
        return (files === undefined)
                ? undefined
                : files[ATTACHMENT_PAGE_ID];// CORRECT
    }

    static retrieveTaskProperties(body){
        const result = {};

        result[tasksProperties.taskDate]
            = body[tasksProperties.taskDate];

        result[tasksProperties.taskCompleted]
            = PageConstructor.isCheckboxOn(body[checkboxesNames.completeCheckbox]);

        result[tasksProperties.taskName]
            = body[tasksProperties.taskName];

        return result;
    }

    static isCheckboxOn(checkboxText){
        return checkboxText === 'on';
    }

    getPlaceholders(req, isMainFormEdited, mainFormTaskNumber) {

        const tasksToShow = [];
        let mainFormTask = null;

        this.worker.getTasksAsRenderedData().forEach((value) => {
            if (value && PageConstructor.shouldItemToShow(value, req.query)) {
                const entry = PageConstructor.createTaskEntry(value);
                tasksToShow.push(entry);
                if (entry.taskId === mainFormTaskNumber) {
                    mainFormTask = entry;
                }
            }
        });

        let placeholdersForRadioButtons = PageConstructor.getPlaceholdersForRadioButtons(req.query);

        const mainFormPlaceholders =
            PageConstructor.getMainFormPlaceholders(isMainFormEdited, mainFormTaskNumber, mainFormTask);


        return  {
            content : tasksToShow,
            ...staticPlaceholders,
            ...mainFormPlaceholders,
            ...placeholdersForRadioButtons,
        };
    }

    static getPlaceholdersForRadioButtons(query){

        let result = {};

        // default values
        result[radiosPlaceholdersNames.completenessAllStyle] = '';
        result[radiosPlaceholdersNames.completenessIncompleteStyle] = '';
        result[radiosPlaceholdersNames.completenessCompletedStyle] = '';
        result[radiosPlaceholdersNames.dateAllStyle] = '';
        result[radiosPlaceholdersNames.dateExpiredStyle] = '';
        result[radiosPlaceholdersNames.dateUpcomingStyle] = '';


        if (query[filters.completenessFilter] === filters.completeness.completed){
            result[radiosPlaceholdersNames.completenessCompletedStyle] = styles.checked;
        }else if (query[filters.completenessFilter] === filters.completeness.incomplete){
            result[radiosPlaceholdersNames.completenessIncompleteStyle] = styles.checked;
        }else{
            result[radiosPlaceholdersNames.completenessAllStyle] = styles.checked;
        }

        if (query[filters.dateFilter] === filters.date.expired){
            result[radiosPlaceholdersNames.dateExpiredStyle] = styles.checked;
        }else if (query[filters.dateFilter] === filters.date.upcoming){
            result[radiosPlaceholdersNames.dateUpcomingStyle] = styles.checked;
        }else{
            result[radiosPlaceholdersNames.dateAllStyle] = styles.checked;
        }

        return result;
    }

    static shouldItemToShow(item, query) {

        let result = true;

        if (query[filters.completenessFilter] === filters.completeness.completed){
            if (!item[tasksProperties.taskCompleted]){
                result &= false;
            }
        } else if (query[filters.completenessFilter] === filters.completeness.incomplete){
            if (item[tasksProperties.taskCompleted]){
                result &= false;
            }
        }

        if (query[filters.dateFilter] === filters.date.expired){
            if (!item[tasksProperties.taskExpired]){
                result &= false;
            }
        } else if (query[filters.dateFilter] === filters.date.upcoming){
            if (item[tasksProperties.taskExpired] || item[tasksProperties.taskDate] < new Date()){
                result &= false;
            }
        }

        return result;
    }

    static getMainFormPlaceholders(isMainFormEdited, mainFormTaskNumber, task) {

        let checkboxValues = defaultCheckboxesStyles;
        let placeholders = defaultMainFormPlaceholders;

        if (isMainFormEdited === true) {
            checkboxValues = editCheckboxStyles;

            placeholders = {
                isMainFormEdited: "true",
                mainFormTaskId: mainFormTaskNumber.toString(),
                taskNameBackValue: task[tasksProperties.taskName],
                taskNameValue: task[tasksProperties.taskName],
                taskDateValue: Utils.createDateInStandardFormat(task.taskDateValue), // CORRECT
            };
        }

        return {
            ...placeholders,
            ...checkboxValues
        }
    }

    static createTaskEntry(task) {
        return {
            taskId: task[tasksProperties.taskId],
            taskName: task[tasksProperties.taskName],
            taskDisplayedName: task[tasksProperties.taskName].substr(0, MAX_DISPLAYED_LENGTH),
            taskDate: Utils.formatDateForOutput(task[tasksProperties.taskDate]),
            taskDateValue: task[tasksProperties.taskDate],
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