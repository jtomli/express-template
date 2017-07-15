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

let placeId;
let venues;

router.post('/info', function(req, res) {
  console.log('this our body',req.body);
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
        console.log("reading api body");
    return request(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${process.env.GOOGLEPLACES}&location=${lat},${long}&radius=${radius}&type=${type}`, function(error, response, body) {

      if (!error && response.statusCode == 200) {
        var obj = JSON.parse(body);
        placeId = [];
        obj.results.forEach(item => {
          placeId.push(item.place_id)
        });
        // fs.writeFile('output.json', JSON.stringify(placeId, null, 4), function(err) {
        //   console.log('File successfully written! - Check your project directory for the output.json file');
        // })
      }

      for (var i=0; i<placeId.length; i++){

          request(`https://maps.googleapis.com/maps/api/place/details/json?key=${process.env.GOOGLEPLACES}&placeid=${placeId[i]}`,
          function(error, response, body) {

            if (!error && response.statusCode == 200) {
              var obj2 = JSON.parse(body);
              console.log('second ', obj2.result)
              venues = [];
              obj2.result.forEach(item => {
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
          }
    })
    }
     //res.redirect('/results',{venues: venues});

    })
  })
  .catch(function(err) {
    console.log(err);
  });
})

router.get('/results', function(req, res, next) {
  console.log(venues);
  res.render('list', {venues: venues});
  // get queries
  //run shit ton of things you had in /post thingy
  //render
});

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
