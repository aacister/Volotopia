var mongoose = require('mongoose');
mongoose.set('debug', true);
var bcrypt   = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');


var FlightSchema = new mongoose.Schema({
    departureDateTime: {
        type: Date,
        default: Date.now
    },
    duration: {
        type: Number,
        default: 0
    },
    arrivalDateTime: {
        type: Date,
        default: Date.now
    },
    departureAirport: String,
    arrivalAirport: String,
    airline: String,
    price: {
        type: Number,
        default: 0
    },
});

var UserSchema = new mongoose.Schema({
    local: {
        username: {
            type: String,
            unique: true
        },
        password: String

    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    flights: [FlightSchema]
});

// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};


UserSchema.methods.generateJWT = function() {

    // set expiration to 60 days
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        _id: this._id,
        username: this.local.username,
        exp: parseInt(exp.getTime() / 1000),
    }, 'SECRET');
};
UserSchema.methods.generateGoogleJWT = function() {

    // set expiration to 60 days
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        _id: this._id,
        username: this.google.email,
        exp: parseInt(exp.getTime() / 1000),
    }, 'SECRET');
};



mongoose.model('User', UserSchema);
