const express = require('express');
const router = express.Router();

const TaskWorker = require('../scripts/task-worker');
const UserWorker = require('../scripts/user-worker');
const SafetyWorker = require('../scripts/safety-worker');
const RequestHandler = require('../scripts/request-handler');

const taskWorker = new TaskWorker();
const userWorker = new UserWorker();
const safetyWorker = new SafetyWorker(userWorker);
const requestHandler = new RequestHandler(taskWorker, userWorker);

const ClientUtils = require('../public/scripts/client-utils');
const Constructor = require('../scripts/page-constructor');

const statuses = ClientUtils.getStatusCodes();


router.get('/favicon.ico', (req, res) =>
    res.sendStatus(statuses.successNoContent).end()
);


///authorization


router.use((req, res, next) => {
    req.authorized = safetyWorker.isJwtTokenValid(safetyWorker.getJwtTokenFromCookie(req.cookies));

    if (!req.authorized) {

        if (req.url === '/login' && (req.method.toLowerCase() === 'get'
            || req.method.toLowerCase() === 'post')) {
            next();
        } else if (req.url === '/' && req.method.toLowerCase() === 'get') {
            res.status(statuses.unauthorized).redirect(statuses.found, '/login');
        }

    } else {

        if (req.url === '/login') {
            res.redirect(statuses.found, '/');
        } else {
            next();
        }

    }

});

router.get('/login', (req, res) => {
    res.status(statuses.unauthorized).render('initialization', {});
});

router.post('/login', (req, res) => {

    const login = RequestHandler.retrieveLogin(req.body);
    const password = RequestHandler.retrievePassword(req.body);

    const doesUserExist = userWorker.getUserIdByLogin(login) !== null;

    if (!doesUserExist) {

        const userData = requestHandler.createUser(login, password);
        if (userData === null) {
            res.status(statuses.unprocessableEntity).end();
        } else {
            userWorker.updateJsonStorage();
            safetyWorker.setCookie(res, userData);
            res.status(statuses.ok).end();
        }

    } else {

        const userData = requestHandler.checkUserCredentials(login, password);
        if (userData === null) {
            res.status(statuses.forbidden).end();
        } else {
            safetyWorker.setCookie(res, userData);
            res.status(statuses.ok).end();
        }

    }

});

//
// after authorization
//

router.param('id', (req, res, next, id) => {
    if (RequestHandler.retrieveIndexOfRequestedElement(id) === null) {
        res.sendStatus(statuses.badRequest).end();
    } else {
        next();
    }
});


// downloads 1 attachment
router.get('/api/attachments/:id', (req, res) => {
    const pathToAttachment = taskWorker.getAttachmentPathById(req.params);
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
        = requestHandler.getFilteredTask(req.query);

    if (tasksToSend) {
        res.status(statuses.ok).json(tasksToSend);
    } else {
        res.status(statuses.ok).json([]);
    }
});

///api/tasks/0

// gets 1 task
router.get('/api/tasks/:id', (req, res) => {

    const task = taskWorker.getTaskDataById(req.params.id);
    if (task !== null) {
        res.status(statuses.ok).json(task);
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
    const status = requestHandler.deleteTask(req.params.id);
    res.sendStatus(status).end();

    if (statuses.successNoContent === status) {
        taskWorker.updateJsonStorage();
    }
});

// partial update of 1 task.
// it should process complete request here
router.patch('/api/tasks/:id', (req, res) => {
    const status = requestHandler.patchTask(req.body, req.files, req.params.id);
    res.sendStatus(status).end();

    if (statuses.successNoContent === status) {
        taskWorker.updateJsonStorage();
    }
});

// creates 1 task
router.post('/api/tasks', (req, res) => {
    const result = requestHandler.createTask(req.body, req.files);
    if (result.newItemIndex === null) {
        res.sendStatus(result.status).end();
    } else {
        res.status(result.status).json(result.newItemIndex);
        taskWorker.updateJsonStorage();
    }
});

// changes 1 task
router.put('/api/tasks/:id', (req, res) => {
    const status = requestHandler.updateTask(req.body, req.files, req.params.id);
    res.sendStatus(status).end();

    if (statuses.successNoContent === status) {
        taskWorker.updateJsonStorage();
    }
});


module.exports = {router: router};


