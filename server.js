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
var jwt = require('jsonwebtoken');

var superSecret = 'ilovescotch';

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

// route for authenticating users
apiRouter.post('/authenticate', function(req, res) {

  // find the user
  // explicity select the username and password
  User.findOne({
    username: req.body.username
  }).select('name username password').exec(function(err, user) {
    if (err) throw err;

    // no user with that username was found
    if (!user) {
      res.json({
        success: false,
        message: 'Authentication failed. User not found.'
      });
    } else if (user) {

      //check if password matches
      var validPassword = user.comparePassword(req.body.password);
      if (!validPassword) {
        res.json({
          success: false,
          message: 'Authentication failed. Wrong password.'
        });
      } else {

        // user is found and password is correct - create token
        var token = jwt.sign({
          name: user.name,
          username: user.username
        }, superSecret, {
          expiresinMinutes: 1440
        });

        // return the information, including token, as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }
    }
  });
});

// middleware to use for all requests
apiRouter.use(function(req, res, next) {
  // do logging
  console.log('A visitor came to the app!');
  next();
})

// on routes that end in /users
// ---------------------------------

apiRouter.route('/users')

  // create a user (accessed at POST http://localhost:8080/api/users)
  .post(function(req, res) {

    // creat a new instance of the User model
    var user = new User();

    // set the user's information (comes from request)
    user.name = req.body.name;
    user.username = req.body.username;
    user.password = req.body.password;

    // save the user and check for errors
    user.save(function(err) {
      if (err) {
        // duplicate entry
        if (err.code = 11000) {
          return res.json({ sucess: false, message: 'A user with that username already exists. '});
        } else {
          return res.send(err);
          console.log(err);
        }
      }

      res.json({ message: 'User created!' });
    });
  })

  // get all the users (accessed at GET http://localhost:8080/api/users)
  .get(function(req, res) {
    User.find(function(err, users) {
      if (err) {
        res.send(err) 
      }
      // return users
      res.json(users);
    });
  });

// on routes that end in /users/:user_id
// -------------------------------------
apiRouter.route('/users/:user_id')

  // get the user with that id
  // (accessed at GET http://localhost:8080/api/users/:user_id)
  .get(function(req, res) {
    User.findById(req.params.user_id, function(err, user) {
      if (err) res.send(err);

      // return that user
      res.json(user);
    });
  })

  // update the user with this id (accessed at PUT http://localhost:8080/api/users/:user_id)
  .put(function(req, res) {

    // user our user model to find the user we want
    User.findById(req.params.user_id, function(err, user) {
      if (err) res.send(err);

      // update the user's info if it's new
      if (req.body.name) user.name = req.body.name;
      if (req.body.username) user.username = req.body.username;
      if (req.body.password) user.password = req.body.password;

      // save the user
      user.save(function(err) {
        if (err) res.send(err);

        // return a message
        res.json({ message: 'User updated!' });
      });
    });
  })

  // delete the user with this id
  // accessed at DELETE http://localhost:8080/api/users/:user_id
  .delete(function(req,res) {
    User.remove({
      _id: req.params.user_id
    }, function(err, user) {
      if (err) return res.send(err);

      res.json({ message: 'Successfully deleted'});
    });
  });

// test route
apiRouter.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!'});
});


// REGISTER ROUTES ---------------
app.use('/api', apiRouter);


// START SERVER
// ===============================
app.listen(port);
console.log('Listening on port ' + port);