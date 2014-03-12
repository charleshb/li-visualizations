'use strict';

angular.module('labsVisualizationsApp',['visualizations'])
  .controller('MainCtrl', function ($scope) {
	  var firstwave = [];
	  var subwave = [];
	  for( var i = 0; i < 500; i++ ) {
	    var val = ( Math.sin( i / 20.0 ) * 200 ) + 20;
	    firstwave.push( {
	      positive: Math.abs( val * 0.3 ),
	      negative: Math.abs( val * 0.2 ),
	      neutral: Math.abs( val * 0.5 )
	    } );
	    var val = ( Math.sin( i / 20.0 ) * 50 ) + 5;
	    subwave.push( {
	      positive: Math.abs( val * 0.3 ),
	      negative: Math.abs( val * 0.2 ),
	      neutral: Math.abs( val * 0.5 )
	    } );
	  }
	  $scope.firstwave = firstwave;
	  $scope.subwave = subwave;
  });
