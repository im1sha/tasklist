const fs = require('fs');
const Utils = require("./utils");
const ClientUtils =require('../public/scripts/common/client-utils');

class Task {
    constructor(taskId,
                taskOwner,
                taskName,
                taskDate,
                taskAttachmentPath,
                taskAttachmentFileName,
                taskCompleted) {
        this.taskId = taskId;
        this.taskOwner = taskOwner;
        this.taskAttachmentFileName = taskAttachmentFileName;
        this.taskAttachmentPath = taskAttachmentPath;
        this.taskDate = taskDate;
        this.taskName = taskName;
        this.taskCompleted = taskCompleted;
    }

    getOwner(){
        return this.taskOwner;
    }
    getId(){
        return this.taskId;
    }
    getAttachmentPath(){
        return this.taskAttachmentPath;
    }
    getAttachmentFileName(){
        return this.taskAttachmentFileName;
    }
    getName(){
        return this.taskName;
    }
    getExpireDate(){
        return new Date(this.taskDate.getTime());
    }
    isCompleted() {
        return this.taskCompleted;
    }
    isExpired() {
        return (!this.isCompleted() && (this.taskDate < new Date()));
    }

    changeCompleteness(state) {
        this.taskCompleted = state;
    }
    changeDate(date){
        if (!Utils.isDate(date)){
            throw new Error('invalid date');
        }

        this.taskDate = date;
    }
    changeName(name){
        this.taskName = name;
    }
    changeAttachment(path, name){
        this.taskAttachmentPath = path;
        this.taskAttachmentFileName = name;
    }

    static getNewItemIndex() { return -1; }

    getData() {
        return {
            taskId: this.getId(),
            taskOwner: this.getOwner(),
            taskName: this.getName(),
            taskDate: this.getExpireDate(),
            taskAttachmentFileName: this.getAttachmentFileName(),
            taskAttachmentExists: !!this.getAttachmentPath(),
            taskCompleted: this.isCompleted(),
            taskExpired: this.isExpired(),
        };
    }

    static getPropertiesNamesAsList() {
        return ClientUtils.getTaskPropertiesNamesAsList();
    }


    static getTaskAttachmentPathPropertyName() { return "taskAttachmentPath"; }
    static getOwnerPropertyName() { return "taskOwner"; }


    static hasValidGeneralProperties(obj){
        return obj.hasOwnProperty(ClientUtils.getTaskIdPropertyName())
            && obj.hasOwnProperty(ClientUtils.getTaskNamePropertyName())
            && obj.hasOwnProperty(ClientUtils.getTaskDatePropertyName())
            && obj.hasOwnProperty(ClientUtils.getTaskAttachmentFileNamePropertyName())
            && obj.hasOwnProperty(ClientUtils.getTaskCompletedPropertyName())
            && !isNaN(Date.parse(obj[ClientUtils.getTaskDatePropertyName()]));
    }


    // serialized objects only
    static hasValidLocalProperties(obj){
        return obj.hasOwnProperty(Task.getTaskAttachmentPathPropertyName())
            && obj.hasOwnProperty(Task.getOwnerPropertyName())
            && ((obj[Task.getTaskAttachmentPathPropertyName()] === null)
                || fs.existsSync(obj[Task.getTaskAttachmentPathPropertyName()]));
    }

    // external property
    static hasValidExternalProperties(obj) {
        return obj.hasOwnProperty(
            ClientUtils.getTaskShouldUpdateAttachmentPropertyName());
    }

    static isValidObject(obj, isLocal = true) {
        let isLocalPropertiesAppropriate = true;
        let isExternalPropertiesAppropriate = true;

        if (obj) {
            if (isLocal === true) {
                isLocalPropertiesAppropriate
                    = Task.hasValidLocalProperties(obj);
            } else {
                isExternalPropertiesAppropriate
                    = Task.hasValidExternalProperties(obj);
            }
        }

        return obj
            && isLocalPropertiesAppropriate
            && isExternalPropertiesAppropriate
            && Task.hasValidGeneralProperties(obj);
    }

    // isLocal === true : attachment is on server
    // isLocal !== true : attachment is delivered with separated file
    static fromObject(obj, isLocal = true) {

        if (!Task.isValidObject(obj, isLocal)) {
            return null;
        } else {
            return new Task(
                obj[ClientUtils.getTaskIdPropertyName()],
                obj[Task.getOwnerPropertyName()],
                obj[ClientUtils.getTaskNamePropertyName()],
                new Date(obj[ClientUtils.getTaskDatePropertyName()]),
                obj[Task.getTaskAttachmentPathPropertyName()],
                obj[ClientUtils.getTaskAttachmentFileNamePropertyName()],
                obj[ClientUtils.getTaskCompletedPropertyName()]
            );
        }
    }
}


module.exports = Task;


