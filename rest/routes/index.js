const express = require('express');
const router = express.Router();

const TaskWorker = require('../scripts/task-worker');
const worker = new TaskWorker();
const ClientUtils = require('../public/scripts/client-utils');
const Constructor = require('../scripts/page-constructor');
const pageConstructor = new Constructor(worker);

const statuses = ClientUtils.getStatusCodes();

// todo check query content here ? OR on single router?
//  router.all();

router.param('id', function (req, res, next, id) {
    if(Constructor.retrieveIndexOfRequestedElement(id) === null){
        res.sendStatus(statuses.badRequest).end();
    } else {
        next();
    }
});

router.get('/favicon.ico', (req, res) =>
    res.sendStatus(statuses.successNoContent).end()
);

// downloads 1 attachment
router.get('/api/attachments/:id', (req, res) => {
    const pathToAttachment = worker.getAttachmentPathById(req.params);
    if (pathToAttachment) {
        res.status(statuses.ok).download(pathToAttachment);
    } else {
        res.sendStatus(statuses.notFound).end();
    }
});


// returns default page
// client should ask for all the content if DOM is ready
router.get('/', (req, res) => {
    res.status(statuses.ok).render('index', Constructor.getPlaceholders());
});

// gets all the tasks
router.get('/api/tasks', (req, res) => {
    const tasksToSend
        = pageConstructor.getFilteredTask(req.query);

    if (tasksToSend) {
        res.status(statuses.ok).json(tasksToSend);
    } else {
        res.sendStatus(statuses.notFound).end();
    }
});

// gets 1 task
router.get('/api/tasks/:id', (req, res) => {

    const task = worker.getTaskDataById(req.params.id);
    if (task !== null) {
        res.status(statuses.ok).json(task)
    } else {
        res.sendStatus(statuses.notFound).end();
    }
});

//
// following routers change state of server's file storage
// so there is last router which updates JSON storage file
//

// removes 1 task
router.delete('/api/tasks/:id', (req, res) => {
    const status = pageConstructor.deleteTask(id);
    res.sendStatus(status).end();
    next('route');
});

// partial update of 1 task.
// it should process complete request here
router.patch('/api/tasks/:id', (req, res) => {
    const status = pageConstructor.patchTask(req.body, req.files, req.params.id);
    res.sendStatus(status).end();
    next('route');
});

// creates 1 task
router.post('/api/tasks', (req, res) => {
    const status = pageConstructor.createTask(req.body, req.files);
    res.sendStatus(status).end();
    next('route');
});

// changes 1 task
router.put('/api/tasks/:id', (req, res) => {
    const status = pageConstructor.updateTask(req.body,
        req.files, req.params.id);
    res.sendStatus(status).end();
    next('route');
});


router.all('/', (req, res) => worker.updateJsonStorage());

module.exports = { router:router };


