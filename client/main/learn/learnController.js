angular.module('learn.controller', [])
.controller('LearnController', function(LearnServices, AuthServices, $http){
  var learn = this;
  learn.tweetsArr = [];

  learn.loadTweets = function() {
    console.log("profile.loadProfile called ");
    LearnServices.getTweets()
    .then(function(resp){
      console.log("this is resp in loadTweets", resp);
      learn.tweetsArr = resp.slice();
    }, function(error){
      console.error("loadTweets threw error.")
    });
  }

});
