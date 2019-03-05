let fs = require('fs');

class Task {
    constructor(taskName, taskDate, taskAttachmentPath = null, taskAttachmentFileName = null) {
        this.taskAttachmentFileName = taskAttachmentFileName;
        this.taskAttachmentPath = taskAttachmentPath;
        this.taskDate = taskDate;
        this.taskName = taskName;
        this.taskCompleted = false;
    }

    isCompleted() {
        return this.taskCompleted;
    }

    isExpired() {
        return (!this.isCompleted() && (this.taskDate < new Date()));
    }

    complete() {
        this.taskCompleted = true;
    }

    static transformToTask(obj) {
        if (!obj.hasOwnProperty('taskName')
            || !obj.hasOwnProperty('taskDate')
            || !obj.hasOwnProperty('taskCompleted')
            || !obj.hasOwnProperty('taskAttachmentFileName')
            || !obj.hasOwnProperty('taskAttachmentPath')
            || isNaN(Date.parse(obj.taskDate))
            || ((obj.taskAttachmentPath !== null)
                && !fs.existsSync(obj.taskAttachmentPath))) {
            return null;
        } else {
            const task = new Task(
                obj.taskName,
                new Date(obj.taskDate),
                obj.taskAttachmentPath,
                obj.taskAttachmentFileName
            );
            task.taskCompleted = obj.taskCompleted;
            return task;
        }
    }
}

module.exports = Task;