angular.module('map.service', [])
  .factory('MapServices', function($http, $location, $window, $q) {

  	var makeMap = function(mapCanvas) {
  		var map = new google.maps.Map(mapCanvas, {
    		zoom: 15,
    		center: {lat: 34.0210487, lng: -118.4922354}
  		});
  		return map;
  	}

  	var getGeoCode = function(address){

  		var deferred = $q.defer();
  		var geocoder = new google.maps.Geocoder();


  		console.log("address in getGeoCode service ", address);
    	var geocodeOptions = {
      		address: address
    	};

    	geocoder.geocode(geocodeOptions, function(results, status) {
      		if ( status !== google.maps.GeocoderStatus.OK ) {
      			console.log("Geocoder failed!!! ", status);
        		// deffered.reject('Geocoder failed due to: ' + status);
      		}
      		deferred.resolve(results[0].geometry.location);	
    	});

    	return deferred.promise;  // need to call lat() and lng()

  	}

  	var renderMarker = function(transaction, map, bounds){
  		var date = transaction.spent_date || "";

  		var contentString = '<div id="content">'+
      		'<div id="bodyContent">'+
      		'<p style="color: black">' + transaction.name + '</p>'+
       		'<p style="color: black">' + transaction.category + '</p>'+
      		'<p style="color: black">$' + transaction.amount + '</p>'+
      		'<p style="color: black">' + date + '</p>'+
      		'</div>'+
      		'</div>';

  		var infowindow = new google.maps.InfoWindow({
    		content: contentString
  		});

  		var marker = new google.maps.Marker({
    		position: transaction.latlng,  // how are we getting this lat/lng info???
    		map: map,
    		title: transaction.name
  		});

  		marker.addListener('mouseover', function() {
    		infowindow.open(map, marker);
  		});

  		marker.addListener('mouseout', function() {
    		infowindow.close(map, marker);
  		});

  		console.log("transaction.latlng in map service ", transaction.latlng);

  		var ll = new google.maps.LatLng(transaction.latlng);
  		console.log("ll in map svc ", ll);
  		bounds.extend(ll);
    

  	}

  	var setBounds = function(map, bounds){
  		map.fitBounds(bounds);
  	}


  return {
  	makeMap: makeMap,
  	getGeoCode: getGeoCode,
  	renderMarker: renderMarker,
  	setBounds: setBounds

  }
});