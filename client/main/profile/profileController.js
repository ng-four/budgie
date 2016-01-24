angular.module('profile.controller', [])
.controller('ProfileController', function(){
	var profile = this;

	// placeholders for now...
	profile.full_name = "Tom";
	profile.email = "tom@tom.com";
	profile.monthly_limit = "3000";

	profile.printName = function( ) {

	}

	/* TODO:

	functions for:

	 	retrieving profile info

	 	getting budget info
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