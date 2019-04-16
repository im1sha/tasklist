const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();

router.get('/favicon.ico', (req, res) => res.status(204).end());

router.get('/', (req, res) => res.sendStatus(200).end());

module.exports = router;
