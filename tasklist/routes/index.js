const express = require('express');
const router = express.Router();

const totalTasks = 5;
const content  = [
  { title : "Task1",
    state : "Completed",
    date : "Date",
    loadedFile : "File1",} ,
  { title : "Task2",
    state : "Not Completed",
    date : "Date2",
    loadedFile : "File2",} ,
];





/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('tasklist', {
    title: "TITLE",
    content: content
  });
});

module.exports = router;
