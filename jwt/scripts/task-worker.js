const path = require('path');
const fs = require('fs');
const Task = require('./task');
const AttachmentsHelper = require('./attachments-helper');
const StorageHelper = require('./storage-helper');

const ClientUtils = require('../public/scripts/client-utils');

const taskProperties = Task.getPropertiesNamesAsList();
const statuses = ClientUtils.getStatusCodes();


//
// code that uses this class should call updateJsonStorage()
//  todo
//  implement router that calls updateJsonStorage()
//  implement router that updates attachment storage
//

class TaskWorker {

    constructor() {
        this.tasks = [];
        this.initializeJsonStorage();
        this.initializeAttachmentsStorage()
    }

    ///
    /// Path constants
    ///

    getTasksDirectory() {
        return './tasks';
    }
    getTasksPath() {
        return path.join(this.getTasksDirectory(),'tasks.dat');
    }
    getAttachmentsDirectory() {
        return path.join(this.getTasksDirectory(), 'attachments');
    }

    ///
    /// Working with storage
    ///

    updateJsonStorage() {
        StorageHelper.updateJsonStorage(this.getTasksPath(), this.tasks);
    }

    initializeJsonStorage() {
        this.tasks = StorageHelper.initializeJsonStorage(
            this.getTasksDirectory(),
            this.getTasksPath(),
            Task.fromObject // parser
        );
    }

    initializeAttachmentsStorage() {
        if (!fs.existsSync(this.getAttachmentsDirectory())) {
            fs.mkdirSync(this.getAttachmentsDirectory());
        }
    }

    ///
    /// Getting task info
    ///

    isItemExists(id) {
        return Boolean(this.tasks[id]);
    }
    getNewItemIndex(){
        return (this.tasks === null)
            ? 0
            : this.tasks.length;
    }

    getAttachmentPathById(params){
        if (this.tasks[Number(params.id)]) {
            return this.tasks[Number(params.id)].getAttachmentPath();
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

    ///
    /// Changing operations
    ///

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
        AttachmentsHelper.deleteFolderWithAttachment(path.join(this.getAttachmentsDirectory(), String(id)));
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

        if (properties[ClientUtils.getTaskShouldUpdateAttachmentPropertyName()] === true) {
            let result;
            if (attachment) {
                result = AttachmentsHelper.rewriteFolderWithAttachment(this.getAttachmentsDirectory(), String(taskId), attachment);
            } else {
                AttachmentsHelper.deleteFolderWithAttachment(path.join(this.getAttachmentsDirectory(), String(taskId)));
            }
            task.changeAttachment(
                result ? result.attachmentPath : null,
                result ? result.attachmentName : "No file");
        }

        return statuses.successNoContent;
    }
    createTask(properties, attachment) {

        if (!Task.isValidObject(properties, false)) {
            return {status: statuses.unprocessableEntity, newItemIndex: null};
        }

        const taskId = this.getNewItemIndex();
        const createResult =
            AttachmentsHelper.rewriteFolderWithAttachment(
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

        return {status: statuses.created, newItemIndex: taskId};
    }
}


module.exports = TaskWorker;
