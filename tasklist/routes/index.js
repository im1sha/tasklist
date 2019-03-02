const express = require('express');
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended: false});
const app = express();
const router = express.Router();

const content  = [
  { id: 1,
    name : "Task1",
    completed : true,
    date : "Date",
    attachment : "File1",} ,
  { id: 2,
    name : "Task2",
    completed : false,
    date : "Date2",
    attachment : "File2",} ,
];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('tasklist', {
    title: "Task List",
    taskId: "id",
    currentId: "0",
    taskName: "task name",
    actions: "",
    dateText: "date",
    attachmentText: "attachment",
    editText: "edit",
    isCompleted: "completed",
    removeText: "remove",
    saveText: "save",
    resetText: "reset",
    completeText: "complete",
    completeButtonName: "completeButton",
    editButtonName: "editButton",
    removeButtonName: "removeButton",
    content: content,
  });
});


module.exports = router;
