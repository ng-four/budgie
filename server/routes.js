var router = require('express').Router();
var request = require('request');
var parser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');
var Dropbox = require('dropbox');
var Twitter = require('twitter');

// Dropbox Setup for server-based Authentication
var dropboxOptions = process.env.dropbox || require('./config.js').dropbox;
var client = new Dropbox.Client({ key: "yhintvoqspu0w44", secret: dropboxOptions });

// Twitter Setup
var twitterOptions;
if(process.env.dropbox === undefined){
  twitterOptions = require('./config.js').twitter;
} else {
  twitterOptions = {
    consumer_key: process.env.twitter_consumer_key,
    consumer_secret: process.env.twitter_consumer_secret,
    access_token_key: process.env.twitter_access_token_key,
    access_token_secret: process.env.twitter_access_token_secret
  };
}
var twitterClient = new Twitter(twitterOptions);

// Database Requirements
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
    db.query('SELECT * FROM Users WHERE email = ?;', [email], function(err, rows){
      // If it doesn't exists
      if(rows.length === 0) {
        // Encrypt password
        password = bcrypt.hashSync(password);
        // Create user
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
      } else {
        response.sendStatus(409);
      }
    });
  } else {
    response.sendStatus(400);
  }
});

// Login User
router.post('/login', function(request, response) {
  var email = request.body.email;
  var password = request.body.password;
  if (email !== null || password !== null) {
    db.query('SELECT * from Users WHERE email = ?;', [email], function(err, rows) {
      if (err) {
        console.log(err);
        response.sendStatus(500);
      } else {
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
              console.log("Password mismatch!");
              response.sendStatus(401);
            }
          });
        } else {
          // Email not found, unauthorized
          console.log("Unknown email address");
          response.sendStatus(401);
        }
      }
    });
  }
});

// Get Tweets on Learn Page
router.get('/learn', function(request, response) {
  twitterClient.get('search/tweets',
  {
    q: 'from:wsj, OR from:nytimes, OR from:EconBizFin, OR from:money_cnn, OR from:Investopedia, OR from:business',
    count:100,
    result_type:'recent'
  },
  function(err, tweets, tweetResponse){
    if (err) {
      console.error(err);
      response.sendStatus(500);
    } else {
      response.json(tweets);
    }
  });
});

// Logout User - DEFUNCT
// router.get('/logout', function(request, response) {
//   request.session.destroy(function(){
//     response.sendStatus(200);
//   });
// });

