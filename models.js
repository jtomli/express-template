var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  email: String,
  fname: String,
  lname: String,
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart'
  }
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

var cartSchema = mongoose.Schema({
  venues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue'
  }]
})

User = mongoose.model('User', userSchema);
Venue = mongoose.model('Venue', venueSchema);
Cart = mongoose.model('Cart', cartSchema);

module.exports = {
    User: User,
    Venue: Venue,
    Cart: Cart
};
