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

    // doesnt return path
    getRenderedData() {
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
    static getRenderedPropertiesNamesAsList() {
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

    static fromObject(obj) {
        if (!obj ||
            // has all the properties
            !obj.hasOwnProperty(Task.getTaskIdPropertyName()) ||
            !obj.hasOwnProperty(Task.getTaskNamePropertyName()) ||
            !obj.hasOwnProperty(Task.getTaskDatePropertyName()) ||
            !obj.hasOwnProperty(Task.getTaskAttachmentFileNamePropertyName()) ||
            !obj.hasOwnProperty(Task.getTaskAttachmentPathPropertyName()) ||
            !obj.hasOwnProperty(Task.getTaskCompletedPropertyName()) ||
            // date is valid
            isNaN(Date.parse(obj[Task.getTaskDatePropertyName()])) ||
            // if Attachment isn't null => Attachment exists
            ((obj[Task.getTaskAttachmentPathPropertyName()] !== null) &&
                !fs.existsSync(obj[Task.getTaskAttachmentPathPropertyName()]))) {
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


