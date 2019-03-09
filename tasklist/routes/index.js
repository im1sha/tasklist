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

const hiddenInputFields = {
    isMainFormEdited : 'isMainFormEdited',
    isMainForm : 'isMainForm',
    taskId : 'taskId',
    complete : 'complete',
    edit : 'edit',
    remove : 'remove',
};

const localization = {
    titleText: "Task list",

    // LABELS
    idText: "",
    nameText: "Task",
    dateText: "Date",
    completedText: "",
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

const defaultPlaceholders = {
    taskDateValue:"",
    taskAttachmentValue:"",
    taskNameValue : "* required",
};

const NEW_ITEM_INDEX = -1;

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

router.get('/', renderPage);


router.post('/', (req, res) => {
    let currentTaskNumber = NEW_ITEM_INDEX;
    let isMainFormEdited = false;

    if ((req.body[hiddenInputFields.isMainForm] === "true") &&
        (req.body[hiddenInputFields.isMainFormEdited] === "true")) {
        //
        // Working with main form
        //
        // main form & editing existing task
        editTask(req);

    } else if ((req.body[hiddenInputFields.isMainForm] === "true") &&
        (req.body[hiddenInputFields.isMainFormEdited] !== "true")) {
        // main form & creating new task
        addTask(req);

    } else if ((req.body[hiddenInputFields.isMainForm] !== "true") &&
        (req.body[hiddenInputFields.edit] === "true")) {
        //
        // Working with another form
        //
        // request to edit existing task
        currentTaskNumber = getIndexOfRequestedItem(req);
        isMainFormEdited = true;

    } else if ((req.body[hiddenInputFields.isMainForm] !== "true") &&
        (req.body[hiddenInputFields.remove] === "true")) {
        // delete existing task
        deleteTask(req);

    } else if ((req.body[hiddenInputFields.isMainForm] !== "true") &&
        (req.body[hiddenInputFields.complete] === "true")) {
        // complete existing task
        completeTask(req);
    }


    let placeholders;
    if  (isMainFormEdited !== true){
        placeholders = {
            taskDateValue:defaultPlaceholders.taskDateValue,
            taskAttachmentValue:defaultPlaceholders.taskAttachmentValue,
            taskNameValue : defaultPlaceholders.taskNameValue,
        };
    } else {
        placeholders = getPlaceholders(req);
    }

    renderPage(req, res, isMainFormEdited,
        currentTaskNumber, placeholders);
    updateStorage();
});


function getPlaceholders(req){
    let index = getIndexOfRequestedItem(req);
    const requiredLength = 2;

    let year = tasks[index].taskDate.getFullYear().toString();
    let month = tasks[index].taskDate.getMonth().toString();
    let date = tasks[index].taskDate.getDate().toString();

    const pad = "00";
    const padYear = "0000";
    month = pad.substring(0, pad.length - month.length) + month;
    date = pad.substring(0, pad.length - date.length) + date;
    year = padYear.substring(0, padYear.length - year.length) + year;

    let formattedDateTime = year + '-' + month + '-' + date + 'T00:00';

    //"2017-06-01T08:30"

    return {
        taskDateValue:
            formattedDateTime,
        taskAttachmentValue:
            tasks[index].taskAttachmentFileName,
        taskNameValue:
            tasks[index].taskName,
    };
}

function renderPage(req, res,
                    edit = false,
                    mainFormTaskNumber = NEW_ITEM_INDEX,
                    mainFormPlaceholders = defaultPlaceholders) {
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
        resetText: localization.resetText,
        downloadText: localization.downloadText,
        completeText: localization.completeText,

        completedStatus: localization.completedStatus,
        nonCompletedStatus: localization.nonCompletedStatus,

        taskAttachmentValue:mainFormPlaceholders.taskAttachmentValue,
        taskDateValue:mainFormPlaceholders.taskDateValue,
        taskNameValue:mainFormPlaceholders.taskNameValue,

        isMainFormEdited: edit
            ? "true"
            : "",
        mainFormTaskId: mainFormTaskNumber.toString(),
    });
}

function editTask(req) {
    addTask(req, parseInt(req.body[hiddenInputFields.taskId]));
}

// Returns index of task to edit
function getIndexOfRequestedItem(req) {
    return parseInt(req.body[hiddenInputFields.taskId]);
}

function deleteTask(req) {
    tasks.splice(parseInt(req.body[taskProperties.taskId]), 1);
}

function completeTask(req) {
    tasks[parseInt(req.body[taskProperties.taskId])].complete();
}

function addTask(req, id = NEW_ITEM_INDEX) {
    let attachmentPath = null;
    let attachmentName = "No file";

    const attachment =
        (req.files === undefined)
        ? undefined
        : req.files[taskProperties.taskAttachmentFileName];


    if ((id > tasks.length || id < 0) && (id !== NEW_ITEM_INDEX)) {
        throw new Error();
    }
    const newTaskId = (id === NEW_ITEM_INDEX) ? tasks.length : id;


    if (attachment !== undefined) {
        const attachmentDir =
            attachmentsDirectory +
            newTaskId +
            path.sep;

        if (!fs.existsSync(attachmentDir)){
            fs.mkdirSync(attachmentDir);
        }
        attachmentName =  attachment.name;
        attachmentPath = attachmentDir + attachmentName;

        // mv() - A function to move the file elsewhere on your server
        attachment.mv(attachmentPath);
    }

    //taskName, taskDate, taskAttachmentPath = null, taskAttachmentFileName = null
    tasks[newTaskId] = new Task(
        req.body[taskProperties.taskName],
        new Date(req.body[taskProperties.taskDate]),
        attachmentPath,
        attachmentName
    );
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

    if (task.taskAttachmentPath === null) {
        taskEntry.taskAttachmentDisabled = 'disabled';
    } else {
        taskEntry.taskAttachmentDisabled = '';
    }

    if (taskEntry.taskExpired === true) {
        taskEntry.expiredClass = 'class=expired';
    } else {
        taskEntry.expiredClass = '';
    }

    return taskEntry;
}


module.exports = router;


