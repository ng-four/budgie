angular.module('profile.service', [])
.factory('ProfileServices', function($http, $location, $window) {

	var getProfileData = function(){ //Get request to the database for all the users profile data
		return $http.get('/user')
			.then(function(resp) {
				return resp.data;
			}, function(error){
				throw error;
			});
	};

	var updateLimit = function(newLimit) { //Put request to database to update the users monthly spending limit
		return $http({
			method: 'PUT',
			url: '/monthly_limit',
			data: {'monthly_limit': newLimit}
		}).then(function(resp){
			return resp;
		}, function(error){
			throw error;
		});
	};

	var updateSavingsTarget = function(newTarget){ //Put request to database to update the users monthly savings goal
		return $http({
			method: 'PUT',
			url: '/savings_goal',
			data: {'savings_goal': newTarget}
		}).then(function(resp){
			return resp;
		}, function(error){
			throw error;
		});
	};

	var updateTotalSavings = function(amount){ //Put request to database to update the users total savings
		return $http({
			method: 'PUT',
			url: '/total_savings',
			data: {'total_savings': amount}
		}).then(function(resp){
			return resp;
		}, function(error){
			throw error;
		});
	};


	return {
		getProfileData: getProfileData,
		updateLimit: updateLimit,
		updateSavingsTarget: updateSavingsTarget,
		updateTotalSavings: updateTotalSavings,
	};

});
