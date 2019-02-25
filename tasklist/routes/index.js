const express = require('express');
const router = express.Router();

const totalTasks = 5;
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
    title: "TITLE",
    id: "id",
    name: "task",
    date: "date",
    attachment: "attachment",
    edit: "edit",
    isCompleted: "completed",
    remove: "remove",
    save: "save",
    reset: "reset",
    changeState: "change state",
    content: content,
  });
});

module.exports = router;
