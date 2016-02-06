// Express Setup
var express = require('express');
var app = express();

// Middleware
var parser = require('body-parser');
app.use(parser.json());
var cors = require('cors');
app.use(cors());


// Set what we are listening on (Env check)
app.set("port", process.env.PORT || 8000);

// Serving static files from client directory. Work around only.
var dirname = __dirname;
dirname = dirname.slice(0,-6);
app.use(express.static(dirname + '/client/'));

// Connect to Routes
var router = require('./routes.js');
app.use("/", router);

// If we are being run directly, run the server
if (!module.parent) {
    app.listen(app.get("port"));
    console.log("Listening on", app.get("port"));
}
