var router = require('express').Router();
var request = require('request');
var parser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');

// Database Requirements
var mysql = require('mysql');
var db = require('./db.js');

// Authentication and Calculation utilities
var util = require('./utilities.js');

// Move around dir structure
var dirname = __dirname.slice(0, -6);

/**
 * Routes
 */

router.get('/', function(request, response) {
  response.status(200).sendFile(dirname + '/client/index.html')
});



// Export for use in server.js
module.exports = router;










/*

signup user
login user
logout user
serve index.html

edit User info

add and edit monthly_limit
add and edit savings_goal

add Expenses
edit Expenses
delete Expenses

crud Goala
curd Recurring_Expenses

crud Users_Stocks

*/
