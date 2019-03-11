const express = require('express');
const router = express.Router();

const Task = require('../task');
const NEW_ITEM_INDEX = Task.getNewItemIndex();

const TaskWorker = require('../task-worker');
const worker = new TaskWorker();
worker.initializeStorage();

const Constructor = require('../page-constructor');
let pageConstructor = new Constructor(worker);


router.get('/', renderPage);

router.post('/', (req, res) => {

    //
    // process state-changing actions here
    //
    if (pageConstructor.isEditAtMainForm(req.body)) {
        //
        // Working with main form
        // editing existing task
        //
        editTask(req);

    } else if (pageConstructor.isCreateAtMainForm(req.body)) {
        //
        // Working with main form
        // creating new task
        //
        addTask(req);

    } else if (pageConstructor.isDeleteRequest(req.body)) {
        // delete existing task
        deleteTask(req.body);

    } else if (pageConstructor.isCompleteRequest(req.body)) {
        // complete existing task
        completeTask(req.body);
    }

    //
    // process {request of edit of existing task} at renderPage()
    // process {filters} at renderPage()
    //
    renderPage(req, res);

    worker.updateStorage();
});

function renderPage(req, res) {

    let isEditRequest = false;
    let mainFormTaskNumber = NEW_ITEM_INDEX;

    if (pageConstructor.isEditRequest(req.body)) {
        mainFormTaskNumber = getIndexOfRequestedItem(req.body);
        isEditRequest = true;
    }

    const placeholders =
        pageConstructor.getPlaceholders(req, isEditRequest, mainFormTaskNumber);

    res.render('index', placeholders);
}

function editTask(req) {
    addTask(req, getIndexOfRequestedItem(req.body));
}

function addTask(req, id = NEW_ITEM_INDEX) {
    pageConstructor.retrieveValues(req, id);
   // worker.insertTask();
}

function deleteTask(body) {
    worker.deleteTask(getIndexOfRequestedItem(body));
}

function completeTask(body) {
    worker.completeTask(getIndexOfRequestedItem(body));
}

// Returns index of task to edit
function getIndexOfRequestedItem(body) {
    return pageConstructor.getPassedId(body);
}

module.exports = { router:router, taskWorker:worker };


