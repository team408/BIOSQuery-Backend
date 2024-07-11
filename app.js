const express = require("express")
const app = express()
require("dotenv").config()
const session = require('express-session');

// Extending the parsing abilities the server has
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/', require('./routes/router'));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

console.log(`Running on port ${process.env.LISTEN_PORT || 3000}`);
app.listen(process.env.LISTEN_PORT || 3000);