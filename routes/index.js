var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var Airline = mongoose.model('Airline');
var Comment = mongoose.model('Comment');
var Airport = mongoose.model('Airport');
var Route = mongoose.model('Route');

router.get('/airlines', function(req, res, next){
  Airline.find(function(err, airlines){
    if(err){return next(err);}

    res.json(airlines);
  });
});

// get all airports
router.get('/airports', function(req, res, next){
  Airport.find(function(err, airports){
    if(err){return next(err);}

    res.json(airports);
  });
});



router.post('/airlines', function(req, res, next) {
  var airline = new Airline(req.body);

  airline.save(function(err, airline){
    if(err){ return next(err); }

    res.json(airline);
  });
});

router.post('/airports', function(req, res, next) {
  var airport = new Airport(req.body);

  airport.save(function(err, airport){
    if(err){ return next(err); }

    res.json(airport);
  });
});

//Preload airline objects on routes with ':airline'
router.param('airline', function(req, res, next, id){
  var query = Airline.findById(id);

  query.exec(function(err, airline){
    if(err){return next(err);}
    if(!airline){ return next(new Error("Can't find Airline."));}

    req.airline = airline;
    return next();
  });
});

//Preload comment objects on routes with ':comment'
router.param('comment', function(req, res, next, id){
  var query = Comment.findById(id);

  query.exec(function(err, comment){
    if(err) {return next(err);}
    if(!comment){return next(new Error("Can't find comment."));}

    req.comment = comment;
    return next();
  });
});

//Preload route objects on routes with ':route'
router.param('route', function(req, res, next, id){
  var query = Route.findById(id);

  query.exec(function(err, route){
    if(err){return next(err);}
    if(!route){return next(new Error("Can't find route."));}

    req.route = route;
    return next();
  });
});

//return an airline
router.get('/airlines/:airline', function(req, res, next){

req.airline.deepPopulate(['comments', 'routes', 'routes.arrivalAirport', 'routes.departureAirport'], function(err, airline){
  res.json(airline)
});


});

//uprate an airline
router.put('/airlines/:airline/uprate', function(req, res, next){
  req.airline.uprate(function(err, airline){
    if(err){return next(err);}

    res.json(airline);
  });
});

// create a new comment
router.post('/airlines/:airline/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.airline = req.airline;
  comment.author = 'Andrew';

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.airline.comments.push(comment);
    req.airline.save(function(err, airline) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});

// upvote a comment
router.put('/airlines/:airline/comments/:comment/upvote', function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  });
});



// create a new route
router.post('/airlines/:airline/routes', function(req, res, next) {
  var route = new Route(req.body);
  route.airline = req.airline;

  route.save(function(err, route){
    if(err){ return next(err); }

    req.airline.routes.push(route);
    req.airline.save(function(err, airline) {
      if(err){ return next(err); }
      route.deepPopulate(['arrivalAirport', 'departureAirport'], function(err, route){
        res.json(route);
      });

    });
  });
});

// edit a route
router.put('/routes/:route', function(req, res, next) {
  Route.findById(req.params.route,function (err, route) {
          if (err) res.send(err);
          if (req.body.price) route.price = req.body.price;
        if (req.body.capacity) route.capacity = req.body.capacity;
        if (req.body.occupied) route.occupied = req.body.occupied;
        if(req.body.arrivalDateTime) route.arrivalDateTime = req.body.arrivalDateTime;
        if(req.body.departureDateTime) route.departureDateTime = req.body.departureDateTime;
        if(req.body.departureAirport) route.departureAirport = req.body.departureAirport;
        if(req.body.arrivalAirport) route.arrivalAirport = req.body.arrivalAirport;
        if(req.body.duration) route.duration = req.body.duration;
          route.save( function (err, savedRoute){
              if (err) send (err);


              savedRoute.deepPopulate(['arrivalAirport', 'departureAirport'], function(err, route){
                res.json(route);
              });
          });
      });

});

// delete a route
router.delete('/routes/:route', function(req, res, next){

        Route.remove({
            _id: req.params.route
        }, function (err, route) {
            if (err) return res.send(err);

        //    res.status(200);
            res.json({ message: 'Deleted' });
        });

});

// get all routes
router.get('/routes', function(req, res, next){

  Route.find().deepPopulate(['arrivalAirport', 'departureAirport', 'airline']).exec(function(err, routes){
    if(err){return next(err);}
    res.json(routes);

  });
});




module.exports = router;
