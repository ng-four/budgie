angular.module('goal.service', [])
.factory('GoalServices', function($http, $location, $window) {
  var addNewGoal = function(newGoal){
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

  var getGoals = function(){
    return $http({
      method: 'GET',
      url: '/goals',
    }).then(function(resp){
      return resp;
    }, function(error){
      throw error;
    });
  };

  var addMoneyToGoal = function(amount, id){
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

  var subtractMoneyFromGoal = function(amount, id){
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

  var deleteGoal = function(id){
    return $http({
      method: 'DELETE',
      url: '/goals/'+id,
    }).then(function(resp){
      return resp;
    }, function(error){
      throw error;
    });
  };

  var completeGoal = function(id){
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
