var router = require('express').Router();
var request = require('request');
var parser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');
var Dropbox = require('dropbox');
var Twitter = require('twitter');

var dropboxOptions = process.env.dropbox || require('./config.js').dropbox;
var client = new Dropbox.Client({ key: "yhintvoqspu0w44", secret: dropboxOptions });
var twitterOptions;
if(process.env === undefined){
  twitterOptions = require('./config.js').twitter;
} else {
  twitterOptions = {consumer_key: process.env.twitter_consumer_key, consumer_secret: process.env.twitter_consumer_secret, access_token_key: process.env.twitter_access_token_key, access_token_secret: process.env.twitter_access_token_secret};
}
// var twitterOptions = process !== undefined ? {consumer_key: process.env.twitter_consumer_key, consumer_secret: process.env.twitter_consumer_secret, access_token_key: process.env.twitter_access_token_key, access_token_secret: process.env.twitter_access_token_secret} : require('./config.js').twitter;
// var twitterOptions = require('./config.js').twitter;
var twitterClient = new Twitter(twitterOptions);
console.log("this is twitterOptions1", twitterOptions);

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
  response.status(200).sendFile(dirname + '/client/index.html');
});

// Add User
router.post('/signup', function(request, response) {
  // Get all the user information
  var email = request.body.email;
  var full_name = request.body.full_name;
  var password = request.body.password;
  var monthly_limit = request.body.monthly_limit;
  var savings_goal = request.body.savings_goal;
  var total_savings = request.body.total_savings;
  // If no missing data
  if (email !== null && full_name !== null && password !== null && monthly_limit !== null && savings_goal !== null) {
    // Search in db in User table for existing email
    // db.connect();
    db.query('SELECT * FROM Users WHERE email = ?;', [email], function(err, rows){
      // If it doesn't exists
      if(rows.length === 0) {
        // Encrypt password
        password = bcrypt.hashSync(password);
        // Create user
        // db.connect();
        db.query('INSERT INTO Users SET email = ?, full_name = ?, password = ?, monthly_limit = ?, savings_goal = ?, total_savings = ?;',
        [email, full_name, password, monthly_limit, savings_goal, total_savings],
        function(err, rows){
          // Log user in (create token)
          if(err){
            console.log(err);
            response.sendStatus(500);
          }
          util.createToken(request, response, rows.insertId);

        });
        // db.end();
      } else {
        response.sendStatus(409);
      }
    });
    // db.end();
  } else {
    response.sendStatus(400);
  }
});

// Login User
router.post('/login', function (request, response) {
  var email = request.body.email;
  var password = request.body.password;
  console.log("email", email, "password", password);
  if (email !== null || password !== null) {
    // db.connect();
    db.query('SELECT * from Users WHERE email = ?;', [email], function(err, rows) {
      if(err){
        console.log(err);
        response.sendStatus(500);

      }else{
      // If user doesn't exist
      if (rows.length > 0) {
        // Password check
        bcrypt.compare(password, rows[0].password, function(err, result) {
          if (err) {
            console.error(err);
            response.sendStatus(500);
          } else if (result) {
            // Log user in
            util.createToken(request, response, rows[0].id);
          } else {
            // Password mismatch, unauthorized
            console.log("Password mismatch");
            response.sendStatus(401);
          }
        });
      } else {
        // Email not found, unauthorized
        console.log("Email not found");
        response.sendStatus(401);
      }
    }
  });
    // db.end();
  }
});

// Get Tweets on Learn Page
router.get('/learn', function(request, response) {
  twitterClient.get('search/tweets', {q: 'from:wsj, OR from:nytimes, OR from:EconBizFin, OR from:money_cnn, OR from:Investopedia, OR from:business', count:100, result_type:'recent'}, function(err, tweets, tweetResponse){
    if (err) {
      console.error(err);
      response.sendStatus(500);
    } else {
      response.json(tweets);
    }
  });
});

// Logout User
router.get('/logout', function(request, response) {
  request.session.destroy(function(){
    response.sendStatus(200);
  });
});

// Get User Info
router.get('/user', util.checkToken, function(request, response) {
  // Look for current user in the database
  // db.connect();
  db.query('SELECT * from Users WHERE id = ?;', [request.user.id], function(err, rows) {
    if (err) {
      console.error(err);
      response.sendStatus(500);
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
        savings_goal: rows[0].savings_goal,
        total_savings: rows[0].total_savings
      });
    }
  });
  // db.end();
});

