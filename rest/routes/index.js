const express = require('express');
const router = express.Router();

const TaskWorker = require('../scripts/task-worker');
const worker = new TaskWorker();

const Constructor = require('../scripts/page-constructor');
const pageConstructor = new Constructor(worker);

// todo
//      if (!isEditRequest) worker.updateJsonStorage();


//201 Created
//204 No Content
//400 Bad Request
//404 Not Found


// todo check query content here ? OR on single router?
//  router.all();

router.param('id', function (req, res, next, id) {
    if(Constructor.retrieveIndexOfRequestedElement(id) === null){
        res.sendStatus(400).end();
    } else {
        next();
    }
});

router.get('/favicon.ico', (req, res) => res.sendStatus(204).end());


// downloads 1 attachment
router.get('/api/attachments/:id', (req, res) => {
    const pathToAttachment = worker.getAttachmentPathById(req.params);
    if (pathToAttachment) {
        res.status(200).download(pathToAttachment);
    } else {
        res.sendStatus(404).end();
    }
});

//
// returns default page
// client should ask for all the content if DOM is ready
//
router.get('/', (req, res) => {
    res.status(200).render('index', Constructor.getPlaceholders());
});

// gets all the tasks
router.get('/api/tasks', (req, res) => {
    const tasksToSend
        = pageConstructor.getFilteredTask(req.query);

    if (tasksToSend) {
        res.status(200).json(tasksToSend);
    } else {
        res.sendStatus(404).end();
    }
});

// gets 1 task
router.get('/api/tasks/:id', (req, res) => {

    const task = worker.getTaskDataById(req.params.id);
    if (task !== null) {
        res.status(200).json(task)
    } else {
        res.sendStatus(404).end();
    }
});

// removes 1 task
router.delete('/api/tasks/:id', (req, res) => {
    const status = pageConstructor.deleteTask(id);
    res.sendStatus(status).end();
});

// partial update of 1 task.
// it should process complete request here
router.patch('/api/tasks/:id', (req, res) => {
    const status = pageConstructor.patchTask(req.body, req.files, req.params.id);
    res.sendStatus(status).end();
});

// creates 1 task
router.post('/api/tasks', (req, res) => {
    const status = pageConstructor.createTask(req.body, req.files);
    res.sendStatus(status).end();
});

// changes 1 task
router.put('/api/tasks/:id', (req, res) => {
    const status = pageConstructor.updateTask(req.body,
        req.files, req.params.id);
    res.sendStatus(status).end();
});



module.exports = { router:router };


