const PageConstructor = require('./page-constructor');
const Utils = require('./utils');

const ClientPageStructure = require( "../public/scripts/client-page-structure");
const ClientUtils = require( "../public/scripts/client-utils");

const attachmentProperty = 'taskAttachment';
const credentialsMinimalLength = 6;

class RequestHandler {

    constructor(taskWorker, userWorker) {
        this.taskWorker = taskWorker;
        this.userWorker = userWorker;
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

        this.taskWorker.getTasksData().forEach(value => {
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
        return this.taskWorker.createTask(properties, RequestHandler.retrieveAttachment(files));
    }

    updateTask(props, files, id){
        this.changePropertiesUsingFiles(props, files);
        return this.taskWorker.changeTask(props, RequestHandler.retrieveAttachment(files), Number(id));
    }

    // private use only
    changePropertiesUsingFiles(properties, files) {
        const checkboxesNames = ClientPageStructure.getCheckboxesNames();
        properties.taskCompleted = Boolean(properties[checkboxesNames.completeCheckbox]);
        properties.taskShouldUpdateAttachment = Boolean(properties[checkboxesNames.updateCheckbox]);
        properties.taskAttachmentFileName = RequestHandler.getAttachmentName(files);
    }

    deleteTask(id) {
        return this.taskWorker.deleteTask(Number(id));
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
        return this.taskWorker.completeTask(Number(id));
    }

    ///
    /// Login section
    ///

    static getCredentialsMinimalLength() { return credentialsMinimalLength; }

    static retrieveLogin(body) {
        return body['login'] ? body['login'] : null;
    }

    static retrievePassword(body) {
        return body['password'] ? body['password'] : null;
    }

    createUser(login, password) {
        const loginString = String(login).length > RequestHandler.getCredentialsMinimalLength()
            ? String(login)
            : null;
        const passwordString = String(password).length > RequestHandler.getCredentialsMinimalLength()
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