/**
 * Profile
 */

// Update Monthly Limit
router.put('/monthly_limit', util.checkToken, function(request, response) {
  // db.connect();
  db.query('SELECT * FROM Users WHERE id = ?', [request.user.id], function(err, rows){
    var new_total_savings = rows[0].total_savings - rows[0].monthly_limit + request.body.monthly_limit;
    // db.connect();
    db.query('UPDATE Users SET monthly_limit = ?, total_savings = ? WHERE id = ?;',
    [request.body.monthly_limit, new_total_savings, request.user.id],
    function(err, result) {
      if (err) {
        console.error(err);
        response.sendStatus(500);
      } else if(result.affectedRows === 1){
        response.sendStatus(200);
      } else {
        response.sendStatus(401);
      }
    });
    // db.end()
  });
  // db.end();
});

// Update Savings Goal
router.put('/savings_goal', util.checkToken, function(request, response) {
  // db.connect();
  db.query('UPDATE Users SET savings_goal = ? WHERE id = ?;',
  [request.body.savings_goal, request.user.id],
  function(err, result) {
    if (err) {
      console.error(err);
      response.sendStatus(500);
    } else if(result.affectedRows === 1){
      response.sendStatus(200);
    } else {
      response.sendStatus(401);
    }
  });
  // db.end();
});

// Update Current Balance
router.put('/total_savings', util.checkToken, function(request, response) {
  // db.connect();
  db.query('UPDATE Users SET total_savings = ? WHERE id = ?;',
  [request.body.total_savings, request.user.id],
  function(err, result) {
    if (err) {
      console.error(err);
      response.sendStatus(500);
    } else if(result.affectedRows === 1){
      response.sendStatus(200);
    } else {
      response.sendStatus(401);
    }
  });
  // db.end();
});

/**
 * Expenses
 */

// Show all expenses
router.get('/expenses/:days', util.checkToken, function(request, response) {
  // db.connect();
  db.query('SELECT * FROM Expenses WHERE user_id = ? AND spent_date > DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY spent_date DESC;',
  [request.user.id, Number(request.params.days) || 30],
  function(err, rows) {
    if (err) {
      console.error(err);
      response.sendStatus(500);
    } else {
      response.json(rows);
    }
  });
  // db.end();
});

// Add new expense(s)
router.post('/expenses', util.checkToken, function(request, response) {
  // Get all the information
  var name = request.body.name;
  var amount = request.body.amount;
  var category = request.body.category;
  var notes = request.body.notes || null;
  var spent_date = request.body.spent_date;
  var location = request.body.location || null;
  var lat = request.body.latlng || null;

  // If no missing data
  if (name !== null && amount !== null && category !== null /*&& request.user.id !== undefined*/) {
    db.query('INSERT INTO Expenses SET name = ?, amount = ?, category = ?, notes = ?, spent_date = ?, location = ?, geocode = ?, user_id = ?;',
    [name, amount, category, notes, spent_date, location, lat, request.user.id],
    function(err, result){
      if (err) {
        console.error(err);
        response.sendStatus(500);
      } else if (result.insertId){
        db.query('SELECT * FROM Expenses WHERE id = ? AND user_id = ?;', [result.insertId, request.user.id], function(err, rows){
          if (err) {
            console.err(err);
          } else {
            response.status(201).json(rows[0]);
          }
        });
        db.query('SELECT * FROM Users WHERE id = ?;', [request.user.id], function(err, rows){
          if (err) {
            console.error(err);
            response.sendStatus(500);
          } else {
            var newSavings = Number(rows[0].total_savings) - Number(amount);
            db.query('UPDATE Users SET total_savings = ? WHERE id = ?;', [newSavings, request.user.id], function(err, rows){
                if (err) {
                  console.error(err);
                }
            });
          }
        });
      }
    });
    // db.end();
  } else {
    response.sendStatus(400);
  }
});

