var express = require('express');
var router = express.Router();
var models = require('../models');
var User = models.User;
var request = require('request');
var fs = require('fs');

//////////////////////////////// PUBLIC ROUTES ////////////////////////////////
// Users who are not logged in can see these routes

router.get('/', function(req, res, next) {
  res.render('home');
});

router.get('/results', function(req, res, next) {
  var sampleRestaurants = [
    {
      name: "Julia's Kitchen",
      address: '1200 Red Barn Road, Lower Gwynedd, PA 19002',
      phone: '215-718-5073',
      rating: '5 stars',
      hours: '10 to 6'
    },
    {
      name: "Reed's Kitchen",
      address: '329 12th Street, SOMA, CA 94103',
      phone: '345-333-2345',
      rating: '1 star',
      hours: '10 to 6'
    },

  ]
  res.render('list', {
    restaurants: sampleRestaurants
  });
});

router.get('/location', function(req, res) {
  request(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${process.env.GOOGLEPLACES}&location=39.951883,-75.173872&radius=50000&type=library`, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var obj = JSON.parse(body);
      var printObj = {
        name: [],
        price_level: [],
        rating: []
      };
      obj.results.forEach(item => {
        printObj.name.push(item.name);
        printObj.price_level.push(item.price_level);
        printObj.rating.push(item.rating);
      })
      fs.writeFile('output.json', JSON.stringify(printObj, null, 4), function(err) {
        console.log('File successfully written! - Check your project directory for the output.json file');
      })
    }
  })
  // $(document).ready($.ajax({
  //   url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key${process.env.GOOGLEPLACES}=&location=39.9519,75.1739&radius=16000`,
  //   success: function(result) {
  //     console.log(result);
  //   },
  //   error: function(error) {
  //     console.log(error);
  //   }
  // }))

})

///////////////////////////// END OF PUBLIC ROUTES /////////////////////////////

router.use(function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});

//////////////////////////////// PRIVATE ROUTES ////////////////////////////////
// Only logged in users can see these routes

router.get('/protected', function(req, res, next) {
  res.render('protectedRoute', {username: req.user.username});
});

///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