// Get User Info
router.get('/user', util.checkToken, function(request, response) {
  // Look for current user in the database
  db.query('SELECT * from Users WHERE id = ?;', [request.user.id], function(err, rows) {
    if (err) {
      console.error(err);
      response.sendStatus(500);
    // If no user found
    } else if (rows.length === 0) {
      response.sendStatus(401);
    } else {
      // Respond with user info
      // Parsed for safety
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
});

/**
 * Profile
 */

// Update Monthly Limit
router.put('/monthly_limit', util.checkToken, function(request, response) {
  // db.query('SELECT * FROM Users WHERE id = ?', [request.user.id], function(err, rows){
    // var new_total_savings = rows[0].total_savings - rows[0].monthly_limit + request.body.monthly_limit;
    db.query('UPDATE Users SET monthly_limit = ? WHERE id = ?;',
    [request.body.monthly_limit, request.user.id],
    function(err, result) {
      if (err) {
        console.error(err);
        response.sendStatus(500);
      } else if(result.affectedRows === 1){ // If a row was affected
        response.sendStatus(200);
      } else {
        response.sendStatus(401);
      }
    });
  // });
});

// Update Savings Goal - See above for logic
router.put('/savings_goal', util.checkToken, function(request, response) {
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
});

// Update Current Balance - See above for logic
router.put('/total_savings', util.checkToken, function(request, response) {
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
});

/**
 * Expenses
 */

// Show all expenses
router.get('/expenses/:days', util.checkToken, function(request, response) {
  // Only select rows that are within a certain number of days (specified in the request)
  // Descending order
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
    // Add the expense..
    db.query('INSERT INTO Expenses SET name = ?, amount = ?, category = ?, notes = ?, spent_date = ?, location = ?, geocode = ?, user_id = ?;',
    [name, amount, category, notes, spent_date, location, lat, request.user.id],
    function(err, result){
      if (err) {
        console.error(err);
        response.sendStatus(500);
      } else if (result.insertId){
        // Upon successful insertion, send the expense back
        db.query('SELECT * FROM Expenses WHERE id = ? AND user_id = ?;', [result.insertId, request.user.id], function(err, rows){
          if (err) {
            console.err(err);
          } else {
            response.status(201).json(rows[0]);
          }
        });
        // Also get the current user's information and update the total savings to account for the change
        db.query('SELECT * FROM Users WHERE id = ?;', [request.user.id], function(err, rows){
          if (err) {
            console.error(err);
            response.sendStatus(500);
          } else {
            // Calculate new savings
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
  // Similar to above:
  // Select for current info, update and return it
  db.query('SELECT * FROM Expenses WHERE id = ?', [request.params.id], function(err, rows){
    if(err){
      console.error(err);
      response.sendStatus(500);
    } else {
      var diff = rows[0].amount - amount;
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
              response.sendStatus(500);
            } else {
              response.status(200).json(rows[0]);
            }
          });
        }
      });
      // Also Update user
      db.query('SELECT * FROM Users WHERE id = ?', [request.user.id], function(err, rows){
        if(err){
          console.error(err);
          response.sendStatus(500);
        } else {
          var newTotal = rows[0].total_savings + diff;
          db.query('UPDATE Users SET total_savings = ? WHERE id = ?', [newTotal, request.user.id], function(err, result){
            if(err){
              console.error(err);
              response.sendStatus(500);
            }
          });
        }
      });
    }
  });
});

// Delete expense
router.delete('/expenses/:id', util.checkToken, function(request, response) {
  var id = request.params.id;
  // Before deleting the expense, get the amount information in order to update total savings
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

});

/**
 * Incomes
 *
 * See Expense logic for expenses
 * Incomes affect user.total_savings inversely
 *
 */

// Show all incomes
router.get('/incomes/:days', util.checkToken, function(request, response) {
  db.query('SELECT * FROM Incomes WHERE user_id = ? AND income_date > DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY income_date DESC;',
  [request.user.id, Number(request.params.days) || 30],
  function(err, rows) {
    if (err) {
      console.error(err);
      response.sendStatus(500);
    } else {
      response.json(rows);
    }
  });
});

// Add new income
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
  } else {
    response.sendStatus(400);
  }
});

