var express = require('express');
var path = require('path');
var logger = require('morgan');
var cors = require('cors')
var bodyParser = require('body-parser');

var app = express();

app.use(cors())
app.set('port', process.env.PORT || 8000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', express.static(__dirname));

console.log("Listening on port 8000");

app.listen(app.get('port'));