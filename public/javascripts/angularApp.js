angular.module('Volotopia', ['ui.router', 'angularMoment', 'toaster', ])
    .constant('angularMomentConfig', {
        preprocess: 'utc'
    })

.config([
        '$stateProvider',
        '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: '/home.html',
                    controller: 'MainCtrl'
                })

            .state('airlinesNav', {
                    url: '/airlinesNav',
                    controller: 'AirlinesCtrl',
                    resolve: {
                        airlinesResolved: ['airlineFactory', function(airlineFactory) {
                            return airline.getAll();
                        }]
                    }
                })
                .state('airlines', {
                    url: '/airlines',
                    templateUrl: '/airlines.html',
                    controller: 'AirlinesCtrl',
                    resolve: {
                        airlinesResolved: ['airlinesService', function(airlinesService) {
													return airlinesService.airlines;
                        }]
                    }
                })

            .state('airline', {
                abstract: true,
                url: '/airlines/{id}',
                templateUrl: '/airline.html',
                controller: 'AirlineCtrl',
                resolve: {
                    airline: ['$stateParams', 'airlineService', function($stateParams, airlineService) {
											return airlineService.getAirline($stateParams.id);
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
                    airline: ['$stateParams', 'airlineService', function($stateParams, airlineService) {
												return airlineService.getAirline($stateParams.id);
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
                    airline: ['$stateParams', 'airlineService', function($stateParams, airlineService) {
											return airlineService.getAirline($stateParams.id);
                    }]
                }
            })

            .state('routes', {
                    url: '/routes',
                    templateUrl: '/routes.html',
                    controller: 'RoutesCtrl',
                    resolve: {
											airlinesResolved: ['airlinesService', function(airlinesService) {
												return airlinesService.airlines;
											}]

                    }
                })
                .state('myFlights', {
                    url: '/myFlights',
                    templateUrl: '/myFlights.html',
                    controller: 'MyFlightsCtrl',
                    resolve: {
                        userResolved: ['auth', function(auth) {
                            return auth.getCurrentUser();
                        }]
                    }
                })
                .state('login', {
                    url: '/login',
                    templateUrl: '/login.html',
                    controller: 'AuthCtrl',
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (auth.isLoggedIn()) {
                            $state.go('home');
                        }

                    }]
                })
                .state('register', {
                    url: '/register',
                    templateUrl: '/register.html',
                    controller: 'AuthCtrl',
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (auth.isLoggedIn()) {
                            $state.go('home');
                        }
                    }]
                })
                .state('google', {
                    url: '/profile',
                    templateUrl: '/profile.html',
                    controller: 'AuthCtrl',
                    onEnter: ['$state', 'auth', '$location', function($state, auth, $location) {
                        if ($location.search().token) {
                            auth.saveToken($location.search().token);
                        }
                        if (!auth.isLoggedIn()) {
                            $state.go('login');
                        } else {
                            $state.go('home');
                        }


                    }],
                    resolve: {
                        userResolved: ['auth', function(auth) {
                            return auth.getCurrentUser();
                        }]
                    }
                })
                .state('profile', {
                    url: '/profile',
                    templateUrl: '/profile.html',
                    controller: 'ProfileCtrl',
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (!auth.isLoggedIn()) {
                            $state.go('home');
                        }
                    }],
                    resolve: {
                        userResolved: ['auth', function(auth) {
                            return auth.getCurrentUser();
                        }]
                    }
                });



            $urlRouterProvider.otherwise('home');
        }
    ])
    .run(['airportService', 'airlinesService', function(airportService, airlinesService) {
        airportService.initializeAirports();
        airlinesService.initializeAirlines();

    }])
    .service('airportService', ['$rootScope', '$http', '$q', function($rootScope, $http, $q) {
        var service = {
            airports: [],
            initializeAirports: function() {
                var deferred = $q.defer();
                $http.get('/airports').success(function(data) {
                    angular.copy(data, service.airports);
                    $rootScope.$broadcast('airports.update');
                    deferred.resolve(service.airports);
                }).error(function(msg) {
                    deferred.reject(msg);
                });

                return deferred.promise;


            }
        }
        return service;
    }])
    .service('airlineService', ['$rootScope', '$http', '$q', 'auth', function($rootScope, $http, $q, auth) {

        var service = {

            airline: {},

            setAirline: function(id) {
                return $http.get('/airlines/' + id).success(function(data) {
                    angular.copy(data, service.airline);
                    return service.airline;
                });
            },
						getAirline: function(id){
							return $http.get('/airlines/' + id);
						},
            addRoute: function(route) {
                var deferred = $q.defer();
                $http.post('/airlines/' + service.airline._id + '/routes', route, {
                    headers: {
                        Authorization: 'Bearer ' + auth.getToken()
                    }
                }).success(function(route) {
                    service.airline.routes.push(route);
                    deferred.resolve(service.airline);
                }).error(function(msg) {
                    deferred.reject(msg);
                });

                return deferred.promise;

            },


            addComment: function(comment) {
                var deferred = $q.defer();
                $http.post('/airlines/' + service.airline._id + '/comments', comment, {
                    headers: {
                        Authorization: 'Bearer ' + auth.getToken()
                    }
                }).success(function(comment) {
                    service.airline.comments.push(comment);
                    deferred.resolve(service.airline);
                }).error(function(msg) {
                    deferred.reject(msg);
                });

                return deferred.promise;

            },
            getCommentCount: function() {
                return service.airline.comments.length;
            },
            editRoute: function(route) {
                var deferred = $q.defer();
                $http.put('/routes/' + route._id, route, {
                    headers: {
                        Authorization: 'Bearer ' + auth.getToken()
                    }
                }).success(function(route) {
                    service.airline.routes = $.grep(service.airline.routes, function(e) {
                        return e._id != route._id;
                    });
                    service.airline.routes.push(route);
                    deferred.resolve(service.airline);
                }).error(function(msg) {
                    deferred.reject(msg);
                });

                return deferred.promise;

            },

						bookFlight: function(userId, route) {
								var deferred = $q.defer();
								$http.put('/user/' + userId + '/routes/' + route._id + '/book', route, {
										headers: {
												Authorization: 'Bearer ' + auth.getToken()
										}
								}).success(function(route) {
										service.airline.routes = $.grep(service.airline.routes, function(e) {
												return e._id != route._id;
										});
										service.airline.routes.push(route);
										deferred.resolve(service.airline);
								}).error(function(msg) {
										deferred.reject(msg);
								});

								return deferred.promise;

						},


            deleteRoute: function(route) {
                var deferred = $q.defer();
                $http.delete('/routes/' + route._id, {
                    headers: {
                        Authorization: 'Bearer ' + auth.getToken()
                    }
                }).success(function(msg) {
                    service.airline.routes = $.grep(service.airline.routes, function(e) {
                        return e._id != route._id;
                    });
                    deferred.resolve(service.airline);

                }).error(function(msg) {
                    deferred.reject(msg);
                });
                return deferred.promise;
            },

            upvoteComment: function(comment) {
                var deferred = $q.defer();
                $http.put('/airlines/' + service.airline._id + '/comments/' + comment._id + '/upvote', null, {
                    headers: {
                        Authorization: 'Bearer ' + auth.getToken()
                    }
                }).success(function(comment) {
                    service.airline.comments = $.grep(service.airline.comments, function(e) {
                        return e._id != comment._id;
                    });
                    service.airline.comments.push(comment);
                    deferred.resolve(service.airline);
                }).error(function(msg) {
                    deferred.reject(msg);
                });

                return deferred.promise;

            },

            incrementRatings: function() {
                var deferred = $q.defer();
                $http.put('/airlines/' + service.airline._id + '/uprate', null, {
                    headers: {
                        Authorization: 'Bearer ' + auth.getToken()
                    }
                }).success(function(airline) {
                    service.airline = airline;
                    deferred.resolve(service.airline);
                }).error(function(msg) {
                    deferred.reject(msg);
                });

                return deferred.promise;
            }


        };

        return service;
    }])
    .service('airlinesService', ['$rootScope', '$http', '$q', 'auth', 'airlineService', function($rootScope, $http, $q, auth, airlineService) {
        var service = {
            airlines: [],
            initializeAirlines: function() {
                var deferred = $q.defer();
                $http.get('/airlines').success(function(data) {
                    angular.copy(data, service.airlines);
                    $rootScope.$broadcast('airlines.update');
                    deferred.resolve(service.airlines);
                }).error(function(msg) {
                    deferred.reject(msg);
                });

                return deferred.promise;

            },

            addAirlineRoute: function(id, route) {
                var deferred = $q.defer();
                airlineService.setAirline(id).success(function() {
                    airlineService.addRoute(route).then(function(airline) {
                        service.airlines = $.grep(service.airlines, function(e) {
                            return e._id != id;
                        });
                        service.airlines.push(airline);
                        $rootScope.$broadcast('airlines.update');
                        deferred.resolve(route);
                    }, function(msg) {
                        deferred.reject(msg);
                    });
                });
                return deferred.promise;
            },

            editAirlineRoute: function(id, route) {
                var deferred = $q.defer();
                airlineService.setAirline(id).success(function() {
                    airlineService.editRoute(route).then(function(airline) {
                        service.airlines = $.grep(service.airlines, function(e) {
                            return e._id != id;
                        });
                        service.airlines.push(airline);

                        $rootScope.$broadcast('airlines.update');
                        deferred.resolve(route);
                    }, function(msg) {
                        deferred.reject(msg);
                    });
                });
                return deferred.promise;
            },

						bookAirlineFlight: function(userId, route) {
                var deferred = $q.defer();
								airlineService.setAirline(route.airline._id).success(function(){
									airlineService.bookFlight(userId, route).then(function(airline){
										service.airlines = $.grep(service.airlines, function(e) {
												return e._id != route.airline._id;
										});
										service.airlines.push(airline);

										$rootScope.$broadcast('airlines.update');
										deferred.resolve(route);
									}, function(msg){
										deferred.reject(msg);
									});
								});
                return deferred.promise;
            },

            deleteAirlineRoute: function(id, route) {
                var deferred = $q.defer();
                airlineService.setAirline(id).success(function() {
                    airlineService.deleteRoute(route).then(function(airline) {
                        service.airlines = $.grep(service.airlines, function(e) {
                            return e._id != id;
                        });
                        service.airlines.push(airline);
                        deferred.resolve(route);
                        $rootScope.$broadcast('airlines.update');
                    }, function(msg) {
                        deferred.reject(msg);
                    });
                });
                return deferred.promise;
            },

            addAirlineComment: function(id, comment) {
                var deferred = $q.defer();
                airlineService.setAirline(id).success(function() {
                    airlineService.addComment(comment).then(function(airline) {
                        service.airlines = $.grep(service.airlines, function(e) {
                            return e._id != id;
                        });
                        service.airlines.push(airline);
                        $rootScope.$broadcast('airlines.update');
                        deferred.resolve(comment);
                    }, function(msg) {
                        deferred.reject(msg);
                    });
                });
                return deferred.promise;
            },

            getAirlineCommentCount: function(id) {
                var deferred = $q.defer();
                airlineService.setAirline(id).success(function() {
                    var cnt = airlineService.getCommentCount();
                    deferred.resolve(cnt);
                });
                return deferred.promise;
            },

            upvoteAirlineComment: function(id, comment) {
                var deferred = $q.defer();
                airlineService.setAirline(id).success(function() {
                    airlineService.upvoteComment(comment).then(function(airline) {
                        service.airlines = $.grep(service.airlines, function(e) {
                            return e._id != id;
                        });
                        service.airlines.push(airline);
                        $rootScope.$broadcast('airlines.update');
                        deferred.resolve(service.airlines);
                    }, function(msg) {
                        deferred.reject(msg);
                    });
                });
                return deferred.promise;
            },

            incrementAirlineRatings: function(id) {
                var deferred = $q.defer();
                airlineService.setAirline(id).success(function() {
                    airlineService.incrementRatings().then(function(airline) {
                        service.airlines = $.grep(service.airlines, function(e) {
                            return e._id != id;
                        });
                        service.airlines.push(airline);
                        $rootScope.$broadcast('airlines.update');
                        deferred.resolve(service.airlines);
                    }, function(msg) {
                        deferred.reject(msg);
                    });
                });
                return deferred.promise;
            },



        };
        return service;
    }])

    .factory('auth', ['$http', '$window', '$state', function($http, $window, $state) {
        var auth = {};
        auth.saveToken = function(token) {
            $window.localStorage['volotopia-token'] = token;
        };

        auth.getToken = function() {
            return $window.localStorage['volotopia-token'];
        }

        auth.isLoggedIn = function() {
            var token = auth.getToken();

            if (token) {
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };

        auth.getCurrentUser = function() {
            if (auth.isLoggedIn()) {
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                var id = payload._id;
                return $http.get('/users/' + id).then(function(res) {
                    return res.data;
                });
            }
        };

        auth.currentUserId = function() {
            if (auth.isLoggedIn()) {
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload._id;
            }
        };


        auth.currentUser = function() {
            if (auth.isLoggedIn()) {
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.username;
            }
        };

        auth.register = function(user) {
            return $http.post('/register', user).success(function(data) {
                auth.saveToken(data.token);
            });
        };

        auth.logIn = function(user) {
            return $http.post('/login', user).success(function(data) {
                auth.saveToken(data.token);
            });
        };

        auth.logOut = function() {
            $window.localStorage.removeItem('volotopia-token');
            $state.go('login');
        };

        auth.googleLogIn = function() {
            return $http.get('/auth/google').success(function(data) {
                auth.saveToken(data.token);
            });


        }
        return auth;
    }])

.factory('airlineFactory', ['$http', 'auth', function($http, auth) {



    var o = {
        airlines: []
    };


    o.deleteFlight = function(userId, routeId) {
        return $http.delete('/user/' + userId + '/routes/' + routeId, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        });
    }

    return o;

}])

