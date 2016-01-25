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

/**
 * User and Auth
 */

// Serve App
router.get('/', function(request, response) {
  response.status(200).sendFile(dirname + '/client/index.html')
});

// Add User
router.post('/signup', function(request, response) {
  // Get all the user information
  var email = request.body.email;
  var full_name = request.body.full_name;
  var password = request.body.password;
  var monthly_limit = request.body.monthly_limit;
  var savings_goal = request.body.savings_goal;
  // If no missing data
  if (email !== null && full_name !== null && password !== null && monthly_limit !== null && savings_goal !== null) {
    // Search in db in User table for existing email
    db.query('SELECT * FROM Users WHERE email = ?;', [email], function(err, rows){
      // If it doesn't exists
      if(rows.length === 0) {
        // Encrypt password
        password = bcrypt.hashSync(password);
        // Create user
        db.query('INSERT INTO Users SET email = ?, full_name = ?, password = ?, monthly_limit = ?, savings_goal = ?, total_savings = ?;',
        [email, full_name, password, monthly_limit, savings_goal, monthly_limit],
        function(err, rows){
          // Log user in (create session)
          util.createSession(request, response, rows.insertId);
        });
      } else {
        response.sendStatus(409);
      }
    });
  } else {
    response.sendStatus(400);
  }
});

// Login User
router.post('/login', function (request, response) {
  var email = request.body.email;
  var password = request.body.password;
  if (email !== null || password !== null) {
    db.query('SELECT * from Users WHERE email = ?;', [email], function(err, rows) {
      // If user doesn't exist
      if (rows.length > 0) {
        // Password check
        bcrypt.compare(password, rows[0].password, function(err, result) {
          if (err) {
            console.error(err);
          } else if (result) {
            // Log user in (create session)
            util.createSession(request, response, rows[0].id);
          } else {
            // Password mismatch, unauthorized
            response.sendStatus(401);
          }
        });
      } else {
        // Email not found, unauthorized
        response.sendStatus(401);
      }
    });
  }
});

// Logout User
router.get('/logout', function(request, response) {
  request.session.destroy(function(){
    response.sendStatus(200);
  });
});

// Get User Info
router.get('/user', function(request, response) {
  // Look for current user in the database
  db.query('SELECT * from Users WHERE id = ?;', [request.session.user], function(err, rows) {
    if (err) {
      console.error(err);
    // If no user found
    } else if (rows.length === 0) {
      response.sendStatus(401);
    } else {
      // Respond with user info
      response.json({
        id: rows[0].id,
        full_name: rows[0].full_name,
        email: rows[0].email,
        monthly_limit: rows[0].monthly_limit,
        savings_goal: rows[0].savings_goal
      });
    }
  });
});

/**
 * Profile
 */

// Update Monthly Limit
router.put('/monthly_limit', function(request, response) {
  db.query('SELECT * FROM Users WHERE id = ?', [request.session.user], function(err, rows){
    var new_total_savings = rows[0].total_savings - rows[0].monthly_limit + request.body.monthly_limit;
    db.query('UPDATE Users SET monthly_limit = ?, total_savings = ? WHERE id = ?;',
    [request.body.monthly_limit, new_total_savings, request.session.user],
    function(err, result) {
      if (err) {
        console.error(err);
      } else if(result.affectedRows === 1){
        response.sendStatus(200);
      } else {
        response.sendStatus(401);
      }
    });
  });
});

// Update Savings Goal
router.put('/savings_goal', function(request, response) {
  db.query('UPDATE Users SET savings_goal = ? WHERE id = ?;',
  [request.body.savings_goal, request.session.user],
  function(err, result) {
    if (err) {
      console.error(err);
    } else if(result.affectedRows === 1){
      response.sendStatus(200);
    } else {
      response.sendStatus(401);
    }
  });
});

/**
 * Expenses
 */

// Show all expenses
router.get('/expenses/:days', function(request, response) {
  db.query('SELECT * FROM Expenses WHERE user_id = ? AND spent_date > DATE_SUB(NOW(), INTERVAL ? DAY);',
  [request.session.user, Number(request.params.days) || 30],
  function(err, rows) {
    if (err) {
      console.error(err);
    } else {
      response.json(rows);
    }
  });
});

// Add new expense(s)
router.post('/expenses', function(request, response) {
  // Get all the information
  var name = request.body.name;
  var amount = request.body.amount;
  var category = request.body.category;
  var notes = request.body.notes || null;
  var spent_date = request.body.spent_date || new Date().toISOString().slice(0, 19).replace('T', ' '); // TODO Get correct Date
  var location = request.body.location || null;
  // If no missing data
  if (name !== null && amount !== null && category !== null && request.session.user !== undefined) {
    db.query('INSERT INTO Expenses SET name = ?, amount = ?, category = ?, notes = ?, spent_date = ?, location = ?, user_id = ?;',
    [name, amount, category, notes, spent_date, location, request.session.user],
    function(err, result){
      if (err) {
        console.error(err);
      } else if (result.insertId){
        db.query('SELECT * FROM Expenses WHERE id = ? AND user_id = ?;', [result.insertId, request.session.user], function(err, rows){
          if (err) {
            console.err(err);
          } else {
            response.status(201).json(rows[0]);
          }
        });
      }
    });
  } else {
    response.sendStatus(400);
  }
});

// Update expense
router.put('/expenses/:id', function(request, response) {
  var name = request.body.name;
  var amount = request.body.amount;
  var category = request.body.category;
  var notes = request.body.notes || null;
  var spent_date = request.body.spent_date || new Date().toISOString().slice(0, 19).replace('T', ' '); // TODO Get correct Date
  var location = request.body.location || null;
  db.query('UPDATE Expenses SET name = ?, amount = ?, category = ?, notes = ?, spent_date = ?, location = ? WHERE id = ?;',
  [name, amount, category, notes, spent_date, location, request.params.id],
  function(err, result){
    if (err) {
      console.error(err);
    } else {
      db.query('SELECT * FROM Expenses WHERE id = ? AND user_id = ?;', [request.params.id, request.session.user], function(err, rows){
        if (err) {
          console.err(err);
        } else {
          response.status(200).json(rows[0]);
        }
      });
    }
  });
});

// Delete expense
router.delete('/expenses/:id', function(request, response) {
  var id = request.params.id;
  db.query('DELETE FROM Expenses WHERE id = ?', [id], function (err, result) {
    if (err) {
      console.error(err);
    } else {
      response.sendStatus(200);      
    }
  });
});


// Export for use in server.js
module.exports = router;




/*

crud Goala
curd Recurring_Expenses

crud Users_Stocks

*/
