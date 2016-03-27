var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var RouteSchema = new mongoose.Schema({

    departureDateTime: {type: Date, default: Date.now},
    arrivalDateTime: {type: Date, default: Date.now},
    departureAirport: {type: mongoose.Schema.Types.ObjectId, ref: 'Airport'},
    arrivalAirport: {type: mongoose.Schema.Types.ObjectId, ref: 'Airport'},
    airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline' },
    occupied: {type: Number, default: 0},
    capacity: {type: Number, default: 0},
    price: {type: Number, default: 0},

});
RouteSchema.plugin(deepPopulate);
RouteSchema.methods.book = function(cb) {
    this.occupied += 1;
    this.save(cb);
};

mongoose.model('Route', RouteSchema);
