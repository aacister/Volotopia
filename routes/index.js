var express = require('express');
var passport = require('passport');
var jwt = require('express-jwt');

var router = express.Router();
var auth = jwt({
    secret: 'SECRET',
    userProperty: 'payload'
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var Airline = mongoose.model('Airline');
var Comment = mongoose.model('Comment');
var Airport = mongoose.model('Airport');
var Route = mongoose.model('Route');
var User = mongoose.model('User');

router.get('/airlines', function(req, res, next) {

  Airline.find().deepPopulate(['comments', 'routes']).exec(function(err, airlines) {
      if (err) {
          return next(err);
      }
      res.json(airlines);

  });
  /*
    Airline.find(function(err, airlines) {
        if (err) {
            return next(err);
        }
        airlines.deepPopulate(['comments', 'routes'], function(err, deepAirlines) {
            res.json(deepAirlines);
        });

    }); */
});

// get all airports
router.get('/airports', function(req, res, next) {
    Airport.find(function(err, airports) {
        if (err) {
            return next(err);
        }

        res.json(airports);
    });
});



router.post('/airlines', auth, function(req, res, next) {
    var airline = new Airline(req.body);

    airline.save(function(err, airline) {
        if (err) {
            return next(err);
        }

        res.json(airline);
    });
});

router.post('/airports', function(req, res, next) {
    var airport = new Airport(req.body);

    airport.save(function(err, airport) {
        if (err) {
            return next(err);
        }

        res.json(airport);
    });
});

//Preload airline objects on routes with ':airline'
router.param('airline', function(req, res, next, id) {
    var query = Airline.findById(id);

    query.exec(function(err, airline) {
        if (err) {
            return next(err);
        }
        if (!airline) {
            return next(new Error("Can't find Airline."));
        }

        req.airline = airline;
        return next();
    });
});

//Preload comment objects on routes with ':comment'
router.param('comment', function(req, res, next, id) {
    var query = Comment.findById(id);

    query.exec(function(err, comment) {
        if (err) {
            return next(err);
        }
        if (!comment) {
            return next(new Error("Can't find comment."));
        }

        req.comment = comment;
        return next();
    });
});

//Preload route objects on routes with ':route'
router.param('route', function(req, res, next, id) {
    var query = Route.findById(id);

    query.exec(function(err, route) {
        if (err) {
            return next(err);
        }
        if (!route) {
            return next(new Error("Can't find route."));
        }

        req.route = route;
        return next();
    });
});

//Preload user objects on routes with ':user'
router.param('user', function(req, res, next, id) {
    var query = User.findById(id);

    query.exec(function(err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new Error("Can't find user."));
        }

        req.user = user;
        return next();
    });
});

//return a user
router.get('/users/:user', function(req, res, next) {
    res.json(req.user);
});

//return an airline
router.get('/airlines/:airline', function(req, res, next) {

    req.airline.deepPopulate(['comments', 'routes', 'routes.arrivalAirport', 'routes.departureAirport'], function(err, airline) {
        res.json(airline);
    });


});

//uprate an airline
router.put('/airlines/:airline/uprate', auth, function(req, res, next) {
    req.airline.uprate(function(err, airline) {
        if (err) {
            return next(err);
        }

        res.json(airline);
    });
});

// create a new comment
router.post('/airlines/:airline/comments', auth, function(req, res, next) {
    var comment = new Comment(req.body);
    comment.airline = req.airline;
    comment.author = req.payload.username;


    comment.save(function(err, comment) {
        if (err) {
            return next(err);
        }

        req.airline.comments.push(comment);
        req.airline.save(function(err, airline) {
            if (err) {
                return next(err);
            }

            res.json(comment);
        });
    });
});

// upvote a comment
router.put('/airlines/:airline/comments/:comment/upvote', auth, function(req, res, next) {
    req.comment.upvote(function(err, comment) {
        if (err) {
            return next(err);
        }

        res.json(comment);
    });
});



