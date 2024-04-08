var express = require('express');
require('dotenv').config();
var apiRoutes = express.Router();


const { } = process.env;

apiRoutes.get('/', function (req, res) {
    res.json({
        Message: 'Welcome To Open Meta API.'
    });
});

module.exports = apiRoutes;