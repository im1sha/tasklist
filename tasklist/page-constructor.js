const Task = require("./task");
const Utils = require('./utils');


const MAX_DISPLAYED_LENGTH = 30;
const NEW_ITEM_INDEX = Task.getNewItemIndex();

// fields transferred by post method
const hiddenInputFields = {
    isMainFormEdited : 'isMainFormEdited',
    isMainForm : 'isMainForm',
    taskId : 'taskId',
    complete : 'complete',
    edit : 'edit',
    remove : 'remove',
};

// main form placeholders
const defaultInputPlaceholders = {
    taskDateValue : "",
    taskAttachmentValue: "",
    taskNameBackValue: "* required",
    taskNameValue: "",
    checkboxDontChangeValue: "disabled",
    checkboxCompleteValue: "",
};

const defaultPlaceholders = {
    // LABELS
    titleText: "Task list",
    idText: "&#9679;",
    nameText: "Task",
    dateText: "Date",
    completedText: "",
    attachmentText: "",

    // Submit buttons content
    editText: "edit",
    removeText: "remove",
    saveText: "save",
    resetText: "reset",
    downloadText: "download",
    completeText: "complete",

    // Current task status
    completed: 'Completed',
    incomplete: 'Incomplete',
};

const taskProperties = Task.getPropertiesNamesAsObjectOfStrings();

class PageConstructor{

    #worker;

    constructor(worker) {
        this.#worker = worker;
    }

    isCreateAtMainForm(body){
        return (body[hiddenInputFields.isMainForm] === "true") &&
            (body[hiddenInputFields.isMainFormEdited] === "true");
    }

    isEditAtMainForm(body) {
        return (body[hiddenInputFields.isMainForm] === "true") &&
            (body[hiddenInputFields.isMainFormEdited] !== "true");
    }

    isDeleteRequest(body) {
        return (body[hiddenInputFields.isMainForm] !== "true") &&
            (body[hiddenInputFields.remove] === "true");
    }

    isCompleteRequest(body) {
        return (body[hiddenInputFields.isMainForm] !== "true") &&
            (body[hiddenInputFields.complete] === "true");
    }

    isEditRequest(body) {
        return (body[hiddenInputFields.isMainForm] !== "true") &&
            (body[hiddenInputFields.edit] === "true");
    }

    getPassedId(body){
        return parseInt(body[hiddenInputFields.taskId]);
    }


    retrieveValues(req, id) {

        let attachmentPath = null;
        let attachmentName = "No file";

        const attachment =
            (req.files === undefined)
                ? undefined
                : req.files[taskProperties.taskAttachmentFileName];


        if (!this.#worker.isIndexValid(id)) {
            throw new Error();
        }

        const newTaskId = (id === NEW_ITEM_INDEX)
            ? this.#worker.getNewItemIndex()
            : id;


        if (attachment !== undefined) {
            const attachmentDir =
                this.#worker.getAttachmentsDirectory() +
                newTaskId +
                path.sep;

            if (!fs.existsSync(attachmentDir)){
                fs.mkdirSync(attachmentDir);
            }
            attachmentName =  attachment.name;
            attachmentPath = attachmentDir + attachmentName;

            // mv() - A function to move the file elsewhere on your server
            attachment.mv(attachmentPath);
        }

        worker.tasks[newTaskId] = new Task(
            req.body[taskProperties.taskName],
            new Date(req.body[taskProperties.taskDate]),
            attachmentPath,
            attachmentName
        );

        this.#worker.insert();
    }

