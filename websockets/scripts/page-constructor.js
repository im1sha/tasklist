const ClientUtils = require("../public/scripts/common/client-utils");
const ClientPageStructure = require('../public/scripts/main/client-page-structure');
const filters = ClientPageStructure.getFilters();
const tasksProperties = ClientUtils.getTaskPropertiesNamesAsList();

class PageConstructor {

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

