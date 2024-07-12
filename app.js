const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const express = require("express")
const app = express()
require("dotenv").config()
const session = require('express-session');

// Extending the parsing abilities the server has
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/', require('./routes/router'));
// Swagger
const swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

console.log(`Running on port ${process.env.LISTEN_PORT || 3000}`);
app.listen(process.env.LISTEN_PORT || 3000);

console.log("[*] Gaia Tal and Noya are testing")