var mongoose = require('mongoose');
mongoose.set('debug', true);

var AirportSchema = new mongoose.Schema({
    name: String,
    code: String,
    city: String,
    state: String
});



mongoose.model('Airport', AirportSchema);