    getPlaceholders(req, isMainFormEdited, mainFormTaskNumber) {

        const tasksToShow = [];

        if (Utils.isObjectEmpty(req.query)) {
            worker.tasks.forEach((value, index) =>
                tasksToShow.push(createTaskEntry(value, index))
            );
            // } else {
            //     const statuses = req.query[taskProperties.taskCompleted];
            //     let filters;
            //
            //     if (Array.isArray(statuses)) {
            //         filters = statuses;
            //     } else {
            //         filters = [];
            //         filters.push(statuses);
            //     }
            //
            //     let filteredTasks = taskWorker.tasks.filter(task =>
            //         filters.includes(task.isCompleted().toString())
            //     );
            //     for (let i = 0; i < filteredTasks.length; i++) {
            //         tasksToShow.push(createTaskEntry(filteredTasks[i], i));
            //     }
        }


        // TODO
        //  let merged = {...obj1, ...obj2};


        let values = {
            taskProperties: taskProperties,
            content: renderTasks,

            titleText: defaultPlaceholders.titleText,
            // LABELS
            idText: defaultPlaceholders.idText,
            nameText: defaultPlaceholders.nameText,
            dateText: defaultPlaceholders.dateText,
            completedText: defaultPlaceholders.completedText,
            attachmentText: defaultPlaceholders.attachmentText,

            // Buttons content
            editText: defaultPlaceholders.editText,
            removeText: defaultPlaceholders.removeText,
            saveText: defaultPlaceholders.saveText,
            resetText: defaultPlaceholders.resetText,
            downloadText: defaultPlaceholders.downloadText,
            completeText: defaultPlaceholders.completeText,

            completedStatus: defaultPlaceholders.completedStatus,
            nonCompletedStatus: defaultPlaceholders.nonCompletedStatus,

            taskAttachmentValue:mainFormPlaceholders.taskAttachmentValue,
            taskDateValue:mainFormPlaceholders.taskDateValue,
            taskNameValue:mainFormPlaceholders.taskNameValue,
            taskNameBackValue: mainFormPlaceholders.taskNameBackValue,
            checkboxDontChangeValue: mainFormPlaceholders.checkboxDontChangeValue,

            isMainFormEdited: isEditRequest
            ? "true"
            : "",
            mainFormTaskId: mainFormTaskNumber.toString(),
        };


        let inputPlaceholders = null;

        if  (isMainFormEdited !== true) {
            inputPlaceholders = {
                taskDateValue: defaultInputPlaceholders.taskDateValue,
                taskAttachmentValue: defaultInputPlaceholders.taskAttachmentValue,
                taskNameValue : defaultInputPlaceholders.taskNameValue,
                taskNameBackValue : defaultInputPlaceholders.taskNameBackValue,
                checkboxHiddenValue: defaultInputPlaceholders.checkboxDontChangeValue,
            };
        } else {
            const index = getIndexOfRequestedItem(req);
            const date = getDateAsObjectOfStrings(worker.tasks[index].taskDate);
            // time in format "2017-06-01T08:30"
            const formattedDateTime = date.year + '-' +
                date.month + '-' + date.day +
                'T' + date.hours + ':' + date.minutes;

            inputPlaceholders = {
                taskDateValue: formattedDateTime,
                taskAttachmentValue: "",
                taskNameValue: worker.tasks[index].taskName,
                taskNameBackValue: worker.tasks[index].taskName,
                checkboxHiddenValue: "checked",
            };
        }

        return inputPlaceholders;
    }



    createTaskEntry(task, taskId) {
        const taskEntry = {
            taskId: taskId,
            taskName: task.taskName.substr(0, MAX_DISPLAYED_LENGTH),
            taskAttachmentFileName: task.taskAttachmentFileName.substr(0, MAX_DISPLAYED_LENGTH),
            taskAttachmentPath: task.taskAttachmentPath,
            taskExpired: !!task.isExpired()
        };

        taskEntry.taskDate = formatDateForOutput(task.taskDate);

        if (task.isCompleted()) {
            taskEntry.taskCompleted = true;
            taskEntry.taskCompletedText = defaultPlaceholders.completed;
            taskEntry.taskCompletedDisabled = 'disabled';
        } else {
            taskEntry.taskCompleted = false;
            taskEntry.taskCompletedText = defaultPlaceholders.incomplete;
            taskEntry.taskCompletedDisabled = '';
        }

        if (task.taskAttachmentPath === null) {
            taskEntry.taskAttachmentDisabled = 'disabled';
        } else {
            taskEntry.taskAttachmentDisabled = '';
        }

        if (taskEntry.taskExpired === true) {
            taskEntry.expiredClass = 'class=expired';
        } else {
            taskEntry.expiredClass = '';
        }

        return taskEntry;
    }



}


module.exports = PageConstructor;