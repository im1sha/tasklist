const path = require('path');
const fs = require('fs');
const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const fileUpload = require('express-fileupload');

const taskWorker = require('./task-worker');

const indexRouter = require('./routes/index');
const downloadRouter = require('./routes/download');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(fileUpload());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/download', downloadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

function initializeStorage() {
    global.tasksDirectory = './tasks/';
    global.tasksPath = path.join(tasksDirectory, 'tasks.dat');
    global.attachmentsDirectory = path.join(tasksDirectory, 'attachments/');
    global.updateStorage = function() {
        fs.writeFileSync(tasksPath, taskWorker.serializeTaskArray(tasks));
    };

    if (!fs.existsSync(tasksDirectory)) {
        fs.mkdirSync(tasksDirectory);
    }
    if (!fs.existsSync(attachmentsDirectory)) {
        fs.mkdirSync(attachmentsDirectory);
    }

    if (fs.existsSync(tasksPath)) {
        global.tasks = taskWorker.deserializeTaskArray(fs.readFileSync(tasksPath));
    } else {
        global.tasks = [];
    }

    updateStorage();
}

initializeStorage();

module.exports = app;
