const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');


const Task = require('../task');
const TaskWorker = require('../task-worker');


const worker = new TaskWorker();

// transferred by post method
const hiddenInputFields = {
    isMainFormEdited : 'isMainFormEdited',
    isMainForm : 'isMainForm',
    taskId : 'taskId',
    complete : 'complete',
    edit : 'edit',
    remove : 'remove',
};

const defaultInputPlaceholders = {
    taskDateValue : "",
    taskAttachmentValue: "",
    taskNameBackValue: "* required",
    taskNameValue: "",
    checkboxHiddenValue: "disabled",
};

const defaultPlaceholders = {
    titleText: "Task list",

    // LABELS
    idText: "",
    nameText: "Task",
    dateText: "Date",
    completedText: "",
    attachmentText: "",

    // Submit buttons content
    editText: "edit",
    removeText: "remove",
    saveText: "save",
    resetText: "reset",
    downloadText: "download",
    completeText: "complete",

    // Current task status
    completed: 'Completed',
    incomplete: 'Incomplete',
};

const taskProperties = Task.getPropertiesNamesAsObjectOfStrings();

const NEW_ITEM_INDEX = Task.getNewItemIndex();
const MAX_DISPLAYED_LENGTH = 30;

worker.initializeStorage();

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
            taskDateValue: defaultInputPlaceholders.taskDateValue,
            taskAttachmentValue: defaultInputPlaceholders.taskAttachmentValue,
            taskNameValue : defaultInputPlaceholders.taskNameValue,
            taskNameBackValue : defaultInputPlaceholders.taskNameBackValue,
            checkboxHiddenValue: defaultInputPlaceholders.checkboxHiddenValue,
        };
    } else {
        placeholders = getPlaceholdersByRequest(req);
    }

    renderPage(req, res, isMainFormEdited, currentTaskNumber, placeholders);

    worker.updateStorage();

});

function getPlaceholdersByRequest(req) {

    let index = getIndexOfRequestedItem(req);

    let date = getDateAsObjectOfStrings(worker.tasks[index].taskDate);

    //"2017-06-01T08:30"
    let formattedDateTime = date.year + '-' +
        date.month + '-' + date.day +
        'T' + date.hours + ':' + date.minutes;

    return {
        taskDateValue:
            formattedDateTime,
        taskAttachmentValue:
            "",
        taskNameValue:
            worker.tasks[index].taskName,
        taskNameBackValue:
            worker.tasks[index].taskName,
        checkboxHiddenValue:
            "checked",
    };
}

function renderPage(req, res,
                    edit = false,
                    mainFormTaskNumber = NEW_ITEM_INDEX,
                    mainFormPlaceholders = defaultInputPlaceholders) {
    const renderTasks = [];

    if (isObjectEmpty(req.query)) {
        worker.tasks.forEach((value, index) =>
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
    //     let filteredTasks = taskWorker.tasks.filter(task =>
    //         filters.includes(task.isCompleted().toString())
    //     );
    //     for (let i = 0; i < filteredTasks.length; i++) {
    //         renderTasks.push(createTaskEntry(filteredTasks[i], i));
    //     }
    }

    res.render('index', {
        taskProperties: taskProperties,
        content: renderTasks,

        titleText: defaultPlaceholders.titleText,
        // LABELS
        idText: defaultPlaceholders.idText,
        nameText: defaultPlaceholders.nameText,
        dateText: defaultPlaceholders.dateText,
        completedText: defaultPlaceholders.completedText,
        attachmentText: defaultPlaceholders.attachmentText,

        // Buttons content
        editText: defaultPlaceholders.editText,
        removeText: defaultPlaceholders.removeText,
        saveText: defaultPlaceholders.saveText,
        resetText: defaultPlaceholders.resetText,
        downloadText: defaultPlaceholders.downloadText,
        completeText: defaultPlaceholders.completeText,

        completedStatus: defaultPlaceholders.completedStatus,
        nonCompletedStatus: defaultPlaceholders.nonCompletedStatus,

        taskAttachmentValue:mainFormPlaceholders.taskAttachmentValue,
        taskDateValue:mainFormPlaceholders.taskDateValue,
        taskNameValue:mainFormPlaceholders.taskNameValue,
        taskNameBackValue: mainFormPlaceholders.taskNameBackValue,
        checkboxHiddenValue: mainFormPlaceholders.checkboxHiddenValue,

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
    worker.tasks.splice(parseInt(req.body[taskProperties.taskId]), 1);
}

function completeTask(req) {
    worker.tasks[parseInt(req.body[taskProperties.taskId])].complete();
}

function addTask(req, id = NEW_ITEM_INDEX) {
    let attachmentPath = null;
    let attachmentName = "No file";

    const attachment =
        (req.files === undefined)
        ? undefined
        : req.files[taskProperties.taskAttachmentFileName];


    if ((id > worker.tasks.length || id < 0) && (id !== NEW_ITEM_INDEX)) {
        throw new Error();
    }
    const newTaskId = (id === NEW_ITEM_INDEX) ? worker.tasks.length : id;


    if (attachment !== undefined) {
        const attachmentDir =
            worker.getAttachmentsDirectory() +
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
    worker.tasks[newTaskId] = new Task(
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

// expected Date instance as parameter
function formatDateForOutput(date) {

    const dateObject = getDateAsObjectOfStrings(date);

    return dateObject.day + "-" +
        dateObject.month + "-" +
        dateObject.year + " " +
        dateObject.hours + ":" +
        dateObject.minutes;
}

function getDateAsObjectOfStrings(date) {
    const pad = "00";
    const padYear = "0000";

    let day = date.getDate().toString();
    let month = (date.getMonth() + 1).toString();
    let year = date.getFullYear().toString();
    let hours = date.getHours().toString();
    let minutes = date.getMinutes().toString();

    day = pad.substring(0, pad.length - day.length) + day;
    month = pad.substring(0, pad.length - month.length) + month;
    minutes = pad.substring(0, pad.length - minutes.length) + minutes;
    hours = pad.substring(0, pad.length - hours.length) + hours;
    year = padYear.substring(0, padYear.length - year.length) + year;

    return {
        day : day,
        month: month,
        minutes : minutes,
        hours: hours,
        year: year,
    };
}

function createTaskEntry(task, taskId) {
    const taskEntry = {
        taskId: taskId,
        taskName: task.taskName.substr(0, MAX_DISPLAYED_LENGTH),
        taskAttachmentFileName: task.taskAttachmentFileName.substr(0, MAX_DISPLAYED_LENGTH),
        taskAttachmentPath: task.taskAttachmentPath,
        taskExpired: !!task.isExpired()
    };

    taskEntry.taskDate = formatDateForOutput(task.taskDate);

    if (task.isCompleted()) {
        taskEntry.taskCompleted = true;
        taskEntry.taskCompletedText = defaultPlaceholders.completed;
        taskEntry.taskCompletedDisabled = 'disabled';
    } else {
        taskEntry.taskCompleted = false;
        taskEntry.taskCompletedText = defaultPlaceholders.incomplete;
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


module.exports = {router:router, taskWorker:worker};


