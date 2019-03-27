class ClientPageStructure {

    static getStyles() {
        return {
            checked: 'checked',
            empty: '',
            disabled: 'disabled',
        };
    }

    static getDefaultFilters() {
        return {
            completeness: 'all',
            date: 'all',
        }
    }

    static getCheckboxesStyles() {
        return {
            defaultCheckboxesStyles: {
                checkboxUpdateValue: ClientPageStructure.getStyles().disabled,
                checkboxCompleteValue: ClientPageStructure.getStyles().empty,
            },
            editCheckboxStyles: {
                checkboxUpdateValue: ClientPageStructure.getStyles().checked,
                checkboxCompleteValue: ClientPageStructure.getStyles().empty,
            },
        };
    }
    static getFilters() {
        return {
            completenessFilter: "completeness",
            dateFilter: 'date',
            completeness: {all: "all", incomplete: 'incomplete', completed: 'completed'},
            date: {all: 'all', upcoming: 'upcoming', expired: 'expired'},
        };
    }
    static getEntryStyles() {
        return {
            expiredEntryStyle: 'class=expired',
            defaultStyle: ClientPageStructure.getStyles().empty,
        };
    }
    static getTaskStatuses(){
        return {
            completed: 'Completed',
            incomplete: 'Incomplete',
        };
    }

    static getDefaultCheckboxesStyles() {
        return {
            checkboxUpdateValue: ClientPageStructure.getStyles().disabled,
            checkboxCompleteValue: ClientPageStructure.getStyles().empty,
        };
    }

    static getDefaultMainFormPlaceholders() {
        return {
            taskDateValue: "",
            taskNameBackValue: "* required",
            taskNameValue: "",
            mainFormTaskId: '-1',
        };
    }
}

try {
    module.exports = ClientPageStructure;
} catch (e) {

}

