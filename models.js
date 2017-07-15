var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  email: String,
  fname: String,
  lname: String
});

var venueSchema = mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  rating: String,
  type: String,
  photos: Array,
  url: String,
  website: String
});

User = mongoose.model('User', userSchema);
Venue = mongoose.model('Venue', venueSchema);

module.exports = {
    User:User,
    Venue:Venue
};
