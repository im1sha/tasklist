const fs = require('fs');
const Utils = require("Utils");

class Task {

    #taskAttachmentFileName; // string
    #taskAttachmentPath; // string
    #taskDate; // date
    #taskName; // string
    #taskCompleted; // boolean

    constructor(taskName,
                taskDate,
                taskAttachmentPath = null,
                taskAttachmentFileName = null,
                completed = false) {
        this.#taskAttachmentFileName = taskAttachmentFileName;
        this.#taskAttachmentPath = taskAttachmentPath;
        this.#taskDate = taskDate;
        this.#taskName = taskName;
        this.#taskCompleted = completed;
    }



    // doesnt return path
    getRenderedData() {
        return {
            taskName: this.getName(),
            taskDate: this.getExpireDate(),
            taskAttachmentFileName: this.getAttachmentFileName(),
            taskAttachmentExists: !!this.#taskAttachmentPath,
            taskCompleted: this.isCompleted(),
            taskExpired: this.isExpired(),
        };
    }

    getAttachmentPath(){
        return this.#taskAttachmentPath;
    }
    getAttachmentFileName(){
        return this.#taskAttachmentFileName;
    }
    getName(){
        return this.#taskName;
    }
    getExpireDate(){
        return new Date(this.#taskDate.getTime());
    }
    isCompleted() {
        return this.#taskCompleted;
    }

    isExpired() {
        return (!this.isCompleted() && (this.#taskDate < new Date()));
    }

    changeCompleteness(state) {
        this.#taskCompleted = state;
    }
    changeDate(date){
        if (!Utils.isDate(date)){
            throw new Error('invalid date');
        }

        this.#taskDate = date;
    }
    changeName(name){
        #taskName = name;
    }

    changeAttachment(path, name){
        #taskAttachmentPath = path;
        #taskAttachmentFileName = name;
    }


    static getNewItemIndex() { return -1; }

    static getRenderedPropertiesNamesAsList() {
        return {
            taskCompleted: Task.getTaskCompletedPropertyName(),
            taskAttachmentFileName: Task.getTaskAttachmentFileNamePropertyName(),
            taskAttachmentExists: "taskAttachmentExists",
            taskName: Task.getTaskNamePropertyName(),
            taskDate: Task.getTaskDatePropertyName(),
            taskExpired: 'taskExpired', //
        };
    }
    static getTaskCompletedPropertyName() { return "taskCompleted"; }
    static getTaskAttachmentFileNamePropertyName() { return "taskAttachmentFileName"; }
    static getTaskAttachmentPathPropertyName() { return "taskAttachmentPath"; }
    static getTaskNamePropertyName() { return "taskName"; }
    static getTaskDatePropertyName() { return "taskDate"; }

    static fromObject(obj) {
        if (!obj.hasOwnProperty(Task.getTaskNamePropertyName()) ||
            !obj.hasOwnProperty(Task.getTaskDatePropertyName()) ||
            !obj.hasOwnProperty(Task.getTaskCompletedPropertyName()) ||
            !obj.hasOwnProperty(Task.getTaskAttachmentFileNamePropertyName()) ||
            !obj.hasOwnProperty(Task.getTaskAttachmentPathPropertyName()) ||
            isNaN(Date.parse(obj.taskDate)) ||
            ((obj.taskAttachmentPath !== null) && !fs.existsSync(obj.taskAttachmentPath))) {
            return null;
        } else {
            return new Task(
                obj.taskName,
                new Date(obj.taskDate),
                obj.taskAttachmentPath,
                obj.taskAttachmentFileName,
                obj.taskCompleted
            );
        }
    }
}


module.exports = Task;