//filter on to, from, date
.filter('routeSearch', [function() {
        return function(data, from, to, departDate, airlines) {
            var output = [];
            if (!!to && !!from && !!departDate && airlines.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    var includesAirline = false;
                    for (var a = 0; a < airlines.length; a++) {
                        if (data[i].airline._id.indexOf(airlines[a]) !== -1) {
                            includesAirline = true;
                            break;
                        }
                    };

                    if (data[i].arrivalAirport._id.indexOf(to) !== -1 && data[i].departureAirport._id.indexOf(from) !== -1 && data[i].departureDateTime.indexOf((new Date(departDate)).toISOString()) !== -1 && includesAirline) {
                        output.push(data[i]);
                    }
                }
            } else if (!to && !!from && !!departDate && airlines.length > 0) {

                for (var i = 0; i < data.length; i++) {
                    var includesAirline = false;
                    for (var a = 0; a < airlines.length; a++) {
                        if (data[i].airline._id.indexOf(airlines[a]) !== -1) {
                            includesAirline = true;
                            break;
                        }
                    }
                    if (data[i].departureAirport._id.indexOf(from) !== -1 && data[i].departureDateTime.indexOf((new Date(departDate)).toISOString()) !== -1 && includesAirline) {
                        output.push(data[i]);
                    }
                }
            } else if (!!to && !from && !!departDate && airlines.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    var includesAirline = false;
                    for (var a = 0; a < airlines.length; a++) {
                        if (data[i].airline._id.indexOf(airlines[a]) !== -1) {
                            includesAirline = true;
                            break;
                        }
                    };
                    if (data[i].arrivalAirport._id.indexOf(to) !== -1 && data[i].departureDateTime.indexOf((new Date(departDate)).toISOString()) !== -1 && includesAirline) {
                        output.push(data[i]);
                    }
                }
            } else if (!!to && !from && !departDate && airlines.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    var includesAirline = false;
                    for (var a = 0; a < airlines.length; a++) {
                        if (data[i].airline._id.indexOf(airlines[a]) !== -1) {
                            includesAirline = true;
                            break;
                        }
                    };
                    if (data[i].arrivalAirport._id.indexOf(to) !== -1 && includesAirline) {
                        output.push(data[i]);
                    }
                }
            } else if (!to && !!from && !departDate && airlines.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    var includesAirline = false;
                    for (var a = 0; a < airlines.length; a++) {
                        if (data[i].airline._id.indexOf(airlines[a]) !== -1) {
                            includesAirline = true;
                            break;
                        }
                    };
                    if (data[i].departureAirport._id.indexOf(from) !== -1 && includesAirline) {
                        output.push(data[i]);
                    }
                }
            } else if (!!to && !!from && !departDate && airlines.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    var includesAirline = false;
                    for (var a = 0; a < airlines.length; a++) {
                        if (data[i].airline._id.indexOf(airlines[a]) !== -1) {
                            includesAirline = true;
                            break;
                        }
                    };
                    if (data[i].arrivalAirport._id.indexOf(to) !== -1 && data[i].departureAirport._id.indexOf(from) !== -1 && includesAirline) {
                        output.push(data[i]);
                    }
                }
            } else if (!to && !from && !departDate && airlines.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    var includesAirline = false;
                    for (var a = 0; a < airlines.length; a++) {
                        if (data[i].airline._id.indexOf(airlines[a]) !== -1) {
                            includesAirline = true;
                            break;
                        }
                    };
                    if (includesAirline) {
                        output.push(data[i]);
                    }
                }
            } else if (!!to && !!from && !!departDate && airlines.length <= 0) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].arrivalAirport._id.indexOf(to) !== -1 && data[i].departureAirport._id.indexOf(from) !== -1 && data[i].departureDateTime.indexOf((new Date(departDate)).toISOString()) !== -1) {
                        output.push(data[i]);
                    }
                }
            } else if (!!to && !!departDate && !from && airlines.length <= 0) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].arrivalAirport._id.indexOf(to) !== -1 && data[i].departureDateTime.indexOf((new Date(departDate)).toISOString()) !== -1) {
                        output.push(data[i]);
                    }
                }
            } else if (!!to && !!from && !departDate && airlines.length <= 0) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].arrivalAirport._id.indexOf(to) !== -1 && data[i].departureAirport._id.indexOf(from) !== -1) {
                        output.push(data[i]);
                    }
                }

            } else if (!!to && !from && !departDate && airlines.length <= 0) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].arrivalAirport._id.indexOf(to) !== -1) {
                        output.push(data[i]);
                    }
                }
            } else if (!to && !from && !!departDate && airlines.length <= 0) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].departureDateTime.indexOf((new Date(departDate)).toISOString()) !== -1) {
                        output.push(data[i]);
                    }
                }
            } else if (!to && !!from && !departDate && airlines.length <= 0) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].departureAirport._id.indexOf(from) !== -1) {
                        output.push(data[i]);
                    }
                }
            } else {

                output = data;
            }
            return output;
        }
    }])
    .controller('MainCtrl', [
        '$scope',
        'airlineService',
        function($scope, airlineService) {
            $scope.airlines = airlineService.airlines;
            $scope.test = "Volotopia is currently work in progress.  The site is modeled after a travel agency site, where a user can browse, and purchase airline flights. " +
                "The site stands as a means to publish my work within the MEAN stack (Mongo, Express.js, Angular.js, Node.js). Volotopia is not to be viewed as a professional site, as it has been " +
                "quickly designed and constructed for sharpening my development skills.";
            $scope.signature = "-- Andrew A. Cisternino";

        }


    ])
    .controller('AirlinesCtrl', ['$scope', 'airlineFactory', 'airlinesService',
        function($scope, airlineFactory, airlinesService) {
            $scope.airlines = airlinesServices.airlines;

            $scope.$on('airlines.update', function(event) {
                $scope.airlines = airlinesService.airlines;
            });

            $scope.incrementRatings = function(airline) {
                arilinesService.incrementAirlineRatings(airline._id);
            };

            $scope.getCommentsCount = function(airline) {

                return airlinesService.getAirlineCommentCount(airline._id);
            };


        }
    ])
    .controller('AirlineCtrl', ['$scope', '$state', 'auth', 'toaster', 'airlinesService', 'airlineFactory', 'airline', 'airportService',
        function($scope, $state, auth, toaster, airlinesService, airlineFactory, airline, airportService) {
            $scope.airline = airline.data;

            $scope.airports = airportService.airports;
            $scope.isAddComment = false;
            $scope.isAddRouteVisible = false;
            $scope.isEditRouteVisible = false;
            $scope.editableRoute = {};

            $scope.$on('airlines.update', function(event) {
                //Update $scope.airline
                var airlines = $.grep(airlinesService.airlines, function(e) {
                    return e._id == $scope.airline._id;
                });
                $scope.airline = airlines[0];
            });

            $scope.$on('airports.update', function(event) {
                $scope.airports = airportService.routes;
            });

            $scope.activeLink = function(n) {
                return ($state.is(n) ? "active" : "");
            };

            $scope.isLoggedIn = auth.isLoggedIn;

            $scope.tabBgColor = function(goToTab) {
                if ($state.current.data.activeTab === goToTab)
                    return 'navy';
                else {
                    return 'white';
                }
            };

            $scope.addComment = function() {
                if ($scope.body === '') {
                    return;
                }
                airlinesService.addAirlineComment($scope.airline._id, {
                    body: $scope.body,
                    upvotes: 0
                }).then(function(comment) {

                }, function(err){
									toaster.pop('error', 'Error', err);
								});
                $scope.body = '';
                $scope.isAddComment = false;
            };

            $scope.showAddComment = function() {
                return $scope.isAddComment;
            }
            $scope.addCommentClicked = function() {
                $scope.isAddComment = true;
            };

            $scope.removeCommentClicked = function() {
                $scope.isAddComment = false;
            }



            getDuration = function(date1, date2) {

                var ms = moment.utc(date2).diff(moment.utc(date1));
                return moment.duration(ms).asMinutes();

            };

            $scope.incrementRatings = function(airline) {
                airlinesService.incrementAirlineRatings(airline._id).then(function(airline) {}, function(error) {
                    toaster.pop('error', "Error", error);
                });

            };

            $scope.incrementUpvotes = function(comment) {
                airlinesService.upvoteAirlineComment($scope.airline._id, comment).then(function(airline) {}, function(error) {
                    toaster.pop('error', "Error", error);
                });

            };

            $scope.addRoute = function() {
                if ($scope.departureAirport === '' || $scope.departureDateTime === '' || $scope.arrivalAirport === '' || $scope.arrivalDateTime === '' || $scope.price === '' || $scope.occupied === '' || $scope.capacity === '') {
                    return;
                }

                var duration = getDuration($scope.departureDateTime, $scope.arrivalDateTime);

                airlinesService.addAirlineRoute($scope.airline._id, {
                    departureAirport: $scope.departureAirport,
                    departureDateTime: $scope.departureDateTime,
                    duration: duration,
                    arrivalDateTime: $scope.arrivalDateTime,
                    arrivalAirport: $scope.arrivalAirport,
                    price: $scope.price,
                    occupied: $scope.occupied,
                    capacity: $scope.capacity
                }).then(function(airline) {
                        $scope.departureAirport = '';
                        $scope.departureDateTime = '';
                        $scope.duration = '';
                        $scope.arrivalAirport = '';
                        $scope.arrivalDateTime = '';
                        $scope.price = '';
                        $scope.occupied = '';
                        $scope.capacity = '';
                        $scope.isAddRouteVisible = false;
                        toaster.pop('success.', "Success", "Route Added!");
                    },
                    function(error) {
                        toaster.pop('error', "Error", error);
                    });

            };

            $scope.showAddRoute = function() {
                return $scope.isAddRouteVisible;
            }
            $scope.addRouteClicked = function() {
                $scope.isAddRouteVisible = true;
            };

            $scope.removeRouteClicked = function() {
                $scope.isAddRouteVisible = false;
            }

            $scope.hideEditRouteForm = function() {
                $scope.isEditRouteVisible = false;
            };

            $scope.showEditRoute = function(route) {
                $scope.isEditRouteVisible = true;
                $scope.editableRoute = angular.copy(route);

            };

            $scope.saveRoute = function() {
                var duration = getDuration($scope.editableRoute.departureDateTime, $scope.editableRoute.arrivalDateTime);
                $scope.editableRoute.duration = duration;
                airlinesService.editAirlineRoute($scope.airline._id, $scope.editableRoute)
                    .then(function(airline) {
                        toaster.pop('success', "Success", "Route edited.");
                    }, function(error) {
                        toaster.pop('error', "Error", error);
                    });
                $scope.editableRoute = {};
                $scope.isEditRouteVisible = false;
            };

            $scope.deleteRoute = function(id, route) {
                airlinesService.deleteAirlineRoute(id, route).then(function() {
                        toaster.pop('success', "Success", "Deleted!");
                    },
                    function(error) {
                        toaster.pop('error', "Error", error);
                    });
            };
        }
    ])

