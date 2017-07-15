var express = require('express');
var router = express.Router();
var models = require('../models');
var User = models.User;
var request = require('request');
var fs = require('fs');
var NodeGeocoder = require('node-geocoder');

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
  let lat;
  let long;
  geocoder.geocode(req.body.location).then(function(response) {
    lat = response[0].latitude;
    long = response[0].longitude;
    console.log(response, lat, long);
  }).then(function() {
    let radius = parseInt(req.body.radius) * 1609;
    let type = req.body.type.split(" ").join("_").toLowerCase();
    request(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${process.env.GOOGLEPLACES}&location=${lat},${long}&radius=${radius}&type=${type}`, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var obj = JSON.parse(body);
        var venues = [];
        obj.results.forEach(item => {
          venues.push({
            name: item.name,
            address: item.formatted_address,
            phone: item.formatted_phone_number,
            hours: item.opening_hours,
            rating: item.rating,
            type: item.types
          })
        });
        fs.writeFile('output.json', JSON.stringify(venues, null, 4), function(err) {
          console.log('File successfully written! - Check your project directory for the output.json file');
        })
        res.render('list', {venues: venues});
      }
    })
  }).catch(function(err) {
    console.log(err);
  });

  // this gets the information from the form
  //(type=req.body.type location= req.body.location radius= req.body.radius * 10000)
  // we need to change the address into latitude/longitude
  // give this to an ajax request
  // push the object that comes back into several arrays in a data file [name,address,phone,ratings, opening time, closing time, photos, website]
  //this data file is picked up when you go to results
})

router.get('/results', function(req, res, next) {
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

router.get('/venue/:venueId', function(req, res) {})

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
