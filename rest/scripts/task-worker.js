const path = require('path');
const fs = require('fs');
const Task = require('./task');
const Utils  = require('./utils');

const taskProperties = Task.getPropertiesNamesAsList();
const NEW_ITEM_INDEX = Task.getNewItemIndex();

const statuses = {
    successNoContent: 204,
    notFound: 404,
    unprocessableEntity: 422,
};

//
// code that uses this class should call updateJsonStorage()
// todo
//  implement router that calls updateJsonStorage()
//  ? implement router that updates attachment storage ?
//

class TaskWorker {

    constructor() {
        this.tasks = [];
        this.initializeJsonStorage();
        this.initializeAttachmentsStorage()
    }

    getImplementedStatuses(){
        return {...statuses};
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

    isItemExists(id) {
        return Boolean(this.tasks[id]);
    }
    getNewItemIndex(){
        return (this.tasks === null)
            ? 0
            : this.tasks.length;
    }

    getAttachmentPathById(id){
        if (this.tasks[id]) {
            return this.tasks[id].getAttachmentPath();
        }
        return null;
    }
    getTasksData() {
        const tasks = [];
        for (let value of this.tasks) {
            if (value) {
                tasks.push(value.getData());
            }
        }
        return tasks;
    }
    getTaskDataById(id){
        if (this.tasks[id]) {
            return this.tasks[id].getData();
        }
        return null;
    }

    completeTask(id) {

        if (!this.isItemExists(id)) {
            return statuses.notFound;
        }

        this.tasks[id].changeCompleteness(true);

        return statuses.successNoContent;
    }

    //
    // deleteTask() / changeTask() / createTask() affect filesystem
    //

    deleteTask(id) {
        if (!this.isItemExists(id)) {
            return statuses.notFound;
        }

        this.tasks[id] = null;
        Utils.deleteFolderWithAttachment(path.join(this.getAttachmentsDirectory(), String(id)));
        return statuses.successNoContent;
    }

    // properties is { },
    // following properties of this object are defined:
    // properties[taskProperties.taskDate]
    // properties[taskProperties.taskCompleted]
    // properties[taskProperties.taskName]
    // etc

    changeTask(properties, attachment, taskId) {

        if (!this.isItemExists(taskId)) {
           return statuses.notFound;
        }
        if (!Task.isValidObject(properties, false)) {
            return statuses.unprocessableEntity;
        }

        const task = this.tasks[taskId];
        task.changeDate(new Date(properties[taskProperties.taskDate]));
        task.changeName(properties[taskProperties.taskName]);
        task.changeCompleteness(properties[taskProperties.taskCompleted]);

        if (properties[Task.getTaskShouldUpdateAttachmentPropertyName()] === true) {
            let result;
            if (attachment) {
                result = Utils.rewriteFolderWithAttachment(this.getAttachmentsDirectory(), String(taskId), attachment);
            } else {
                Utils.deleteFolderWithAttachment(path.join(this.getAttachmentsDirectory(), String(taskId)));
            }
            task.changeAttachment(
                result ? result.attachmentPath : null,
                result ? result.attachmentName : "No file");
        }

        return statuses.successNoContent;
    }
    createTask(properties, attachment) {

        if (!Task.isValidObject(properties, false)) {
            return statuses.unprocessableEntity;
        }

        const taskId = this.getNewItemIndex();
        const createResult =
            Utils.rewriteFolderWithAttachment(
                this.getAttachmentsDirectory(),
                String(taskId),
                attachment);

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

        return statuses.successNoContent;
    }
}


module.exports = TaskWorker;
