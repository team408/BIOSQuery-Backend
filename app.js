const express = require("express")
const app = express()
require("dotenv").config()
const session = require('express-session');

// Extending the parsing abilities the server has
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/', require('./routes/router'));

app.listen(process.env.LISTEN_PORT || 3000);
// logger.info(`Running at Port ${process.env.LISTEN_PORT || 3000}`);