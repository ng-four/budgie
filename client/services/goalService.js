angular.module('goal.service', [])
.factory('GoalServices', function($http, $location, $window) {
  var addNewGoal = function(newGoal){ //Allows a user to add a new goal with a name, amount, category, and notes
    return $http({
      method: 'POST',
      url: '/goals',
      data: {
        'name': newGoal.name,
        'amount': newGoal.amount,
        'category': newGoal.category,
        'notes': newGoal.notes
      }
    }).then(function(resp){
      return resp;
    }, function(error){
      throw error;
    });
  };

  var getGoals = function(){ //Get request to retrieve the current goals of a user
    return $http({
      method: 'GET',
      url: '/goals',
    }).then(function(resp){
      return resp;
    }, function(error){
      throw error;
    });
  };

  var addMoneyToGoal = function(amount, id){ //Put request allowing a user to add funds towards a specific goal
    return $http({
      method: 'PUT',
      url: '/goals/'+id,
      data: {
        'amount': amount
      }
    }).then(function(resp){
      return resp;
    }, function(error){
      throw error;
    });
  };

  var subtractMoneyFromGoal = function(amount, id){ //Patch request allowing a user to subtract funds from a specific goal
    return $http({
      method: 'PATCH',
      url: '/goals/'+id,
      data: {
        'amount': amount
      }
    }).then(function(resp){
      return resp;
    }, function(error){
      throw error;
    });
  };

  var deleteGoal = function(id){ //Delete request allowing a user to delete a specific goal
    return $http({
      method: 'DELETE',
      url: '/goals/'+id,
    }).then(function(resp){
      return resp;
    }, function(error){
      throw error;
    });
  };

  var completeGoal = function(id){ //Post request allowing a user to acquire a goal and funds readjust 
    return $http({
      method: 'POST',
      url: '/goals/'+id,
    }).then(function(resp){
      return resp;
    }, function(error){
      throw error;
    });
  };

	return {
		addNewGoal: addNewGoal,
    getGoals: getGoals,
    addMoneyToGoal: addMoneyToGoal,
    subtractMoneyFromGoal: subtractMoneyFromGoal,
    deleteGoal: deleteGoal,
    completeGoal: completeGoal
	};

});
