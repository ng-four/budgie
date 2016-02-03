var mysql = require('mysql');
var fs = require('fs');

if (process.env.CLEARDB_DATABASE_URL) {
  var db = mysql.createConnection(process.env.CLEARDB_DATABASE_URL );
} else {
  // Connect to local MySql database
  var db = mysql.createPool({
    connectionLimit: 15,
    host     : 'localhost',
    user     :  require('./config.js').db.user,
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
    data = data.split(";");
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

// Keep-alive request
setInterval(function () {
    db.query('SELECT 1');
}, 5000);

module.exports = db;
