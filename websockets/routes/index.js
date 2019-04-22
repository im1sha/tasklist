const express = require('express');
const router = express.Router();

const ClientUtils = require('../public/scripts/common/client-utils');

const statuses = ClientUtils.getStatusCodes();


router.get('/favicon.ico', (req, res) =>
    res.sendStatus(statuses.successNoContent).end()
);


router.get('/', (req, res) => {
    res.status(statuses.ok).render('initialization', { } );
});


module.exports = { router: router };


