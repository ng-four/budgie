/**
 * MySQL Setup
 *
 * * Connects to the provided database, distinguishing between local and hosted environments
 * * Reads SQL file and executes if tables don't exist
 */

var mysql = require('mysql');
var fs = require('fs');

// Environment Checks
if (process.env.CLEARDB_DATABASE_URL) { // only available in Heroku/CleasDB setup
  var db = mysql.createConnection(process.env.CLEARDB_DATABASE_URL );
} else {
  // Connect to local MySql database
  var db = mysql.createPool({
    connectionLimit: 15,
    host     : 'localhost',
    user     :  require('./config.js').db.user, // Conditional loading of module
    password :  require('./config.js').db.password,
    database :  require('./config.js').db.database,
    multipleStatements: true
  });
}

// Handle Errors to keep app from crashing
db.on('error', function(){
  console.error("ERROR IN DATABASE");
});

// Initial DB Setup when Server starts
fs.readFile(__dirname + '/setup.sql', 'utf-8', function(err, data){
  if (err) {
    console.error(err);
  } else {
    data = data.split(";"); // Multiple statement work-around
    data.pop();
    data.forEach(function(item){
      db.query(item, function(err, results, fields){
        if (err) {
          console.error(err);
        } else {
          console.log('SQL Setup');
        }
      });
    });
  }
});

// 5-second keep-alive request
setInterval(function () {
    db.query('SELECT 1');
}, 5000);

// Expose for server use
module.exports = db;
