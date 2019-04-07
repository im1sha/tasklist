const Task = require("./task");
const Utils = require('./utils');
const ClientPageStructure = require('../public/scripts/client-page-structure');
const ClientUtils = require( "../public/scripts/client-utils");

const radiosPlaceholdersNames = {
    completenessAllStyle: 'completenessAllStyle',
    completenessIncompleteStyle: 'completenessIncompleteStyle',
    completenessCompletedStyle:'completenessCompletedStyle',
    dateAllStyle:'dateAllStyle',
    dateUpcomingStyle:'dateUpcomingStyle',
    dateExpiredStyle:'dateExpiredStyle',
};
const styles = ClientPageStructure.getStyles();
const filters = ClientPageStructure.getFilters();
const staticPlaceholders = {
    titleText: "[tasklist]",
    nameText: "Task",
    dateText: "Date",
};
const defaultMainFormPlaceholders = ClientPageStructure.getDefaultMainFormPlaceholders();
const defaultCheckboxesStyles = ClientPageStructure.getDefaultCheckboxesStyles();
const attachmentProperty = 'taskAttachment';
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

    static getAttachmentName(files){
        return files[attachmentProperty] ? files[attachmentProperty].name : "No file";
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

    createTask(properties, files){
        this.changePropertiesUsingFiles(properties, files);
        return this.worker.createTask(properties, PageConstructor.retrieveAttachment(files));
    }

    updateTask(props, files, id){
        this.changePropertiesUsingFiles(props, files);
        return this.worker.changeTask(props, PageConstructor.retrieveAttachment(files), Number(id));
    }

    // private use only
    changePropertiesUsingFiles(properties, files) {
        const checkboxesNames = ClientPageStructure.getCheckboxesNames();
        properties.taskCompleted = Boolean(properties[checkboxesNames.completeCheckbox]);
        properties.taskShouldUpdateAttachment = Boolean(properties[checkboxesNames.updateCheckbox]);
        properties.taskAttachmentFileName = PageConstructor.getAttachmentName(files);
    }

    deleteTask(id) {
        return this.worker.deleteTask(Number(id));
    }

    patchTask(body, files, id) {

        // check whether complete request 've been passed
        if ((Object.keys(body).length === 1)
            && body.hasOwnProperty(ClientUtils.getTaskCompletedPropertyName())
            && (body[ClientUtils.getTaskCompletedPropertyName()] === true)) {
            return this.completeTask(Number(id));
        }

        return ClientUtils.getStatusCodes().unprocessableEntity;
    }

    completeTask(id) {
        return this.worker.completeTask(Number(id));
    }
}

module.exports = PageConstructor;

