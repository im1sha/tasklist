const path = require('path');
const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload');

//
// "mongodb": "^3.0.15",
// "monk": "^6.0.5"
//const mongo = require('mongodb');
// const monk = require('monk');
// const db = monk('localhost:27017/tasklist');

const indexModule = require('./routes/index');
const index = indexModule.router;

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cookieParser());

app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// app.use(function(req, res, next){
//     req.db = db;
//     next();
// });

app.use('/', index);

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


module.exports = app;


