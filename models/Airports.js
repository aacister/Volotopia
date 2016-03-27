var mongoose = require('mongoose');


var AirportSchema = new mongoose.Schema({
    name: String,
    code: String,
    city: String,
    state: String
});



mongoose.model('Airport', AirportSchema);
