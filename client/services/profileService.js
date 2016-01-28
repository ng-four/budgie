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

	var updateSavingsTarget = function(newTarget){
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

	var updateTotalSavings = function(amount){
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
