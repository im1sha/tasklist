let express = require('express');
let router = express.Router();
const index = require("./index");
const worker = index.taskWorker;

router.get('/', function (req, res) {
    res.download(worker.tasks[parseInt(req.query['taskId'])].taskAttachmentPath);
});

module.exports = router;




