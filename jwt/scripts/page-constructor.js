const ClientUtils = require("../public/scripts/client-utils");
const ClientPageStructure = require('../public/scripts/client-page-structure');

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
const tasksProperties = ClientUtils.getTaskPropertiesNamesAsList(); // use when forming table header

class PageConstructor {
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
}

module.exports = PageConstructor;

