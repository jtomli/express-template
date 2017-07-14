var express = require('express');
var router = express.Router();
var models = require('../models');
var User = models.User;
var request = require('request');
var fs = require('fs');
var NodeGeocoder = require('node-geocoder');
var formResult = require('../output')

//////////////////////////////// PUBLIC ROUTES ////////////////////////////////
// Users who are not logged in can see these routes

router.get('/', function(req, res, next) {
  res.render('home', {googleApi: process.env.GOOGLEPLACES});
});

router.get('/wishlist', function(req, res, next) {
  res.render('wishlist');
})

router.post('/wishlist', function(req, res) {
  console.log(req.body)
})

router.post('/info', function(req, res) {
  console.log(req.body);
  var options = {
    provider: 'google',
    httpAdapter: 'https', // Default
    apiKey: process.env.GOOGLEPLACES
  };

  var geocoder = NodeGeocoder(options);
  // Using callback
  let lat;
  let long;
  geocoder.geocode(req.body.location, function(err, res) {
     lat = res[0].latitude;
     long = res[0].longitude;
    console.log(res, lat, long);
  });

  console.log('radius', (parseInt(req.body.radius) * 1609))

  request(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${process.env.GOOGLEPLACES}&location=${lat},${long}&radius=&type=${req.body.type}`, function(error, response, body) {
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
  // this gets the information from the form
  //(type=req.body.type location= req.body.location radius= req.body.radius * 10000)
  // we need to change the address into latitude/longitude
  // give this to an ajax request
  // push the object that comes back into several arrays in a data file [name,address,phone,ratings, opening time, closing time, photos, website]
  //this data file is picked up when you go to results >>>>>>> 25 c8c37efe858bdc740148a49eaa2590d053773e
})

router.get('/results', function(req, res, next) {
  // var sampleRestaurants = [];
  // for(var i = 0; i < formResult.length; i++) {
  //   var category = formResult[i];
  //
  // }

  var sampleRestaurants = [
    {
      name: "Julia's Kitchen",
      address: '1200 Red Barn Road, Lower Gwynedd, PA 19002',
      phone: '215-718-5073',
      rating: '5 stars',
      hours: '10 to 6'
    }, {
      name: "Reed's Kitchen",
      address: '329 12th Street, SOMA, CA 94103',
      phone: '345-333-2345',
      rating: '1 star',
      hours: '10 to 6'
    }
  ];
  res.render('list', {restaurants: sampleRestaurants});
});

router.get('/location', function(req, res) {

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
