var mysql = require('mysql');
var fs = require('fs');

// if (process.env.CLEARDB_DATABASE_URL) {
//   var db = mysql.createConnection({
//     host     : 'localhost',
//     user     : 'root',
//     password : '',
//     database : 'budgie',
//     multipleStatements: true
//   });
// } else {
// Connect to local MySql database
  var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'budgie',
    multipleStatements: true
  });
// }

db.connect();

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
      }
    });
  }
});

module.exports = db;