.controller('RoutesCtrl', ['$scope', '$state', 'toaster', 'auth', 'airlinesService', 'airportService', 'airlinesResolved',
    function($scope, $state, toaster, auth,  airlinesService, airportService, airlinesResolved) {

        $scope.airports = airportService.airports;
        $scope.airlines = airlinesResolved;
				$scope.routes = getRoutes();
        $scope.isSearchResultsVisible = true;
        $scope.airlineFilters = [];
        $scope.isLoggedIn = auth.isLoggedIn;


        $scope.$on('airlines.update', function(event) {
						$scope.airlines = airlinesService.airlines;
            $scope.routes = getRoutes();
        });

        $scope.$on('airports.update', function(event) {
            $scope.airports = airportService.airports;
        })

				function getRoutes()
				{
					var routes = [];
					for ( x=0; x< $scope.airlines.length; x++) {
						var airline = $scope.airlines[x];
						for(i=0; i<airline.routes.length; i++)
						{
							var route = airline.routes[i];
							routes.push(route);
						}
					}
					return routes;
				}

        $scope.setAirlineFilter = function($event, airline) {
            var id = airline._id;
            var checkbox = $event.target;
            var action = (checkbox.checked ? 'add' : 'remove');
            if (action == 'add' & $scope.airlineFilters.indexOf(id) == -1) $scope.airlineFilters.push(id);
            if (action == 'remove' && $scope.airlineFilters.indexOf(id) != -1) $scope.airlineFilters.splice($scope.airlineFilters.indexOf(id), 1);


        };

        $scope.bookFlight = function(route) {
            airlinesService.bookAirlineFlight(auth.currentUserId(), route).then(function(route) {
                    toaster.pop('success', "Success", "Booked!");
                },
                function(error) {
                    toaster.pop('error', "Error", error);
                });
        };

    }
])

