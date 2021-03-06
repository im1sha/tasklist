const express = require('express');
const router = express.Router();

const Task = require('../task');
const NEW_ITEM_INDEX = Task.getNewItemIndex();

const TaskWorker = require('../task-worker');
const worker = new TaskWorker();

const Constructor = require('../page-constructor');
const pageConstructor = new Constructor(worker);

router.get('/', renderPage);
router.post('/', renderPage);

function renderPage(req,res) {

    let isEditRequest = false;
    let mainFormTaskNumber = NEW_ITEM_INDEX;

    //
    // process state-changing actions here
    //
    if (Constructor.isEditAtMainForm(req.body)) {
        //
        // Working with main form
        // editing existing task
        //
        editTask(req, Constructor.shouldRewriteAttachment(req.body));

    } else if (Constructor.isCreateAtMainForm(req.body)) {
        //
        // Working with main form
        // creating new task
        //
        addTask(req);

    } else if (Constructor.isDeleteRequest(req.body)) {
        // delete existing task
        deleteTask(req.body);

    } else if (Constructor.isCompleteRequest(req.body)) {
        // complete existing task
        completeTask(req.body);

    } else if (Constructor.isEditRequest(req.body)) {

        isEditRequest = true;
        mainFormTaskNumber = getIndexOfRequestedItem(req.body);
    }

    const placeholders = pageConstructor.getPlaceholders(req, isEditRequest, mainFormTaskNumber);

    res.render('index', placeholders);

    if (!isEditRequest) {
        worker.updateJsonStorage();
    }
}

function editTask(req, rewriteAttachment) {
    addTask(req, rewriteAttachment, getIndexOfRequestedItem(req.body));
}

function addTask(req, rewriteAttachment = true, id = NEW_ITEM_INDEX) {
    worker.insertTask(
        Constructor.retrieveTaskProperties(req.body),
        Constructor.retrieveAttachment(req.files),
        rewriteAttachment,
        id);
}

function deleteTask(body) {
    worker.deleteTask(getIndexOfRequestedItem(body));
}

function completeTask(body) {
    worker.completeTask(getIndexOfRequestedItem(body));
}

// Returns index of task to edit
function getIndexOfRequestedItem(body) {
    return Constructor.getPassedId(body);
}

module.exports = {router:router, worker:worker};


