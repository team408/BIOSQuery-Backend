const express = require('express');
const router = express.Router();
const { removeHost } = require('../controllers/management');

router.delete('/removeHost/:id', removeHost);

module.exports = router;