// Update expense
router.put('/expenses/:id', util.checkToken, function(request, response) {
  var name = request.body.name;
  var amount = request.body.amount;
  var category = request.body.category;
  var notes = request.body.notes || null;
  var spent_date = request.body.spent_date;
  var location = request.body.location || null;
  var lat = request.body.latlng || null;

  db.query('UPDATE Expenses SET name = ?, amount = ?, category = ?, notes = ?, spent_date = ?, location = ?, geocode = ? WHERE id = ?;',
  [name, amount, category, notes, spent_date, location, lat, request.params.id],
  function(err, result){
    if (err) {
      console.error(err);
      response.sendStatus(500);
    } else {
      db.query('SELECT * FROM Expenses WHERE id = ? AND user_id = ?;', [request.params.id, request.user.id], function(err, rows){
        if (err) {
          console.err(err);
        } else {
          response.status(200).json(rows[0]);
        }
      });
    }
  });
  // db.end();
});

// Delete expense
router.delete('/expenses/:id', util.checkToken, function(request, response) {
  var id = request.params.id;
  // db.connect();
  db.query('SELECT * FROM Expenses WHERE id = ?', [id], function (err, rows) {
    if (err) {
      console.error(err);
      response.sendStatus(500);
    } else {
      var expenseAmount = rows[0].amount;
      db.query('DELETE FROM Expenses WHERE id = ?', [id], function (err, result){
        if(err){
          console.error(err);
          response.sendStatus(500);
        }
      });
      db.query('SELECT * FROM Users WHERE id = ?;', [request.user.id], function(err, rows){
        if (err) {
          console.error(err);
          response.sendStatus(500);
        } else {
          var newSavings = Number(rows[0].total_savings) + Number(expenseAmount);
          db.query('UPDATE Users SET total_savings = ? WHERE id = ?;', [newSavings, request.user.id], function(err, rows){
              if (err) {
                console.error(err);
                response.sendStatus(500);
              } else{
                response.sendStatus(200);
              }
          });
        }
      });
    }
  });
  // db.end();
});

/**
 * Incomes
 */

// Show all incomes
router.get('/incomes/:days', util.checkToken, function(request, response) {
  // db.connect();
  db.query('SELECT * FROM Incomes WHERE user_id = ?;',
  /*AND income_date > DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY income_date DESC*/
  [request.user.id, Number(request.params.days) || 30],
  function(err, rows) {
    if (err) {
      console.error(err);
      response.sendStatus(500);
    } else {
      response.json(rows);
    }
  });
  // db.end();
});

// Add new income(s)
router.post('/incomes', util.checkToken, function(request, response) {
  // Get all the information
  var name = request.body.name;
  var amount = request.body.amount;
  var category = request.body.category;
  var notes = request.body.notes || null;
  var income_date = request.body.income_date;
  var location = request.body.location || null;
  // If no missing data
  if (name !== null && amount !== null && category !== null) {
    // db.connect();
    db.query('INSERT INTO Incomes SET name = ?, amount = ?, category = ?, notes = ?, income_date = ?, location = ?, user_id = ?;',
    [name, amount, category, notes, income_date, location, request.user.id],
    function(err, result){
      if (err) {
        console.error(err);
        response.sendStatus(500);
      } else if (result.insertId){
        db.query('SELECT * FROM Incomes WHERE id = ? AND user_id = ?;', [result.insertId, request.user.id], function(err, rows){
          if (err) {
            console.err(err);
            response.sendStatus(500);
          } else {
            response.status(201).json(rows[0]);
          }
        });
        db.query('SELECT * FROM Users WHERE id = ?;', [request.user.id], function(err, rows){
          if (err) {
            console.error(err);
            response.sendStatus(500);
          } else {
            var newSavings = Number(rows[0].total_savings) + Number(amount);
            db.query('UPDATE Users SET total_savings = ? WHERE id = ?;', [newSavings, request.user.id], function(err, rows){
                if (err) {
                  console.error(err);
                  response.sendStatus(500);
                }
            });
          }
        });
      }
    });
    // db.end();
  } else {
    response.sendStatus(400);
  }
});

// Update income
router.put('/incomes/:id', util.checkToken, function(request, response) {
  var name = request.body.name;
  var amount = request.body.amount;
  var category = request.body.category;
  var notes = request.body.notes || null;
  var income_date = request.body.income_date;
  var location = request.body.location || null;
  // db.connect();
  db.query('UPDATE Incomes SET name = ?, amount = ?, category = ?, notes = ?, income_date = ?, location = ? WHERE id = ?;',
  [name, amount, category, notes, income_date, location, request.params.id],
  function(err, result){
    if (err) {
      console.error(err);
      response.sendStatus(500);
    } else {
      db.query('SELECT * FROM Incomes WHERE id = ? AND user_id = ?;', [request.params.id, request.user.id], function(err, rows){
        if (err) {
          console.err(err);
          response.sendStatus(500);
        } else {
          response.status(200).json(rows[0]);
        }
      });
    }
  });
  // db.end();
});

