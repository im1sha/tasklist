const PageConstructor = require('./page-constructor');
const Utils = require('./utils');

const ClientPageStructure = require( "../public/scripts/main/client-page-structure");
const ClientUtils = require( "../public/scripts/common/client-utils");

const attachmentProperty = 'taskAttachment';
const credentialsMinimalLength = 6;

class RequestHandler {

    constructor(taskWorker, userWorker) {
        this.taskWorker = taskWorker;
        this.userWorker = userWorker;
    }

    getFilteredTask(ownerId, query) {
        let tasksToShow = [];

        this.taskWorker.getTasksData().forEach(value => {
            if (value && this.taskWorker.isOwner(ownerId, value.taskId) && PageConstructor.shouldItemToShow(value, query)) {
                tasksToShow.push(value);
            }
        });

        if (tasksToShow.length === 0) {
            return null;
        }

        return tasksToShow;
    }

    createTask(ownerId, props, file) {
        this.changeProperties(props);
        return this.taskWorker.createTask(ownerId, props, file);
    }

    updateTask(props, file, id) {
        this.changeProperties(props);
        return this.taskWorker.changeTask(props, file, Number(id));
    }

    // _private use only
    changeProperties(properties) {
        const checkboxesNames = ClientPageStructure.getCheckboxesNames();
        properties.taskCompleted = Boolean(properties[checkboxesNames.completeCheckbox]);
        properties.taskShouldUpdateAttachment = Boolean(properties[checkboxesNames.updateCheckbox]);
    }

    // returns Boolean
    deleteTask(id) {
        return this.taskWorker.deleteTask(Number(id));
    }

    patchTask(body, id) {

        // check whether complete request 've been passed
        if ((Object.keys(body).length === 1)
                && body.hasOwnProperty(ClientUtils.getTaskCompletedPropertyName())
                && (body[ClientUtils.getTaskCompletedPropertyName()] === true)) {
            return this.completeTask(Number(id));
        }

        return ClientUtils.getStatusCodes().unprocessableEntity;
    }

    completeTask(id) {
        return this.taskWorker.completeTask(Number(id));
    }

    ///
    /// Login section
    ///

    static getCredentialsMinimalLength() { return credentialsMinimalLength; }


    createUser(login, password) {
        const loginString = String(login).length >= RequestHandler.getCredentialsMinimalLength()
            ? String(login)
            : null;
        const passwordString = String(password).length >= RequestHandler.getCredentialsMinimalLength()
            ? String(password)
            : null;

        if (passwordString && loginString) {
            return this.userWorker.addUser(loginString, passwordString)
        }
        return null;
    }

    checkUserCredentials(login, password) {
        return this.userWorker.checkPassword(String(login), String(password));
    }

}


module.exports = RequestHandler ;