.controller('MyFlightsCtrl', ['$scope', 'auth', 'airlineFactory', 'userResolved',
        function($scope, auth, airlineFactory, userResolved) {
            $scope.user = userResolved;
            $scope.isLoggedIn = auth.isLoggedIn;

            $scope.deleteFlight = function(flight) {
                airlineFactory.deleteFlight(auth.currentUserId(), flight._id).success(function() {
                    $scope.user.flights = $.grep($scope.user.flights, function(e) {
                        return e._id != flight._id;
                    });

                });
            };

        }
    ])
    .controller('AuthCtrl', [
        '$scope',
        '$state',
        'auth',

        function($scope, $state, auth) {

            $scope.user = {};


            $scope.register = function() {
                auth.register($scope.user).error(function(error) {
                    $scope.error = error;
                }).then(function() {
                    $state.go('profile');
                });
            };

            $scope.logIn = function() {
                auth.logIn($scope.user).error(function(error) {
                    $scope.error = error;
                }).then(function() {
                    $state.go('profile');
                });
            };



        }
    ])
    .controller('ProfileCtrl', [
        '$scope',
        '$state',
        'auth',
        'userResolved',
        function($scope, $state, auth, userResolved) {

            $scope.user = userResolved;

        }
    ])
    .controller('NavCtrl', [
        '$scope',
        '$state',
        'airlineFactory',
				'airlinesService',
        'auth',
        function($scope, $state, airlineFactory, airlinesService, auth) {
            $scope.airlines = [];
            $scope.activeLink = function(n) {
                return ($state.is(n) ? "active" : "");
            };
						$scope.$on('airlines.update', function(event) {
		            $scope.airlines = airlinesService.airlines;
		        })

            $scope.getAirlines = function() {
								$scope.airlines = airlinesService.airlines;
            };

            $scope.googleLogIn = function() {
                auth.googleLogIn().error(function(error) {
                    $scope.error = error;
                }).then(function() {
                    $state.go('profile');
                });
            };

            $scope.isLoggedIn = auth.isLoggedIn;
            $scope.currentUser = auth.currentUser;
            $scope.logOut = auth.logOut;

        }
    ]);
