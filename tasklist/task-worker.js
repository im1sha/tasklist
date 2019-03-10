let Task = require('./task');

const path = require('path');
const fs = require('fs');

class TaskWorker {

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
        fs.writeFileSync(this.getTasksPath(), this.serialize(this.tasks));
    }

    initializeStorage() {

        if (!fs.existsSync(this.getTasksDirectory())) {
            fs.mkdirSync(this.getTasksDirectory());
        }
        if (!fs.existsSync(this.getAttachmentsDirectory())) {
            fs.mkdirSync(this.getAttachmentsDirectory());
        }

        if (fs.existsSync(this.getTasksPath())) {
            this.tasks = this.deserialize(fs.readFileSync(this.getTasksPath()));
        } else {
            this.tasks = [];
        }

        this.updateStorage();
    }

}


module.exports = TaskWorker;
