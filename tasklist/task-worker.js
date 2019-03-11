const Task = require('./task');
const NEW_ITEM_INDEX = Task.getNewItemIndex();

const path = require('path');
const fs = require('fs');

class TaskWorker {

    #tasks = [];

    constructor() { }

    serialize(taskArray) {
        return JSON.stringify(taskArray);
    }

    deserialize(jsonString) {
        const deserialized = JSON.parse(jsonString);
        const taskArray = [];

        if (Array.isArray(deserialized)) {
            deserialized.forEach(function (element) {
                let task = Task.transformToTask(element);
                if (task != null) {
                    taskArray.push(task);
                }
            });
        }

        return taskArray;
    }

    getTasksDirectory() {
        return './tasks/';
    }

    getTasksPath() {
        return path.join(this.getTasksDirectory(), 'tasks.dat');
    }

    getAttachmentsDirectory() {
        return path.join(this.getTasksDirectory(), 'attachments/');
    }

    updateStorage() {

        // TODO : delete files of removed items

        fs.writeFileSync(this.getTasksPath(), this.serialize(this.#tasks));

    }

    initializeStorage() {

        if (!fs.existsSync(this.getTasksDirectory())) {
            fs.mkdirSync(this.getTasksDirectory());
        }
        if (!fs.existsSync(this.getAttachmentsDirectory())) {
            fs.mkdirSync(this.getAttachmentsDirectory());
        }

        if (fs.existsSync(this.getTasksPath())) {
            this.#tasks = this.deserialize(fs.readFileSync(this.getTasksPath()));
        }

        this.updateStorage();
    }

    deleteTask(taskId) {
        this.#tasks.splice(taskId, 1);
    }

    completeTask(taskId) {
        this.#tasks[taskId].complete();
    }

    insertTask(newTask, id = NEW_ITEM_INDEX) {

        if (!this.isIndexValid(id)) {
            throw new Error();
        }

        const newTaskId = (id === NEW_ITEM_INDEX) ? this.#tasks.length : id;
        this.#tasks[newTaskId] = newTask;
    }

    #getTasksCount() {
        return (this.#tasks === null)
            ? 0
            : this.#tasks.length;
    }

    isIndexValid(id) {
        if ((id > this.#getTasksCount() || id < 0) && (id !== NEW_ITEM_INDEX)) {
            return false;
        }
        return true;
    }

    getNewItemIndex(){
        return this.#getTasksCount();
    }


}


module.exports = TaskWorker;
