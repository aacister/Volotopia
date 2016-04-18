var mongoose = require('mongoose');

mongoose.set('debug', true);

var AirportSchema = new mongoose.Schema({
    name: String,
    code: String,
    city: String,
    state: String,
    location: {type: [Number], required: true}, // [Long, Lat]
});


mongoose.model('Airport', AirportSchema);
