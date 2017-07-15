// Add Passport-related auth routes here.
var express = require('express');
var router = express.Router();
var models = require('../models');

module.exports = function(passport) {

  // GET registration page
  router.get('/signup', function(req, res) {
    res.render('signup');
  });

  router.post('/signup', function(req, res) {
    // validation step
    if (req.body.password!==req.body.passwordRepeat) {
      return res.render('signup', {
        error: "Passwords don't match."
      });
    }
    var cart = new models.Cart({
      cart: []
    })
    cart.save(function(err, cart) {
      var u = new models.User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        fname: req.body.fname,
        lname: req.body.lname,
        cart: cart._id
      });
      u.save(function(err, user) {
        if (err) {
          console.log(err);
          res.status(500).redirect('/register');
          return;
        }
        console.log(user);
        res.redirect('/login');
      });
    })
  });

  // GET Login page
  router.get('/login', function(req, res) {
    res.render('login');
  });

  // POST Login page
  router.post('/login', passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login'
  }));

  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  return router;
};
