angular.module('learn.service', [])
.factory('LearnServices', function($http, $location, $window) {

  var getTweets = function() { //Get request to Twitter API via backend to query twitter for finance-related tweets
    return $http({
      method: 'GET',
      url: '/learn/',
    }).then(function(resp) {
      return resp.data.statuses;
    }, function(error) {
      console.error("loadTweets threw error.");
    });
  };

  return {
    getTweets: getTweets
	};

});
