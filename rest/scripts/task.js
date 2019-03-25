const fs = require('fs');
const Utils = require("./utils");

class Task {
    constructor(taskId,
                taskName,
                taskDate,
                taskAttachmentPath,
                taskAttachmentFileName,
                taskCompleted) {
        this.taskId = taskId;
        this.taskAttachmentFileName = taskAttachmentFileName;
        this.taskAttachmentPath = taskAttachmentPath;
        this.taskDate = taskDate;
        this.taskName = taskName;
        this.taskCompleted = taskCompleted;
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
            taskName: this.getName(),
            taskDate: this.getExpireDate(),
            taskAttachmentFileName: this.getAttachmentFileName(),
            taskAttachmentExists: !!this.getAttachmentPath(),
            taskCompleted: this.isCompleted(),
            taskExpired: this.isExpired(),
        };
    }
    static getPropertiesNamesAsList() {
        return {
            taskId: this.getTaskIdPropertyName(),
            taskName: Task.getTaskNamePropertyName(),
            taskDate: Task.getTaskDatePropertyName(),
            taskAttachmentFileName: Task.getTaskAttachmentFileNamePropertyName(),
            taskAttachmentExists: "taskAttachmentExists",
            taskCompleted: Task.getTaskCompletedPropertyName(),
            taskExpired: 'taskExpired', //
        };
    }
    static getTaskCompletedPropertyName() { return "taskCompleted"; }
    static getTaskAttachmentFileNamePropertyName() { return "taskAttachmentFileName"; }
    static getTaskAttachmentPathPropertyName() { return "taskAttachmentPath"; }
    static getTaskNamePropertyName() { return "taskName"; }
    static getTaskDatePropertyName() { return "taskDate"; }
    static getTaskIdPropertyName() { return "taskId"; }

    // used when task was sent externally.
    // It is NOT stored in local object, but in an external one.
    static getTaskShouldUpdateAttachmentPropertyName() {
        return "taskShouldUpdateAttachment";
    }

    //
    static hasValidGeneralProperties(obj){
        return obj.hasOwnProperty(Task.getTaskIdPropertyName())
            && obj.hasOwnProperty(Task.getTaskNamePropertyName())
            && obj.hasOwnProperty(Task.getTaskDatePropertyName())
            && obj.hasOwnProperty(Task.getTaskAttachmentFileNamePropertyName())
            && obj.hasOwnProperty(Task.getTaskCompletedPropertyName())
            && !isNaN(Date.parse(obj[Task.getTaskDatePropertyName()]));
    }

    // serialized objects only
    static hasValidLocalProperties(obj){
        return obj.hasOwnProperty(Task.getTaskAttachmentPathPropertyName())
            && ((obj[Task.getTaskAttachmentPathPropertyName()] === null)
                || fs.existsSync(obj[Task.getTaskAttachmentPathPropertyName()]));
    }

    // external property
    static hasValidExternalProperties(obj) {
        return obj.hasOwnProperty(
            Task.getTaskShouldUpdateAttachmentPropertyName());
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
                obj[Task.getTaskIdPropertyName()],
                obj[Task.getTaskNamePropertyName()],
                new Date(obj[Task.getTaskDatePropertyName()]),
                obj[Task.getTaskAttachmentPathPropertyName()],
                obj[Task.getTaskAttachmentFileNamePropertyName()],
                obj[Task.getTaskCompletedPropertyName()]
            );
        }
    }


}


module.exports = Task;


