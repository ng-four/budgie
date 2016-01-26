angular.module('profile.controller', [])
.controller('ProfileController', function(ProfileServices, AuthServices, $timeout){
	var profile = this;

	profile.loadProfile = function() {
		console.log("profile.loadProfile called ");
		ProfileServices.getProfileData()
			.then(function(resp){
				profile.limitClicked = false;
				profile.savingsClicked = false;
				profile.email = resp.email;
				profile.full_name = resp.full_name;			// could be resp.data or resp.body or whatever
				profile.monthly_limit = resp.monthly_limit;
				profile.savings_goal = resp.savings_goal;
			}, function(error){
				throw error;
			});
	};

	profile.changeLimit = function() {
		profile.limitClicked = true;
	}

	profile.submitNewLimit = function(newLimit){
		ProfileServices.updateLimit(newLimit)
			.then(function(resp){
				console.log(resp);
				$timeout(profile.loadProfile, 1000);     // reload updated profile
			}, function(error){
				throw error;
			});	
	};

	profile.changeSavings = function() {
		profile.savingsClicked = true;
	}


	profile.submitNewSavings = function(newSavings){		// maybe specify savings *rate* or *goal*
		ProfileServices.updateSavings(newSavings)
			.then(function(resp){
				console.log("resp in updateSavings ", resp);
				$timeout(profile.loadProfile, 1000);     // reload updated profile
			}, function(error){
				throw error;
			});
	};

	/* TODO:

	functions for:

	 	getting total savings

		get current goals
		add goal
		remove goal
		edit goal



	*/
	
})