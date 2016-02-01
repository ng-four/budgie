var mysql = require('mysql');
var fs = require('fs');


if (process.env.CLEARDB_DATABASE_URL) {
  var db = mysql.createConnection(process.env.CLEARDB_DATABASE_URL + "&multipleStatements=true");
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

// db.on('error', function(){console.log("ERROR LOG FOR DAYS, ERROR ERROR ERROR");});
// Read MySql schema and create tables if necessary
fs.readFile(__dirname + '/setup.sql', 'utf-8', function(err, data){
  if (err) {
    console.error(err);
  } else {
    db.query(data, function(err, results, fields){
      if (err) {
        console.error(err);
      } else {
        console.log('database successfully created');
        // db.destroy();
      }
    });
  }
});

module.exports = db;