// create a new route
router.post('/airlines/:airline/routes', auth, function(req, res, next) {
    var route = new Route(req.body);
    route.airline = req.airline;

    route.save(function(err, route) {
        if (err) {
            return next(err);
        }

        req.airline.routes.push(route);
        req.airline.save(function(err, airline) {
            if (err) {
                return next(err);
            }
            route.deepPopulate(['arrivalAirport', 'departureAirport'], function(err, route) {
                res.json(route);
            });

        });
    });
});

// edit a route
router.put('/routes/:route', auth, function(req, res, next) {
    Route.findById(req.params.route, function(err, route) {
        if (err) res.send(err);
        if (req.body.price) route.price = req.body.price;
        if (req.body.capacity) route.capacity = req.body.capacity;
        if (req.body.occupied) route.occupied = req.body.occupied;
        if (req.body.arrivalDateTime) route.arrivalDateTime = req.body.arrivalDateTime;
        if (req.body.departureDateTime) route.departureDateTime = req.body.departureDateTime;
        if (req.body.departureAirport) route.departureAirport = req.body.departureAirport;
        if (req.body.arrivalAirport) route.arrivalAirport = req.body.arrivalAirport;
        if (req.body.duration) route.duration = req.body.duration;
        route.save(function(err, savedRoute) {
            if (err) send(err);
            savedRoute.deepPopulate(['arrivalAirport', 'departureAirport'], function(err, route) {
                res.json(route);
            });
        });
    });

});

//delete a flight
router.delete('/user/:user/routes/:route', auth, function(req, res, next) {
    Route.findById(req.params.route, function(err, route) {
        route.unbook(function(err, unBookedRoute) {
            if (err) {
                return next(err);
            }
            //Remove user flight and Save user
            req.user.flights.id(route._id).remove();
            req.user.save(function(err) {
                if (err) {

                    return next(err);
                }
                res.json({
                    message: 'Deleted successfully.'
                });
            });
        });
    });

});

// book a flight
router.put('/user/:user/routes/:route/book', auth, function(req, res, next) {
    Route.findById(req.params.route, function(err, route) {
        route.book(function(err, bookedRoute) {
            if (err) {
                return next(err);
            }

            //save flight to User
            req.user.flights.push({
                _id: bookedRoute._id,
                departureDateTime: bookedRoute.departureDateTime,
                duration: bookedRoute.duration,
                arrivalDateTime: bookedRoute.arrivalDateTime,
                departureAirport: req.body.departureAirport.code,
                arrivalAirport: req.body.arrivalAirport.code,
                airline: req.body.airline.title,
                price: bookedRoute.price
            });

            req.user.save(function(err, savedUser) {
                if (err) {
                    return next(err);
                }

                bookedRoute.deepPopulate(['arrivalAirport', 'departureAirport', 'airline'], function(err, dBookedRoute) {
                    res.json(dBookedRoute);
                });

            });
        });
    });
});

// delete a route
router.delete('/routes/:route', auth, function(req, res, next) {

    Route.remove({
        _id: req.params.route
    }, function(err, route) {
        if (err) return next(err);

        res.json({
            message: 'Deleted successfully.'
        });
    });

});

// get all routes
router.get('/routes', function(req, res, next) {

    Route.find().deepPopulate(['arrivalAirport', 'departureAirport', 'airline']).exec(function(err, routes) {
        if (err) {
            return next(err);
        }
        res.json(routes);

    });
});


// process the login form
router.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
        if (err) {
            return next(err);
        }

        if (user) {
            return res.json({
                token: user.generateJWT()
            });
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});





// process the signup form
router.post('/register', function(req, res, next) {

    passport.authenticate('local-signup', function(err, user, info) {
        if (err) {

            return next(err);
        }
        if (user) {
            return res.json({
                token: user.generateJWT()
            });
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});


//Google
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/auth/google/callback', function (req, res, next) {
    passport.authenticate('google', function (err, user, info) {
        if (err) {
          return next(err);
        }

        if (user) {
          res.redirect('/#/profile?token=' + user.generateGoogleJWT());
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});




module.exports = router;
