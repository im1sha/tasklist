let express = require('express');
let router = express.Router();

router.get('/', function (req, res) {
    res.download(tasks[parseInt(req.query['taskId'])].taskAttachmentPath);
});

module.exports = router;