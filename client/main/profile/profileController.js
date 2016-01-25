angular.module('profile.controller', [])
.controller('ProfileController', function(ProfileServices, AuthServices){
	var profile = this;

	// placeholders for now...

	/*

	AuthServices.submitNewUser(
		{
		email: 'tom2@tom.com',
		password: 'tomtom',
		full_name: 'tom2',
		monthly_limit: 2000, 
		savings_goal: 15
	});
*/

	profile.loadProfile = function() {
		ProfileServices.getProfileData()
			.then(function(resp){
				profile.email = resp.email;
				profile.full_name = resp.full_name;			// could be resp.data or resp.body or whatever
				profile.monthly_limit = resp.monthly_limit;
				profile.savings_goal = resp.savings_goal;
			}, function(error){
				throw error;
			});
	};

	profile.updateLimit = function(newLimit){
		ProfileServices.updateLimit(newLimit)
			.then(function(resp){
				console.log(resp);
				$timeout(profile.loadProfile, 2000);     // reload updated profile
			}, function(error){
				throw error;
			});	
	};

	profile.updateSavings = function(newSavings){		// maybe specify savings *rate* or *goal*


	};

	/* TODO:

	functions for:

	 	retrieving profile info

	 	editing budget

	 	getting total savings

	 	get current savings rate
	 	edit   "        "

		get current goals
		add goal
		remove goal
		edit goal



	*/
	
})