// Delete income
router.delete('/incomes/:id', util.checkToken, function(request, response) {
  var id = request.params.id;
  // db.connect();
  db.query('SELECT * FROM Incomes WHERE id = ?', [id], function (err, rows) {
    if (err) {
      console.error(err);
      response.sendStatus(500);
    } else {
      var incomeAmount = rows[0].amount;
      db.query('DELETE FROM Incomes WHERE id = ?', [id], function (err, result){
        if(err){
          console.error(err);
          response.sendStatus(500);
        }
      });
      db.query('SELECT * FROM Users WHERE id = ?;', [request.user.id], function(err, rows){
        if (err) {
          console.error(err);
          response.sendStatus(500);
        } else {
          var newSavings = Number(rows[0].total_savings) - Number(incomeAmount);
          db.query('UPDATE Users SET total_savings = ? WHERE id = ?;', [newSavings, request.user.id], function(err, rows){
              if (err) {
                console.error(err);
                response.sendStatus(500);
              } else{
                response.sendStatus(200);
              }
          });
        }
      });
    }
  });
  // db.end();
});

/**
 * Goals
 */

// Get all of the user's current goals
router.get('/goals', util.checkToken, function(request, response) {
  // db.connect();
  db.query('SELECT * FROM Goals WHERE user_id = ?;', [request.user.id], function(err, rows){
    if(err) {
      console.error(err);
      response.sendStatus(500);
    } else {
      response.status(200).json(rows);
    }
  });
  // db.end();
});

// Add new Goal
router.post('/goals', util.checkToken, function(request, response) {
  var name = request.body.name;
  var amount = request.body.amount;
  var category = request.body.category;
  var notes = request.body.notes || null;
  if (name !== null && amount !== null && category !== null) {
    // db.connect();
    db.query('INSERT INTO Goals SET name = ?, amount = ?, saved_amount = 0, category = ?, notes = ?, user_id = ?;',
    [name, amount, category, notes, request.user.id],
    function(err, result){
      if(err) {
        console.error(err);
        response.sendStatus(500);
      } else {
        db.query('SELECT * FROM Goals WHERE id = ?', [result.insertId], function(err, rows){
          if(err) {
            console.error(err);
            response.sendStatus(500);
          } else {
            response.status(201).json(rows[0]);
          }
        });
      }
    });
    // db.end();
  }
});

// Add money to Goal
router.put('/goals/:id', util.checkToken, function(request, response) {
  var amount = request.body.amount;
  var id = request.params.id;
  // db.connect();
  db.query('SELECT * FROM Users WHERE id = ?;', [request.user.id], function(err, rows){
    if(err) {
      console.error(err);
      response.sendStatus(500);
    } else {
      var totalSavings = rows[0].total_savings;
      if(amount < totalSavings) {
        totalSavings-=amount;
        db.query('SELECT * FROM Goals WHERE id = ?;', [id], function(err, rows){
          if(err) {
            console.error(err);
            response.sendStatus(500);
          } else {
            var goal = rows[0];
            var diff = goal.amount - (amount + goal.saved_amount) < 0 ? goal.amount - (amount + goal.saved_amount) : 0;
            totalSavings += Math.abs(diff);
            amount += goal.saved_amount + diff;
            db.query('UPDATE Users SET total_savings = ? WHERE id = ?;', [totalSavings, request.user.id], function(err, result){
              if(err) {
                console.error(err);
                response.sendStatus(500);
              }
            });
            db.query('UPDATE Goals SET saved_amount = ? WHERE id = ?;', [amount, id], function(err, result){
              if(err) {
                console.error(err);
                response.sendStatus(500);
              } else {
                response.sendStatus(200);
              }
            });
          }
        });
      } else {
        response.sendStatus(400);
      }
    }
  });
  // db.end();
});

