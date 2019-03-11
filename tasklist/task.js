const fs = require('fs');

class Task {

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

    #taskAttachmentFileName;
    #taskAttachmentPath;
    #taskDate;
    #taskName;
    #taskCompleted;

    getAttachmentFileName(){
        return String(this.#taskAttachmentFileName);
    }

    getAttachmentPath(){
        return String(this.#taskAttachmentPath);
    }

    getExpireDate(){
        return new Date(this.#taskDate);
    }

    getName(){
        return String(this.#taskName);
    }

    isCompleted() {
        return this.#taskCompleted;
    }

    isExpired() {
        return (!this.isCompleted() && (this.#taskDate < new Date()));
    }

    complete() {
        this.#taskCompleted = true;
    }
    continue() {
        this.#taskCompleted = false;
    }

    static getPropertiesNamesAsObjectOfStrings() {
        return {
            taskId: Task.getTaskIdPropertyName(),
            taskCompleted: Task.getTaskCompletedPropertyName(),
            taskAttachmentFileName: Task.getTaskAttachmentFileNamePropertyName(),
            taskAttachmentPath: Task.getTaskAttachmentPathPropertyName(),
            taskName: Task.getTaskNamePropertyName(),
            taskDate: Task.getTaskDatePropertyName(),
        };
    }

    static getNewItemIndex() { return -1; }

    static getTaskIdPropertyName() { return "taskId"; }
    static getTaskCompletedPropertyName() { return "taskCompleted"; }
    static getTaskAttachmentFileNamePropertyName() { return "taskAttachmentFileName"; }
    static getTaskAttachmentPathPropertyName() { return "taskAttachmentPath"; }
    static getTaskNamePropertyName() { return "taskName"; }
    static getTaskDatePropertyName() { return "taskDate"; }

    static transformToTask(obj) {
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


