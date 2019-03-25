const Task = require("./task");
const Utils = require('./utils');

const radiosPlaceholdersNames = {
    completenessAllStyle: 'completenessAllStyle',
    completenessIncompleteStyle: 'completenessIncompleteStyle',
    completenessCompletedStyle:'completenessCompletedStyle',
    dateAllStyle:'dateAllStyle',
    dateUpcomingStyle:'dateUpcomingStyle',
    dateExpiredStyle:'dateExpiredStyle',
};

const styles = {
    checked: 'checked',
    empty: '',
    disabled: 'disabled',
};

const filters = {
    completenessFilter: "completeness",
    dateFilter: 'date',
    completeness: { all: "all", incomplete: 'incomplete', completed: 'completed' },
    date: { all: 'all', upcoming: 'upcoming', expired: 'expired' },
};

const staticPlaceholders = {
    titleText: "[tasklist]",
    nameText: "Task",
    dateText: "Date",
};

const defaultMainFormPlaceholders = {
    taskDateValue : "",
    taskNameBackValue: "* required",
    taskNameValue: "",
    mainFormTaskId: Task.getNewItemIndex().toString(),
};

const defaultCheckboxesStyles = {
    checkboxUpdateValue: styles.disabled,
    checkboxCompleteValue: styles.empty,
};

const parameters = {
    id: 'id',
};

const attachmentProperty = 'Attachment';

const tasksProperties = Task.getPropertiesNamesAsList(); // use when forming table header

class PageConstructor {

    constructor(worker) {
        this.worker = worker;
    }

    static getPlaceholdersForRadioButtons() {
        let result = {};

        result[radiosPlaceholdersNames.completenessAllStyle] = styles.checked;
        result[radiosPlaceholdersNames.completenessIncompleteStyle] = '';
        result[radiosPlaceholdersNames.completenessCompletedStyle] = '';
        result[radiosPlaceholdersNames.dateAllStyle] = styles.checked;
        result[radiosPlaceholdersNames.dateExpiredStyle] = '';
        result[radiosPlaceholdersNames.dateUpcomingStyle] = '';

        return result;
    }

    static getPlaceholders() {
        let placeholdersForRadioButtons = PageConstructor.getPlaceholdersForRadioButtons();

        return {
            ...staticPlaceholders,
            ...defaultCheckboxesStyles,
            ...defaultMainFormPlaceholders,
            ...placeholdersForRadioButtons,
        };
    }

    static shouldItemToShow(item, query) {
        let result = true;

        if (!query[filters.completenessFilter]) {
            // render all the tasks by default
        } else if (query[filters.completenessFilter] === filters.completeness.completed) {
            if (!item[tasksProperties.taskCompleted]) {
                result &= false;
            }
        } else if (query[filters.completenessFilter] === filters.completeness.incomplete) {
            if (item[tasksProperties.taskCompleted]) {
                result &= false;
            }
        }
        if (!query[filters.dateFilter]) {
            // render all the tasks by default
        } else if (query[filters.dateFilter] === filters.date.expired) {
            if (!item[tasksProperties.taskExpired]) {
                result &= false;
            }
        } else if (query[filters.dateFilter] === filters.date.upcoming) {
            if (item[tasksProperties.taskExpired] || item[tasksProperties.taskDate] < new Date()) {
                result &= false;
            }
        }
        return result;
    }

    static retrieveAttachment(files) {
        return (files === undefined)
            ? undefined
            : files[attachmentProperty];
    }

    getFilteredTask(query) {
        let tasksToShow = [];

        this.worker.getTasksData().forEach(value => {
            if (value && PageConstructor.shouldItemToShow(value, query)) {
                tasksToShow.push(value);
            }
        });

        if (tasksToShow.length === 0) {
            return null;
        }

        return tasksToShow;
    }

    static retrieveIndexOfRequestedElement(str){
        if(Utils.isPositiveInt(str)){
            return Number(str);
        }
        return null;
    }

    createTask(body, files){
        return this.worker.createTask(body, PageConstructor.retrieveAttachment(files));
    }

    // returns http status
    updateTask(body, files, id){
        return this.worker.changeTask(body, PageConstructor.retrieveAttachment(files), id);
    }

    deleteTask(id) {
        return this.worker.deleteTask(id);
    }

    patchTask(body, files, id) {

        // check whether complete request 've been passed
        if ((Object.keys(body).length === 1)
            && body.hasOwnProperty(Task.getTaskCompletedPropertyName())
            && (body[Task.getTaskCompletedPropertyName()] === 'true')) {
            return this.completeTask(id);
        }

        return this.worker.getImplementedStatuses().unprocessableEntity;
    }

    completeTask(id) {
        return this.worker.completeTask(id);
    }
}

module.exports = PageConstructor;