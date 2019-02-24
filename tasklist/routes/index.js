var express = require('express');


var router = express.Router();

const totalTasks = 5;
const newText  = {
  title : "Task",
  state : "Completed",
  date : "Date",
  loadedFile : "",
};





/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('task', {
    title: newText.title,
    state: newText.state,
    date: newText.date,
    loadedFile : newText.loadedFile,
    emailsVisible: true,
    emails: ["1@gmail.com", "2@gmail.com"],
    phone: "+1234567890",
  });
});

module.exports = router;
