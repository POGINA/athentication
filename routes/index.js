var express = require('express');
var router = express.Router();
var User = require('../models/user.js')
var mid = require('../middleware')

// GET // profile
router.get('/profile',mid.requiresLogin, function(req, res, next) {
  User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.render('profile', { title: 'Profile', name: user.name, favorite: user.favoriteBook });
        }
      });
});

// GET / Login
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session Object
    req.session.destroy(function(err){
      if(err){
        return next(err);
      } else {
        // redirect user to home page after logging out
        return res.redirect('/');
      }
    });
  }
});

// GET / Login
router.get('/login', mid.loggedOut ,function(req,res,next){
  return res.render('login', { title: "Log In" });
});

// POST / Login
router.post('/login', function(req,res,next){
  if (req.body.email && req.body.password) {
    // this is called when the user is created.
    User.authenticate(req.body.email, req.body.password, function(error,user){
      if (error || !user){
        var err = new Error('Wrong email or password');
        err.status = 401;
        return next(err);
      } else {
      req.session.userId = user._id;
      return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('Email and Password are required.');
    err.status = 401;
    return next(err);
  }
});

// GET / Register
router.get('/register',mid.loggedOut,function(req,res, next){
    return res.render('register', {title: 'Sing Up'});
});

// POST // register
router.post('/register',function(req,res, next){

    if (req.body.email &&
        req.body.name &&
        req.body.favoriteBook &&
        req.body.password &&
        req.body.confirmPassword){

          // confirm that the user typed the password twice for confirmation
          if(req.body.password !== req.body.confirmPassword){
            var err = new Error('Passwords do not match');
            err.status = 401;
            return next(err);
          }

          // Create Object with form input
          var userData = {
            email: req.body.email,
            name: req.body.name,
            favoriteBook: req.body.favoriteBook,
            password: req.body.password
          };

          // user Schema's create method to insert data into mongo
          User.create(userData, function(error, user){
            if(error){
              return next(error);
            } else {
              req.session.userId = user._id;
              return res.redirect('/profile')
            }
          });

      } else {
        var err = new Error('All field are required.');
        err.status = 400;
        return next(err);
      }
})

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

module.exports = router;
