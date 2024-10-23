const express = require('express');
const router = express.Router();
const controller = require('./scrape.js');

router.post('/scrape/h/:url', controller.scrape);

module.exports = router;