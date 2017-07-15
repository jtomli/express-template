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
      res.render('list', {
        venues: req.session.search,
        googleApi: process.env.GOOGLEPLACES
      })
    } else {
      res.render('home', {googleApi: process.env.GOOGLEPLACES});
    }
  }
});

let placeId;
let venues = [];

router.post('/info', function(req, res) {
  console.log("search", req.session);
  if (req.session.search.length > 0) {
    res.render('list', {
      venues: req.session.search,
      googleApi: process.env.GOOGLEPLACES
    });
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
          venues.push(request(`https://maps.googleapis.com/maps/api/place/details/json?key=${process.env.GOOGLEPLACES}&placeid=${placeId[i]}`).then(resp => JSON.parse(resp)).then(obj2 => ({
            name: obj2.result.name,
            address: obj2.result.formatted_address,
            phone: obj2.result.formatted_phone_number,
            photos: obj2.result.photos,
            rating: obj2.result.rating,
            lat: obj2.result.geometry.location.lat,
            long: obj2.result.geometry.location.lng,
            hours: obj2.result.opening_hours
              ? obj2.result.opening_hours.weekday_text
              : ["Not found"],
            type: obj2.result.types,
            url: obj2.result.url,
            website: obj2.result.website,
            link: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=' + obj2.result.photos[0].photo_reference + '&key=' + process.env.GOOGLEPLACES
          })))
        }
        return Promise.all(venues)
      }).then(arrayOfResults => {
        req.session.search = arrayOfResults;
        res.render('list', {
          venues: arrayOfResults,
          googleApi: process.env.GOOGLEPLACES
        });
      }).catch(err => console.log("ERR", err))
    }).catch(function(err) {
      console.log(err);
    });
  }
})

router.get('/refresh', function(req, res) {
  req.session.search = [];
  res.redirect('/');
})

router.get('/venue/:venueName', function(req, res) {
  var name = req.params.venueName;
  req.session.search.forEach(venue => {
    if (venue.name === name) {
      res.render('venue', {venue});
    }
  })
})

router.post('/venue/:venueName', function(req, res) {
  console.log("cart registered");
})

router.post('/cart/:venueName', function(req, res) {
  User.findById(req.user._id).populate('cart').exec(function(err, user) {
    req.session.search.forEach(venue => {
      if (venue.name === req.params.venueName) {
        var newDbVenue = new Venue(venue);
        newDbVenue.save(function(err, savedVenue) {
          user.cart.venues.push(savedVenue._id);
          user.save(function() {
            res.render('cart', {cart: user.cart.venues});
          })
        })
      }
    })
  })
})

router.get('/showCart', function(req, res) {
  User.findById(req.user._id).populate('cart').exec(function(err, user) {
    console.log(user.cart.venues);
    res.render('cart', {venues: user.cart.venues})
  })
})

router.get('/wishlist', function(req, res, next) {
  res.render('wishlist');
})

router.post('/wishlist', function(req, res) {})


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
