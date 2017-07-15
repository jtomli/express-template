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
  phone: String,
  photos: [],
  address: String,
  rating: String,
  type: String,
  url: String
});

User = mongoose.model('User', userSchema);
Venue = mongoose.model('Venue', venueSchema);

module.exports = {
    User:User,
    Venue:Venue
};
