angular.module('Volotopia', ['ui.router', 'angularMoment'])
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider){
            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: '/home.html',
                    controller: 'MainCtrl'
                })

                .state('airlinesNav',{
                  url: '/airlinesNav',
                  controller: 'AirlinesCtrl',
                  resolve: {
                      airlinesResolved: ['airlineFactory', function(airlineFactory){
                          return airlineFactory.getAll();
                      }]
                  }
                })
                .state('airlines', {
                    url: '/airlines',
                    templateUrl: '/airlines.html',
                    controller: 'AirlinesCtrl',
                    resolve: {
                        airlinesResolved: ['airlineFactory', function(airlineFactory){
                            return airlineFactory.getAll();
                        }]
                    }
                })

                .state('airline',{
                    abstract: true,
                    url: '/airlines/{id}',
                    templateUrl: '/airline.html',
                    controller: 'AirlineCtrl',
                    resolve: {
                        airline: ['$stateParams', 'airlineFactory', function($stateParams, airlineFactory){
                            return airlineFactory.get($stateParams.id);
                        }],
                        airportsResolved: ['airportFactory', function(airportFactory){
                          return airportFactory.getAll();
                        }]
                    }
                })

                .state('airline.routes', {
                    url: '',
                    templateUrl: '/airlineRoutes.html',
                    controller: 'AirlineCtrl',
                    data: {
                        activeTab: 'routes'

                    },
                    resolve: {
                        airline: ['$stateParams', 'airlineFactory', function($stateParams, airlineFactory){
                            return airlineFactory.get($stateParams.id);
                        }],
                        airportsResolved: ['airportFactory', function(airportFactory){
                          return airportFactory.getAll();
                        }]
                    }
                })

                .state('airline.comments', {
                    url: '/airlines/{id}/comments',
                    templateUrl: '/airlineComments.html',
                    controller: 'AirlineCtrl',
                    data: {
                        activeTab: 'comments'

                    },
                    resolve: {
                        airline: ['$stateParams', 'airlineFactory', function($stateParams, airlineFactory){
                            return airlineFactory.get($stateParams.id);
                        }],
                        airportsResolved: ['airportFactory', function(airportFactory){
                          return airportFactory.getAll();
                        }]
                    }
                })
                /*
                .state('routes',{
                    url: '/routes',
                    templateUrl: '/routes.html',
                    controller: 'RoutesCtrl',
                    resolve: {
                        routesResolved: ['routeFactory', function(routeFactory){
                            return routeFactory.getAll();
                        }]
                    }
                })
*/
            ;

            $urlRouterProvider.otherwise('home');
        }
    ])
.factory('airlineFactory', ['$http', function($http){
    var o = {
        airlines: []
    };
        /*
         {name: 'United', link: 'http://united.com', ratings: 5,
         comments:[{author: 'Andrew', body: 'Great service!', upvotes: 3},
         {author: 'Michael', body: 'The best.', upvotes: 2}]},
         {name: 'American', link: 'http://aa.com', ratings: 2,
         comments:[{author: 'Tom', body: 'Not the best!', upvotes: 1},
         {author: 'Michael', body: 'Needs work.', upvotes: 5},
         {author: 'Andrew', body: 'Can do better.', upvotes: 1}]},
         {name: 'Southwest', link: 'http://southwest.com', ratings: 1,
         comments:[{author: 'Heather', body: 'Love Southwest!', upvotes: 8}]},
         {name: 'JetBlue', link: 'http://jetblue.com', ratings: 20,
         comments:[{author: 'Jane', body: 'Cable on flight!', upvotes: 3},
         {author: 'Bill', body: 'Best wifi..', upvotes: 2},
         {author: 'Andrew', body: 'Rough trip', upvotes: 3},
         {author: 'Michael', body: 'Service was great.', upvotes: 2}]},
         {name: 'Spirit', link: 'http://spirit.com', ratings: 1, comments: []}
    }; */

    o.get = function(id){

        return $http.get('/airlines/' + id).then(function(res){
            return res.data;
        });

    };



    o.getAll = function() {
        return $http.get('/airlines').success(function(data){
            angular.copy(data.data, o.airlines);
        });
    };

    o.incrementRatings= function(airline){
        return $http.put('/airlines/' + airline._id + '/uprate', {

        }).success(function(data){
            airline.ratings +=1;
        });
    };

    o.getCommentsCount= function(airline){
       return airline.comments.length;


    };



    o.upvoteComment = function(airline, comment) {

        return $http.put('/airlines/' + airline._id + '/comments/'+ comment._id + '/upvote').success(function(data){
            comment.upvotes += 1;
        });
    };

    o.addComment = function(id, comment){
        return $http.post('/airlines/' + id + '/comments', comment);
    };

    o.addRoute = function(id, route){
        return $http.post('/airlines/' + id + '/routes', route);
    };
    o.editRoute = function(id, route){

      return $http.put('/routes/' + id, route );
    }

    o.deleteRoute = function(id){
      return $http.delete('/routes/' + id);
    }
    o.getRoutesCount= function(airline){
       return airline.routes.length;
    };

    return o;

}])
.factory('airportFactory', ['$http', function($http){
    var o = {
        airports: []
    };

    o.getAll = function() {
        return $http.get('/airports').success(function(data){
            angular.copy(data.data, o.airports);
        });
    };

    return o;
  }])
