angular.module('profile.service', [])  
.factory('ProfileServices', function($http, $location, $window) {

	var getProfileData = function(){
		return $http.get('/user')
			.then(function(resp) {
				return resp.data;
			}, function(error){
				throw error;
			});
	};

	var updateLimit = function(newLimit) {
		return $http.({
			method: 'PUT',
			url: '/monthly_limit',
			data: {monthly_limit: newLimit}
		}).then(function(resp){
			return resp;
		}, function(error){
			throw error;
		});
	};

	var updateSavings = function(newGoal){
		return $http.({
			method: 'PUT',
			url: '/savings_goal', 
			data: {savings_goal: newGoal}
		}).then(function(resp){
			return resp;
		}, function(error){
			throw error;
		});
	}

	return {
		getProfileData: getProfileData,
		updateLimit: updateLimit,
		updateSavings: updateSavings
	}



})