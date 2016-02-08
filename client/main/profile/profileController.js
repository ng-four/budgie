angular.module('profile.controller', [])
.controller('ProfileController', function(ProfileServices, AuthServices, GoalServices, $timeout, $window, $location){
	var profile = this;

	profile.loadProfile = function() { //Loads the users profile data via ProfileServices
		ProfileServices.getProfileData()
			.then(function(resp){
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
				throw error;
			});
	};

	profile.changeLimit = function() {
		profile.limitClicked = !profile.limitClicked;
	};

	profile.submitNewLimit = function(newLimit){ //Allows the user to update their monthly spending limit via ProfileServices
		newLimit = newLimit || profile.monthly_limit;
		ProfileServices.updateLimit(newLimit)
			.then(function(resp){
				profile.loadProfile();
			}, function(error){
				throw error;
			});
	};

	profile.changeTarget = function() {
		profile.targetClicked = !profile.targetClicked;
	};


	profile.submitNewSavingsTarget = function(newSavings){ //Allows the user to update their savings target via ProfileServices
		newSavings = newSavings || profile.savings_goal;
		ProfileServices.updateSavingsTarget(newSavings)
			.then(function(resp){
				profile.changeTarget();
				profile.loadProfile();
			}, function(error){
				throw error;
			});
	};

	profile.toggleNewGoal = function(){
		profile.newGoalClicked = !profile.newGoalClicked;
	};

	profile.submitNewGoal = function(goal){ //Allows the user to input a new goal via GoalServices
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
			goal.name = '';
			goal.amount = '';
			goal.category = '';
			goal.notes = '';

		});

	};

	profile.toggleTotalSavings = function(){
		profile.showTotalSavings = !profile.showTotalSavings;
	};

	profile.submitNewTotalSavings = function(amount){ //Allows the user to update their total savings via ProfileServices
		amount = amount || profile.total_savings;
		// if(!amount){
		// 	amount = profile.total_savings;
		// }
		ProfileServices.updateTotalSavings(amount)
		.then(function(resp){
			profile.total_savings = amount;
			profile.toggleTotalSavings();
		});
	};

	profile.completeGoal = function(idx, id){ //Allows the user to acquire a current goal via GoalServices
			profile.goals.splice(idx, 1);
			//TODO call service for complete goal
			GoalServices.completeGoal(id)
      .then(function(){
        $location.path('main/expenses');
      });
	};

  profile.deleteGoal = function(idx, id){ //Allows the user to delete a current goal via GoalServices
			profile.goals.splice(idx, 1);
			//TODO call service for complete goal
			GoalServices.deleteGoal(id);
	};

  profile.showNotes = function(notes){
			profile.currentNote = notes;
	};

  profile.goalUpdateAmount = null;
  profile.goalUpdateId = null;

  profile.addMoneyToGoal = function(){ //Allows the user to add money towards one of their goals via GoalServices
			GoalServices.addMoneyToGoal(profile.goalUpdateAmount, profile.goalUpdateId)
      .then(function(){
        profile.loadProfile();
      });
	};

  profile.subtractMoneyFromGoal = function(){ //Allows the user to subtract money from one of their goals via GoalServices
			GoalServices.subtractMoneyFromGoal(profile.goalUpdateAmount, profile.goalUpdateId)
      .then(function(){
        profile.loadProfile();
      });
	};
  profile.makeActiveId = function(id){
    profile.goalUpdateId = id;
  };

	profile.loadProfile(); //Renders all the profile data for the user 

});
