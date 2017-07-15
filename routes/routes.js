var express = require('express');
var router = express.Router();
var models = require('../models');
var User = models.User;
var Venue = models.Venue;
var request = require('request-promise');
var fs = require('fs');
var NodeGeocoder = require('node-geocoder');

//////////////////////////////// PUBLIC ROUTES ////////////////////////////////
// Users who are not logged in can see these routes

router.get('/', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    req.session.search = req.session.search || [];
    if (req.session.search.length > 0) {
      res.render('list', {venues: req.session.search})
    } else {
      res.render('home', {googleApi: process.env.GOOGLEPLACES});
    }
  }
});

router.get('/wishlist', function(req, res, next) {
  res.render('wishlist');
})

router.post('/wishlist', function(req, res) {
  console.log(req.body)
})

let placeId;
let venues = [];

router.post('/info', function(req, res) {
  if (req.session.search.length > 0) {
    console.log("search has items");
    res.render('list', {venues: req.session.search});
  } else {
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
    }).then(function() {
      let radius = parseInt(req.body.radius) * 1609;
      let type = req.body.type.split(" ").join("_").toLowerCase();
      return request(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${process.env.GOOGLEPLACES}&location=${lat},${long}&radius=${radius}&type=${type}`).then(resp => JSON.parse(resp)).then(obj => {
        placeId = [];
        obj.results.forEach(item => {
          placeId.push(item.place_id)
        });

        for (var i = 0; i < placeId.length; i++) {
          venues.push(request(`https://maps.googleapis.com/maps/api/place/details/json?key=${process.env.GOOGLEPLACES}&placeid=${placeId[i]}`).then(resp => JSON.parse(resp)).then(obj2 => {
            var newVenue = ({
              name: obj2.result.name,
              address: obj2.result.formatted_address,
              phone: obj2.result.formatted_phone_number,
              //   hours: obj2.result.opening_hours.weekday_text,
              photos: obj2.result.photos,
              rating: obj2.result.rating,
              type: obj2.result.types,
              url: obj2.result.url,
              website: obj2.result.website
            })
          }))
        }
        console.log('venues', venues[1]);
        return Promise.all(venues)
      }).then(arrayOfResults => {
        console.log("done!!!!!", arrayOfResults);
        req.session.search = arrayOfResults;
        res.render('list', {venues: arrayOfResults});
      }).catch(err => console.log("ERR", err))
    }).catch(function(err) {
      console.log(err);
    });
  }
})

router.get('/results', function(req, res, next) {
  res.render('list', {venues: venues});
  // get queries
  //run shit ton of things you had in /post thingy
  //render
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
