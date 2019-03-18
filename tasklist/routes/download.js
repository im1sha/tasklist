let express = require('express');
let router = express.Router();
const indexModule = require("./index");



router.get('/', function (req, res) {
    let worker = indexModule.worker;
    if (worker) {
        res.download(worker.tasks[parseInt(req.query['taskId'])].getAttachmentPath());
    }
    else {
        res.statusCode(404);
    }
});

module.exports = router;




