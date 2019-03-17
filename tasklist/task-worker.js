const Task = require('./task');
const Utils  = require('utils');

const taskProperties = Task.getRenderedPropertiesNamesAsList();
const NEW_ITEM_INDEX = Task.getNewItemIndex();

const path = require('path');
const fs = require('fs');

class TaskWorker {

    #tasks = [];

    constructor() { }

    #serialize(taskArray) {
        return JSON.stringify(taskArray);
    }
    #deserialize(jsonString) {
        const deserialized = JSON.parse(jsonString);
        const taskArray = [];

        if (Array.isArray(deserialized)) {
            deserialized.forEach(function (element) {
                let task = Task.fromObject(element);
                if (task != null) {
                    taskArray.push(task);
                }
            });
        }

        return taskArray;
    }

    #getTasksDirectory() {
        return './tasks';
    }
    #getTasksPath() {
        return path.join(this.#getTasksDirectory(),'tasks.dat');
    }
    #getAttachmentsDirectory() {
        return path.join(#getTasksDirectory(), 'attachments');
    }

    updateStorage() {

        // TODO : delete files of removed items

        fs.writeFileSync(this.#getTasksPath(), this.#serialize(this.#tasks));
    }
    initializeStorage() {

        if (!fs.existsSync(#getTasksDirectory())) {
            fs.mkdirSync(#getTasksDirectory());
        }
        if (!fs.existsSync(#getAttachmentsDirectory())) {
            fs.mkdirSync(#getAttachmentsDirectory());
        }

        if (fs.existsSync(#getTasksPath())) {
            this.#tasks = #deserialize(fs.readFileSync(#getTasksPath()));
        }

        this.updateStorage();
    }

    #getTasksCount() {
        return (this.#tasks === null)
            ? 0
            : this.#tasks.length;
    }
    isIndexValid(id) {
        return !((id > this.#getTasksCount() || id < 0) && (id !== NEW_ITEM_INDEX));
    }
    getNewItemIndex(){
        return this.#getTasksCount();
    }

    getTasksAsRenderedData() {
        const copy = [];
        for (let value of this.#tasks) {
            if (value) {
                copy.push(value.getRenderedData());
            }
        }
        return copy;
    }

    deleteTask(id) {
        this.#tasks.splice(id, 1);
    }
    completeTask(id) {
        this.#tasks[id].complete();
    }
    #changeTask(properties, attachment, taskId) {
        const task = this.#tasks[taskId];
        task.changeDate(new Date(properties[taskProperties.taskDate]));
        task.changeName(properties[taskProperties.taskName]);
        task.changeCompleteness(properties[taskProperties.taskCompleted]);
        if (attachment) {
            const pathOfAttachmentDir = path.join(#getAttachmentsDirectory(), taskId);
            const pathOfAttachmentFile = path.join(pathOfAttachmentDir, attachment.name);
            Utils.emptyDirectory(pathOfAttachmentDir);
            Utils.moveFileInDir(attachment, pathOfAttachmentDir);
            task.changeAttachment(pathOfAttachmentFile, attachment.name);
        }
    }
    #createTask(properties, attachment, taskId) {
        const createResult =  Utils.moveFileInNewDirectory(this.#getAttachmentsDirectory(), taskId, attachment);

        this.#tasks[taskId] = new Task(
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
    insertTask(properties, attachment, id = NEW_ITEM_INDEX) {

        if (!this.isIndexValid(id)) {
            throw new Error("invalid index passed");
        }
        const isTaskNew = id === NEW_ITEM_INDEX;
        const taskId = isTaskNew ? this.getNewItemIndex() : id;

        if (isTaskNew)  {
            #createTask(properties, attachment, taskId);
        } else {
            #changeTask(properties, attachment, taskId);
        }
    }
}


module.exports = TaskWorker;
