var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  phone: String
});

var venueSchema = mongoose.Schema({
  name: String,
  phone: String,
  reviews: [], //review ids
  // virtual stars, from reviews array
  location: {
    latitude: Number,
    longitude: Number
  },
  photos: [],
  openHoursEST: {
    openTime: Number,
    closingTime: Number
  }
});

User = mongoose.model('User', userSchema);
Venue = mongoose.model('Venue', venueSchema);

module.exports = {
    User:User,
    Venue:Venue
};