// Remove money from Goal
router.patch('/goals/:id', util.checkToken, function(request, response) {
  var amount = request.body.amount;
  var id = request.params.id;
  // db.connect();
  db.query('SELECT * FROM Goals WHERE id = ?;', [id], function(err, rows){
    if(err) {
      console.error(err);
      response.sendStatus(500);
    } else {
      var saved = rows[0].saved_amount; //50
      var diff = saved - amount < 0 ? saved - amount : 0;
      amount += diff;
      var newSaved = saved - amount;
      db.query('UPDATE Goals SET saved_amount = ? WHERE id = ?;', [newSaved, id], function(err, result){
        if(err) {
          console.error(err);
          response.sendStatus(500);
        }
      });
      db.query('SELECT * from Users WHERE id = ?;', [request.user.id], function(err, rows){
        if(err) {
          console.error(err);
          response.sendStatus(500);
        } else {
          var totalSavings = rows[0].total_savings;
          var newSavings = totalSavings + amount;
          db.query('UPDATE Users SET total_savings = ? WHERE id = ?;', [newSavings, request.user.id], function(err, result){
            if(err) {
              console.error(err);
              response.sendStatus(500);
            } else {
              response.sendStatus(200);
            }
          });
        }
      });
    }
  });
  // db.end();
});

// Delete Goal
router.delete('/goals/:id', util.checkToken, function(request, response) {
  var id = request.params.id;
  // db.connect();
  db.query('SELECT * FROM Goals WHERE id = ?;', [id], function(err, rows){
    var savedAmount = rows[0].saved_amount;
    db.query('SELECT * FROM Users WHERE id = ?;', [request.user.id], function(err, rows){
      var newTotal = savedAmount + rows[0].total_savings;
      db.query('UPDATE Users SET total_savings = ? WHERE id = ?;', [newTotal, request.user.id], function(err, results){
        if(err){
          console.error(err);
          response.sendStatus(500);
        }
      });
    });
    db.query('DELETE FROM Goals WHERE id = ?;', [id], function(err, result){
      if(err){
        console.error(err);
        response.sendStatus(500);
      } else {
        response.sendStatus(200);
      }
    });
  });
  // db.end();
});

// Complete goal
router.post('/goals/:id', util.checkToken, function(request, response) {
  // db.connect();
  db.query('SELECT * FROM Users WHERE id = ?;', [request.user.id], function(err, rows){
    var totalSavings = rows[0].total_savings;
    db.query('SELECT * FROM Goals WHERE id = ?;', [request.params.id], function(err, rows){
      var amount = rows[0].amount;
      var saved = rows[0].saved_amount;
      if(amount - saved < totalSavings) {
        var newTotalSavings = totalSavings - (amount - saved);
        db.query('UPDATE Users SET total_savings = ? WHERE id = ?;', [newTotalSavings, request.user.id], function(err, results){
          if(err){
            console.error(err);
            response.sendStatus(500);
          }
        });
        var name = rows[0].name;
        var category = rows[0].category;
        var notes = rows[0].notes || null;
        var spent_date = moment().format('YYYY-MM-DD HH:mm:ss');
        var location = null;
        db.query('DELETE FROM Goals WHERE id = ?;', [request.params.id], function(err, results){
          if(err){
            console.error(err);
            response.sendStatus(500);
          }
        });
        db.query('INSERT INTO Expenses SET name = ?, amount = ?, category = ?, notes = ?, spent_date = ?, location = ?, user_id = ?;',
        [name, amount, category, notes, spent_date, location, request.user.id],
        function(err, result){
          if(err){
            console.error(err);
            response.sendStatus(500);
          } else {
            response.sendStatus(201);
          }
        });
      } else {
        response.sendStatus(400);
      }
    });
  });
  // db.end();
});

// Dropbox logic
router.get('/dropbox', function(request, response){
  response.send(
"<!DOCTYPE html>" +
"<html lang=\"en\">" +
"  <head>" +
"    <script src=\"//cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.10.2/dropbox.min.js\" type=\"text/javascript\"></script>" +
"    <script type=\"text/javascript\">" +
"      Dropbox.AuthDriver.Popup.oauthReceiver();" +
"    </script>" +
"  </head>" +
"  <body>" +
"    <h1>Dropbox sign-in successful</h1>" +
"    <p>Please close this window.</p>" +
"  </body>" +
"</html>");
});


// Export for use in server.js
module.exports = router;
