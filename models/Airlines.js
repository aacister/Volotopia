var mongoose = require('mongoose');


mongoose.set('debug', true);
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var AirlineSchema = new mongoose.Schema({
    title: String,
    link: String,
    ratings: {
        type: Number,
        default: 0
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    routes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
    }]
});

AirlineSchema.plugin(deepPopulate);

AirlineSchema.methods.uprate = function(cb) {
    this.ratings += 1;
    this.save(cb);
};


mongoose.model('Airline', AirlineSchema);
