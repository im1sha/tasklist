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
  title: "Task List",
  newId: "-1",

  // LABELS
  taskIdText: "",
  taskNameText: "Task",
  dateText: "Date",
  completedText: "Completed",
  attachmentText: "",
  actionsText: "",

  // Button values
  editText: "edit",
  removeText: "remove",
  saveText: "save",
  resetText: "reset",
  downloadText: "download",
  completeText: "complete",

  // BUTTONS
  completeButtonName: "completeButton",
  editButtonName: "editButton",
  removeButtonName: "removeButton",
  downloadButtonName: "downloadButton",

  completedStatus: 'Completed',
  nonCompletedStatus: 'Not completed'
};

router.get('/', renderIndex);

router.post('/', function (req, res) {
  if (req.body['taskIdText'] === undefined) {
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
  } else {
    const statuses = req.query['isCompleted'];
    let filters;

    if (Array.isArray(statuses)) {
      filters = statuses;
    } else {
      filters = [];
      filters.push(statuses);
    }

    let filteredTasks = tasks.filter((task) =>
        filters.includes(task.isCompleted().toString())
    );
    for (let i = 0; i < filteredTasks.length; ++i) {
      renderTasks.push(createTaskEntry(filteredTasks[i], i))
    }
  }

  res.render('index', {
    content: renderTasks,
    title: localization.title,
    newId: localization.newId,

    // LABELS
    taskIdText: localization.taskIdText,
    taskNameText: localization.taskNameText,
    dateText: localization.dateText,
    completedText: localization.completedText,
    attachmentText: localization.attachmentText,
    actionsText: localization.actionsText,

    // Button values
    editText: localization.editText,
    removeText: localization.removeText,
    saveText: localization.saveText,
    resetText: localization.removeText,
    downloadText: localization.downloadText,
    completeText: localization.completedText,

    // BUTTONS
    completeButtonName: localization.completeButtonName,
    editButtonName: localization.editButtonName,
    removeButtonName: localization.removeButtonName,
    downloadButtonName: localization.downloadButtonName,

    completedStatus: localization.completedStatus,
    nonCompletedStatus: localization.nonCompletedStatus,
  });
}

function completeTask(req, res) {
  tasks[parseInt(req.body['taskIdText'])].complete();
  renderIndex(req, res);
}

function addTask(req, res) {
  let attachmentFileName = null;

  const attachment = req.files['taskAttachment']; // TO-DO !!
  const newTaskId = tasks.length;

  if (attachment !== undefined) {
    const attachmentPath =
        attachmentsDirectory +
        newTaskId +
        path.sep;

    if (!fs.existsSync(attachmentPath)){
      fs.mkdirSync(attachmentPath);
    }

    attachmentFileName = attachmentPath + attachment.name;

    // mv()
    // A function to move the file elsewhere on your server
    attachment.mv(attachmentFileName);
  }

  tasks[newTaskId] = new Task(
      req.body['taskNameText'],
      new Date(req.body['expectedCompleteDate']),
      attachmentFileName
  );

  renderIndex(req, res);
}

function isObjectEmpty(obj) {
  return (Object.entries(obj).length === 0) &&
      (obj.constructor === Object);
}

function createTaskEntry(task, taskId) {
  const taskEntry = {
    taskIdText: taskId,
    taskNameText: task.name,
    taskAttachment: task.attachmentFileName,
  };

  taskEntry.expectedCompleteDate =
      (task.completeDate.getDate()) + '/' +
      (task.completeDate.getMonth() + 1) + '/' +
      (task.completeDate.getFullYear());

  if (task.isCompleted()) {
    taskEntry.taskStatus = localization.completedStatus;
    taskEntry.completeTaskDisabled = 'disabled';
  } else {
    taskEntry.taskStatus = localization.nonCompletedStatus;
    taskEntry.completeTaskDisabled = '';
  }

  if (task.attachmentFileName === null) {
    taskEntry.downloadAttachmentDisabled = 'disabled';
  } else {
    taskEntry.downloadAttachmentDisabled = '';
  }

  taskEntry.isExpired = !!task.isExpired();

  return taskEntry;
}


module.exports = router;
