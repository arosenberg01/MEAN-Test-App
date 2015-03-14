// BASE SETUP
// ==============================


// CALL THE PACKAGES ------------
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var port = process.env.PORT || 8080;
var User = require('./app/models/user');

// APP CONFIGURATION ------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Request-With,content-type, \ Authorization');
  next();
});

app.use(morgan('dev'));

mongoose.connect('mongodb://user1:meanapp@dbh56.mongolab.com:27567/mean-app');

// API ROUTES 
// ===============================
app.get('/', function(req, res) {
  res.send('Welcome to the home page!');
});

var apiRouter = express.Router();

// middleware to use for all requests
apiRouter.use(function(req, res, next) {
  // do logging
  console.log('A visitor came to the app!');
  next();
})

apiRouter.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!'});
});


// REGISTER ROUTES ---------------
app.use('/api', apiRouter);


// START SERVER
// ===============================
app.listen(port);
console.log('Listening on port ' + port);