/*
    .factory('routeFactory', ['$http', function($http) {
        var o = {
            routes: []
        };

        o.get = function(id){

            return $http.get('/routes/' + id).then(function(res){
                return res.data;
            });

        };

        o.getAll = function() {
            return $http.get('/routes').success(function(data){
                angular.copy(data.data, o.routes);
            });
        };




        return o;
    }])
    */
    .controller('MainCtrl', [
        '$scope',
        'airlineFactory',
        function($scope, airlineFactory){

            $scope.test = "Volotopia is currently work in progress.  The site is modeled after a travel agency site, where a user can browse, and purchase airline flights. " +
            "The site stands as a means to publish my work within the MEAN stack (Mongo, Express.js, Angular.js, Node.js). Volotopia is not to be viewed as a professional site, as it has been " +
             "quickly designed and constructed for sharpening, and training my development skills.  Currently, the Airlines tab exists, and I expect the application will be complete come early April 2016.  It should be " +
                "noted, the site exists mainly to show function, and I do not profess to be a designer.  That being said, it is desired, at completion, to have the application scaled to multiple screens, whether mobile or desktop, using bootstrap. ";
            $scope.signature = "-- Andrew A. Cisternino";
      /*         "\n Lorem ipsum dolor sit amet, mea id velit civibus consetetur, ad nobis eruditi vix, putant nusquam eum at. In esse eius facilis has, vim ad mentitum urbanitas. Vis at saperet praesent, mei propriae suavitate no, eu sit falli constituam. Viris assueverit mediocritatem pro cu, eum viris iriure electram ex. An falli exerci his, sea modo dictas facilisis te." +

                "Id has nonumy adversarium ullamcorper. Ut qui assentior cotidieque eloquentiam, vix dico detracto an. Cu has autem ornatus meliore. Eu vix sanctus patrioque, porro adipisci consetetur has an. Te per dolore regione definiebas, at corpora mediocritatem cum. " +

                "Eam vero epicuri no, ex usu ridens comprehensam concludaturque. Et ius nominati necessitatibus, modo liber veritus ut his. Ea pri esse saepe antiopam. Nostro appareat ius ne. Sed elit instructior no, quando mediocrem expetenda mea et. " +

                "Putant dissentiet ex eos. Quis primis has ea, no nullam saperet meliore quo. Epicurei convenire eu pri, cu wisi velit nihil quo, eum ut nostrud aliquid moderatius. Torquatos repudiandae usu at, cu omnis laoreet intellegebat has, mundi complectitur ut duo. Ea consul vivendo vel. " +

                "Pertinacia adipiscing eu ius, ex cum epicurei consequuntur. Te mundi oporteat his, sit ut nostro assentior, at eos dicta eripuit referrentur. Te atqui etiam vix, eu pri hinc elitr. At scripta hendrerit sea, id nisl novum habemus duo, at tation nostrud dolorum vis. Eum cu omnes habemus voluptua, quo error errem necessitatibus ea.";
*/
                $scope.airlines = function(){
                  var allAirlines = airlineFactory.getAll();
                  return allAirlines;
                };
        }


    ])
    .controller('AirlinesCtrl',['$scope', 'airlineFactory', 'airlinesResolved',
    function($scope, airlineFactory, airlinesResolved){
        $scope.airlines=airlinesResolved.data;

        $scope.incrementRatings = function(airline){
            airlineFactory.incrementRatings(airline);
        };

        $scope.getCommentsCount = function(airline) {
            return airlineFactory.getCommentsCount(airline);
        };


    }])
    .controller('AirlineCtrl', ['$scope', '$state', 'airlineFactory','airline', 'airportsResolved',
    function($scope, $state, airlineFactory, airline, airportsResolved){
        $scope.airline=airline;

        $scope.airports = airportsResolved.data;
        $scope.isAddComment=false;
        $scope.isAddRouteVisible = false;
        $scope.isEditRouteVisible = false;
        $scope.editableRoute = {};

        $scope.activeLink = function(n) {
            return ($state.is(n) ? "active" : "");
        };


        $scope.tabBgColor = function(goToTab){
          if($state.current.data.activeTab === goToTab)
            return 'navy';
          else {
            return 'white';
          }
        };

        $scope.addComment = function(){
            if($scope.body === '') { return; }
            airlineFactory.addComment(airline._id, {
                body: $scope.body,
                author: 'Andrew',
                upvotes: 0
            }).success(function( comment){
                $scope.airline.comments.push(comment);
            });
            $scope.body = '';
            $scope.isAddComment = false;
        };

        $scope.showAddComment = function(){
          return $scope.isAddComment;
        }
        $scope.addCommentClicked = function(){
          $scope.isAddComment = true;
        };

        $scope.removeCommentClicked = function(){
          $scope.isAddComment = false;
        }

        $scope.incrementRatings = function(airline){
            airlineFactory.incrementRatings(airline);
        };

        $scope.incrementUpvotes = function(comment){
            airlineFactory.upvoteComment(airline, comment);
        };

        $scope.addRoute = function(){
          if($scope.departureAirport === '' || $scope.departureDateTime === '' || $scope.arrivalAirport === '' || $scope.arrivalDateTime === ''
          || $scope.price === '' || $scope.occupied ==='' || $scope.capacity === '') {return;}
          airlineFactory.addRoute(airline._id, {
            departureAirport: $scope.departureAirport,
            departureDateTime: $scope.departureDateTime,
            arrivalDateTime: $scope.arrivalDateTime,
            arrivalAirport: $scope.arrivalAirport,
            price: $scope.price,
            occupied: $scope.occupied,
            capacity: $scope.capacity
          }).success(function(route){
            $scope.airline.routes.push(route);
          });
          $scope.departureAirport = '';
          $scope.departureDateTime = '';
          $scope.arrivalAirport = '';
          $scope.arrivalDateTime = '';
          $scope.price = '';
          $scope.occupied = '';
          $scope.capacity = '';
          $scope.isAddRouteVisible = false;
        };

        $scope.showAddRoute = function(){
            return $scope.isAddRouteVisible;
        }
        $scope.addRouteClicked = function(){
          $scope.isAddRouteVisible = true;
        };

        $scope.removeRouteClicked = function(){
          $scope.isAddRouteVisible = false;
        }

        $scope.hideEditRouteForm = function(){
          $scope.isEditRouteVisible = false;
        };

        $scope.showEditRoute = function (route) {
            $scope.isEditRouteVisible = true;
        //    var departDate = new Date(route.departureDateTime).toISOString();
        //    var arriveDate = new Date(route.arrivalDateTime).toISOString();
        //    route.departureDateTime =  departDate;
        //    route.arrivalDateTime = moment(arriveDate, "MM/DD/YYYY");
            $scope.editableRoute= angular.copy(route);

        };

        $scope.saveRoute = function() {

              airlineFactory.editRoute($scope.editableRoute._id, $scope.editableRoute)
             .success(function (route) {
                airline.routes = $.grep(airline.routes, function(e){
                 return e._id != route._id;
               });
               airline.routes.push(route);

             });
             $scope.editableRoute = {};
             $scope.isEditRouteVisible = false;
           };

           $scope.deleteRoute = function(route){
              airlineFactory.deleteRoute(route._id).success(function(){
                airline.routes = $.grep(airline.routes, function(e){
                  return e._id != route._id;
                });

              });
           };
    }])

    .controller('RoutesCtrl',['$scope', 'routeFactory', 'routesResolved',
        function($scope, routeFactory, routesResolved){
            $scope.routes=routesResolved.data;


        }])
    .controller('NavCtrl', [
        '$scope',
        '$state',
        'airlineFactory',
        function($scope, $state, airlineFactory){
            $scope.airlines = [];
            $scope.activeLink = function(n) {
                return ($state.is(n) ? "active" : "");
            };

          $scope.getAirlines = function(){
              airlineFactory.getAll().success(function(airlines){
                $scope.airlines = airlines;
              });

            };
/*
            $scope.toggled = function() {
            //   if (open) {
                 airlineFactory.getAll().success(function(airlines){
                   $scope.airlines = airlines;
                 });
            //   }
          };
/*
            $scope.airlines = [{name: 'United', link: 'http://united.com', ratings: 5,
            comments:[{author: 'Andrew', body: 'Great service!', upvotes: 3},
            {author: 'Michael', body: 'The best.', upvotes: 2}]},
            {name: 'American', link: 'http://aa.com', ratings: 2,
            comments:[{author: 'Tom', body: 'Not the best!', upvotes: 1},
            {author: 'Michael', body: 'Needs work.', upvotes: 5},
            {author: 'Andrew', body: 'Can do better.', upvotes: 1}]},
            {name: 'Southwest', link: 'http://southwest.com', ratings: 1,
            comments:[{author: 'Heather', body: 'Love Southwest!', upvotes: 8}]},
            {name: 'JetBlue', link: 'http://jetblue.com', ratings: 20,
            comments:[{author: 'Jane', body: 'Cable on flight!', upvotes: 3},
            {author: 'Bill', body: 'Best wifi..', upvotes: 2},
            {author: 'Andrew', body: 'Rough trip', upvotes: 3},
            {author: 'Michael', body: 'Service was great.', upvotes: 2}]},
            {name: 'Spirit', link: 'http://spirit.com', ratings: 1, comments: []}]; */
        }]);
