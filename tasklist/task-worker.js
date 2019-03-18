const Task = require('./task');
const Utils  = require('./utils');

const taskProperties = Task.getRenderedPropertiesNamesAsList();
const NEW_ITEM_INDEX = Task.getNewItemIndex();

const path = require('path');
const fs = require('fs');

class TaskWorker {

    constructor() {
        this.tasks = [];
        this.initializeJsonStorage();
        this.initializeAttachmentsStorage()
    }

    getTasksDirectory() {
        return './tasks';
    }
    getTasksPath() {
        return path.join(this.getTasksDirectory(),'tasks.dat');
    }
    getAttachmentsDirectory() {
        return path.join(this.getTasksDirectory(), 'attachments');
    }

    serialize(taskArray) {
        return JSON.stringify(taskArray);
    }
    deserialize(jsonString) {
        const deserialized = JSON.parse(jsonString);
        const taskArray = [];

        if (Array.isArray(deserialized)) {
            deserialized.forEach(e => taskArray.push(Task.fromObject(e)));
        }

        return taskArray;
    }

    updateJsonStorage() {
       fs.writeFileSync(this.getTasksPath(), this.serialize(this.tasks));
    }
    initializeJsonStorage() {
        if (!fs.existsSync(this.getTasksDirectory())) {
            fs.mkdirSync(this.getTasksDirectory());
        }
        if (fs.existsSync(this.getTasksPath())) {
            this.tasks = this.deserialize(fs.readFileSync(this.getTasksPath()));
        }
        this.updateJsonStorage();
    }
    initializeAttachmentsStorage() {
        if (!fs.existsSync(this.getAttachmentsDirectory())) {
            fs.mkdirSync(this.getAttachmentsDirectory());
        }
    }

    getTasksCount() {
        return (this.tasks === null)
            ? 0
            : this.tasks.length;
    }
    isIndexValid(id) {
        return !((id > this.getTasksCount() || id < 0) && (id !== NEW_ITEM_INDEX));
    }
    getNewItemIndex(){
        return this.getTasksCount();
    }

    getTasksAsRenderedData() {
        const tasks = [];
        for (let value of this.tasks) {
            if (value) {
                tasks.push(value.getRenderedData());
            }
        }
        return tasks;
    }

    completeTask(id) {
        this.tasks[id].changeCompleteness(true);
    }

    //
    // deleteTask() / changeTask() / createTask() affects filesystem
    //

    deleteTask(id) {
        this.tasks[id] = null;
        Utils.deleteFolderWithAttachment(path.join(this.getAttachmentsDirectory(), String(id)));
    }
    changeTask(properties, attachment, rewriteAttachment, taskId) {
        const task = this.tasks[taskId];
        task.changeDate(new Date(properties[taskProperties.taskDate]));
        task.changeName(properties[taskProperties.taskName]);
        task.changeCompleteness(properties[taskProperties.taskCompleted]);
        if (rewriteAttachment) {
            let result;
            if (attachment) {
                result = Utils.rewriteFolderWithAttachment(this.getAttachmentsDirectory(), String(taskId), attachment);
            } else {
                Utils.deleteFolderWithAttachment(path.join(this.getAttachmentsDirectory(), String(taskId)));
            }
            task.changeAttachment(result ? result.attachmentPath : null, result ? result.attachmentName : "No file");
        }
    }
    createTask(properties, attachment, rewriteAttachment, taskId) {
        const createResult = Utils.rewriteFolderWithAttachment(this.getAttachmentsDirectory(), taskId, attachment);

        this.tasks[taskId] = new Task(
            taskId,
            properties[taskProperties.taskName],
            new Date(properties[taskProperties.taskDate]),
            createResult.attachmentPath,
            createResult.attachmentName === null
                ? "No file"
                : createResult.attachmentName,
            properties[taskProperties.taskCompleted]
        );
    }


    // properties is { },
    // following properties of this object are defined:
    // properties[taskProperties.taskDate]
    // properties[taskProperties.taskCompleted]
    // properties[taskProperties.taskName]

    // attachment is undefined or file
    insertTask(properties, attachment, rewriteAttachment, id = NEW_ITEM_INDEX) {

        if (!this.isIndexValid(id)) {
            throw new Error("invalid index passed");
        }
        const isTaskNew = id === NEW_ITEM_INDEX;
        const taskId = isTaskNew ? this.getNewItemIndex() : id;

        if (isTaskNew)  {
            this.createTask(properties, attachment, rewriteAttachment, taskId);
        } else {
            this.changeTask(properties, attachment, rewriteAttachment, taskId);
        }
    }
}


module.exports = TaskWorker;
