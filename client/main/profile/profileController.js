angular.module('profile.controller', [])
.controller('ProfileController', function(ProfileServices, AuthServices, GoalServices, $timeout, $window, $location){
	var profile = this;

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
				GoalServices.getGoals()
				.then(function(resp){
					console.log(resp);
					profile.goals = resp.data;
				});
			}, function(error){
				// to handle edge case wherein server shuts down but browser window still open	
				console.log("loadProfile threw error, logging out... ");
				AuthServices.logOut();
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
	};

	profile.allocateSavings = function() {

		//TODO

	};

	profile.logOut = function() {
		AuthServices.logOut();
	};

	profile.toggleNewGoal = function(){
		if(!profile.newGoalClicked){
			profile.newGoalClicked = true;
		} else {
			profile.newGoalClicked = false;
		}
	};

	profile.submitNewGoal = function(goal){
		profile.toggleNewGoal();
		var newGoal = {
			name: goal.name,
			amount: goal.amount,
			category: goal.category,
			notes: goal.notes
		};

		GoalServices.addNewGoal(newGoal)
		.then(function(resp){
			profile.goals.push(resp.data);
			console.log("this is the response in addNewGoal", resp);
		});

	};

	profile.toggleTotalSavings = function(){
		profile.showTotalSavings = !profile.showTotalSavings;
	};

	profile.submitNewTotalSavings = function(amount){
		console.log("this is amount (which should be profile.newTotalSavings) inside submitNewTotalSavings", amount);
		ProfileServices.updateTotalSavings(amount)
		.then(function(resp){
			profile.total_savings = amount;
		});
	};

	profile.completeGoal = function(idx, id){
			profile.goals.splice(idx, 1);
			//TODO call service for complete goal
			GoalServices.completeGoal(id);
	};


});