// Update Income
router.put('/incomes/:id', util.checkToken, function(request, response) {
  var name = request.body.name;
  var amount = request.body.amount;
  var category = request.body.category;
  var notes = request.body.notes || null;
  var income_date = request.body.spent_date;
  var location = request.body.location || null;
  var lat = request.body.latlng || null;
  db.query('SELECT * FROM Incomes WHERE id = ?', [request.params.id], function(err, rows){
    if(err){
      console.error(err);
      response.sendStatus(500);
    } else {
      var diff = rows[0].amount - amount;
      db.query('UPDATE Incomes SET name = ?, amount = ?, category = ?, notes = ?, income_date = ?, location = ?, geocode = ? WHERE id = ?;',
      [name, amount, category, notes, income_date, location, lat, request.params.id],
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
      db.query('SELECT * FROM Users WHERE id = ?', [request.user.id], function(err, rows){
        if(err){
          console.error(err);
          response.sendStatus(500);
        } else {
          var newTotal = rows[0].total_savings + diff;
          db.query('UPDATE Users SET total_savings = ? WHERE id = ?', [newTotal, request.user.id], function(err, result){
            if(err){
              console.error(err);
              response.sendStatus(500);
            }
          });
        }
      });
    }
  });
});

// Delete income
router.delete('/incomes/:id', util.checkToken, function(request, response) {
  var id = request.params.id;
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
});

/**
 * Goals
 */

// Get all of the user's current goals
router.get('/goals', util.checkToken, function(request, response) {
  db.query('SELECT * FROM Goals WHERE user_id = ?;', [request.user.id], function(err, rows){
    if(err) {
      console.error(err);
      response.sendStatus(500);
    } else {
      response.status(200).json(rows);
    }
  });
});

// Add new Goal
router.post('/goals', util.checkToken, function(request, response) {
  var name = request.body.name;
  var amount = request.body.amount;
  var category = request.body.category;
  var notes = request.body.notes || null;
  if (name !== null && amount !== null && category !== null) {
    // Save and initialize Goal
    db.query('INSERT INTO Goals SET name = ?, amount = ?, saved_amount = 0, category = ?, notes = ?, user_id = ?;',
    [name, amount, category, notes, request.user.id],
    function(err, result){
      if(err) {
        console.error(err);
        response.sendStatus(500);
      } else {
        // Send it back
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
  }
});

// Add money to Goal
router.put('/goals/:id', util.checkToken, function(request, response) {
  var amount = request.body.amount;
  var id = request.params.id;
  // Get total_savings information, check whether transfer is possible
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
            // Calculate if the goal can be completed, if the amount entered is high enough
            // Update user info with possibly updated total_savings
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
});

// Remove money from Goal
router.patch('/goals/:id', util.checkToken, function(request, response) {
  var amount = request.body.amount;
  var id = request.params.id;
  // Similar to adding a goal, minus the check
  db.query('SELECT * FROM Goals WHERE id = ?;', [id], function(err, rows){
    if(err) {
      console.error(err);
      response.sendStatus(500);
    } else {
      // Do not let the goal savings fall below 0
      // Truncate the amount if the user's value is too high
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
});

// Delete Goal
router.delete('/goals/:id', util.checkToken, function(request, response) {
  var id = request.params.id;
  // Find and remove any saved money (return to toal_savings) if available
  db.query('SELECT * FROM Goals WHERE id = ?;', [id], function(err, rows){
    var savedAmount = rows[0].saved_amount;
    // Find the current user info and update
    db.query('SELECT * FROM Users WHERE id = ?;', [request.user.id], function(err, rows){
      var newTotal = savedAmount + rows[0].total_savings;
      db.query('UPDATE Users SET total_savings = ? WHERE id = ?;', [newTotal, request.user.id], function(err, results){
        if(err){
          console.error(err);
          response.sendStatus(500);
        }
      });
    });
    // Only if all other transactions are complete, delete the goal
    db.query('DELETE FROM Goals WHERE id = ?;', [id], function(err, result){
      if(err){
        console.error(err);
        response.sendStatus(500);
      } else {
        response.sendStatus(200);
      }
    });
  });

});

// Complete goal
router.post('/goals/:id', util.checkToken, function(request, response) {
  // Similar to adding money to a goal
  // Perform a check first to see whether savings is high enough to extract money
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
        // After deducting from user info
        // Gather all data necessary to convert the goal into an expense
        var name = rows[0].name;
        var category = rows[0].category;
        var notes = rows[0].notes || null;
        var spent_date = moment().format('YYYY-MM-DD HH:mm:ss');
        var location = null;
        // Delete the goal
        db.query('DELETE FROM Goals WHERE id = ?;', [request.params.id], function(err, results){
          if(err){
            console.error(err);
            response.sendStatus(500);
          }
        });
        // Add an expense
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
});

/**
 * Others
 */

// Dropbox logic
// intermediate page served to accept the user's Dropbox public key and saves it for the system to user
// automatically closes the window when authentication request is approved
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
