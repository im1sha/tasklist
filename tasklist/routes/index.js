const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Task = require('../task');

// {
// id: 1,
// name : "Task1",
// completed : true,
// date : "Date",
// attachment : "File1",
// }

const localization = {
    titleText: "Task list",

    // LABELS
    idText: "",
    nameText: "Task",
    dateText: "Date",
    completedText: "Completed",
    attachmentText: "",

    // Buttons content
    editText: "edit",
    removeText: "remove",
    saveText: "save",
    resetText: "reset",
    downloadText: "download",
    completeText: "complete",

    completed: 'Completed',
    incomplete: 'Incomplete',
};

const taskProperties = {
    taskId: "taskId",
    taskCompleted: "taskCompleted",
    taskAttachmentFileName: "taskAttachmentFileName",
    taskAttachmentPath: "taskAttachmentPath",
    taskName: "taskName",
    taskDate: "taskDate",
};

//
// <div id="user" data-id="1234567890"
// data-user="Вася Пупкин"
// data-date-of-birth="01.04.1990">Пользователь</div>
// <script>
// var el = document.getElementById('user');
// id = el.dataset.id; // Получаем значение атрибута data-id
// user = el.dataset.user;
// dob = el.dataset.dateOfBirth; // Получаем значение атрибута data-date-of-birth
// el.dataset.ban = 'Нет'; // Назначаем новый атрибут data-ban и его значение
// console.log(user); // Выводим в консоль значение переменной user
// console.log(dob); // Выводим в консоль значение переменной dob
// </script>
//

router.get('/', renderIndex);

router.post('/', (req, res) => {
    if (req.body[taskProperties.taskId] === "") {
        addTask(req, res);
    } else {
        completeTask(req, res);
    }
    updateStorage();
});

function renderIndex(req, res) {
    const renderTasks = [];

    if (isObjectEmpty(req.query)) {
        tasks.forEach((value, index) =>
            renderTasks.push(createTaskEntry(value, index))
        );
    // } else {
    //     const statuses = req.query[taskProperties.taskCompleted];
    //     let filters;
    //
    //     if (Array.isArray(statuses)) {
    //         filters = statuses;
    //     } else {
    //         filters = [];
    //         filters.push(statuses);
    //     }
    //
    //     let filteredTasks = tasks.filter(task =>
    //         filters.includes(task.isCompleted().toString())
    //     );
    //     for (let i = 0; i < filteredTasks.length; i++) {
    //         renderTasks.push(createTaskEntry(filteredTasks[i], i));
    //     }
    }

    res.render('index', {
        taskProperties: taskProperties,
        content: renderTasks,

        titleText: localization.titleText,
        // LABELS
        idText: localization.idText,
        nameText: localization.nameText,
        dateText: localization.dateText,
        completedText: localization.completedText,
        attachmentText: localization.attachmentText,

        // Buttons content
        editText: localization.editText,
        removeText: localization.removeText,
        saveText: localization.saveText,
        resetText: localization.removeText,
        downloadText: localization.downloadText,
        completeText: localization.completeText,

        completedStatus: localization.completedStatus,
        nonCompletedStatus: localization.nonCompletedStatus,
    });
}

function completeTask(req, res) {
    tasks[parseInt(req.body[taskProperties.taskId])].complete();
    renderIndex(req, res);
}

function addTask(req, res) {
    let attachmentPath = null;

    const attachment =
        (req.files === undefined)
        ? undefined
        : req.files[taskProperties.taskAttachmentFileName];

    const newTaskId = tasks.length;

    if (attachment !== undefined) {
        const attachmentDir =
            attachmentsDirectory +
            newTaskId +
            path.sep;

        if (!fs.existsSync(attachmentDir)){
            fs.mkdirSync(attachmentDir);
        }

        attachmentPath = attachmentDir + attachment.name;

        // mv() - A function to move the file elsewhere on your server
        attachment.mv(attachmentPath);
    }

    //taskName, taskDate, taskAttachmentPath = null, taskAttachmentFileName = null
    tasks[newTaskId] = new Task(
        req.body[taskProperties.taskName],
        new Date(req.body[taskProperties.taskDate]),
        attachmentPath,
        attachment.name
    );

    renderIndex(req, res);
}

function isObjectEmpty(obj) {
    return (Object.entries(obj).length === 0) &&
        (obj.constructor === Object);
}

function createTaskEntry(task, taskId) {
    const taskEntry = {
        taskId: taskId,
        taskName: task.taskName,
        taskAttachmentFileName: task.taskAttachmentFileName,
        taskAttachmentPath: task.taskAttachmentPath,
        taskExpired: !!task.isExpired()
    };

    taskEntry.taskDate =
        (task.taskDate.getDate()) + '/' +
        (task.taskDate.getMonth() + 1) + '/' +
        (task.taskDate.getFullYear());

    if (task.isCompleted()) {
        taskEntry.taskCompleted = true;
        taskEntry.taskCompletedText = localization.completed;
        taskEntry.taskCompletedDisabled = 'disabled';
    } else {
        taskEntry.taskCompleted = false;
        taskEntry.taskCompletedText = localization.incomplete;
        taskEntry.taskCompletedDisabled = '';
    }

    if (task.taskAttachmentFileName === null) {
        taskEntry.taskAttachmentDisabled = 'disabled';
    } else {
        taskEntry.taskAttachmentDisabled = '';
    }

    if (taskEntry.taskExpired === true) {
        taskEntry.expiredClass = 'class="expired"';
    } else {
        taskEntry.expiredClass = '';
    }

    return taskEntry;
}


module.exports = router;


