angular.module('profile.controller', [])
.controller('ProfileController', function(ProfileServices, AuthServices, $timeout, $window, $location){
	var profile = this;

	var fakeGoals = [{
		name: "Rocket Car",
		price: 20000,
		target_date: null,
		progress: 872,       // will need allocation functions to adjust
		category: null
		},
		{
		name: "Solid Gold House",
		price: 45000,
		target_date: null,
		progress: 247,
		category: null
		},
		{
		name: "Mona Lisa",
		price: 120000,
		target_date: null,
		progress: 89,
		category: null
		}];

	profile.loadProfile = function() {
		console.log("profile.loadProfile called ");
		ProfileServices.getProfileData()
			.then(function(resp){
				console.log('this is resp in loadProfile', resp);
				profile.limitClicked = false;
				profile.savingsClicked = false;
				profile.allocateClicked = false;
				profile.newGoalClicked = false;
				profile.showTotalSavings = false;
				profile.total_savings = resp.total_savings;
				profile.email = resp.email;
				profile.full_name = resp.full_name;
				profile.monthly_limit = resp.monthly_limit;
				profile.savings_goal = resp.savings_goal;
				profile.goals = resp.goals || fakeGoals;
			}, function(error){
				throw error;
			});
	};

	profile.changeLimit = function() {
		profile.limitClicked = true;
	};

	profile.submitNewLimit = function(newLimit){
		ProfileServices.updateLimit(newLimit)
			.then(function(resp){
				console.log(resp);
				$timeout(profile.loadProfile, 1000);
			}, function(error){
				throw error;
			});
	};

	profile.changeTarget = function() {
		profile.targetClicked = true;
	};


	profile.submitNewSavingsTarget = function(newSavings){
		ProfileServices.updateSavingsTarget(newSavings)
			.then(function(resp){
				console.log("resp in updateSavings ", resp);
				$timeout(profile.loadProfile, 1000);     // reload updated profile
			}, function(error){
				throw error;
			});
	};

	profile.toggleAllocate = function(){
		profile.allocateClicked = true;
	}

	profile.allocateSavings = function() {

		//TODO

	}

	profile.logOut = function() {
		AuthServices.logOut();
	};

	profile.toggleNewGoal = function(){
		if(!profile.newGoalClicked){
			profile.newGoalClicked = true;
		} else {
			profile.newGoalClicked = false;
		}
	}

	profile.submitNewGoal = function(goal){
		profile.toggleNewGoal();
		var newGoal = {
			name: goal.name,
			price: goal.price,
			target_date: goal.target_date,
			progress: 0
		}

											// placeholder till we get goal functionality on backend

		fakeGoals.push(newGoal);
		profile.loadProfile();
	}

	profile.toggleTotalSavings = function(){
		profile.showTotalSavings = !profile.showTotalSavings;
	}

	profile.submitNewTotalSavings = function(amount){
		console.log("this is amount (which should be profile.newTotalSavings) inside submitNewTotalSavings", amount);
		ProfileServices.updateTotalSavings(amount)
		.then(function(resp){
			profile.total_savings = amount;
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
