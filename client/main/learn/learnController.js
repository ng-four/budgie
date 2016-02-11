angular.module('learn.controller', [])
.controller('LearnController', function(LearnServices, AuthServices, $http){
  var learn = this;
  learn.tweetsArr = [];

  learn.loadTweets = function() { //Loads finance tweets for the user via LearnServices
    LearnServices.getTweets()
    .then(function(resp){
      learn.tweetsArr = resp.slice();
    }, function(error){
      console.error("loadTweets threw error.");
    });
  };

});
