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

	  $scope.reticule_data = [{label:"a",id:"3",negative:0,positive:1,neutral:1,size:13.801670593274793,max:3},{label:"b",id:"6",negative:0,positive:0,neutral:0,size:14.139001927607625,max:3},{label:"c",id:"7",negative:0,positive:0,neutral:0,size:16.635253801670594,max:2},{label:"d",id:"9",negative:0,positive:0,neutral:0,size:16.635253801670594,max:2},{label:"e",id:"42",negative:0,positive:1,neutral:2,size:21.965088884129365,max:4},{label:"f",id:"29",negative:0,positive:0,neutral:2,size:24.5288070250589,max:3},{label:"g",id:"47",negative:0,positive:4,neutral:0,size:25.810666095523665,max:5},{label:"h",id:"54",negative:0,positive:1,neutral:2,size:26.013064896123367,max:5},{label:"h",id:"41",negative:0,positive:0,neutral:2,size:26.147997429856503,max:6},{label:"j",id:"98",negative:0,positive:1,neutral:3,size:27.429856500321268,max:6},{label:"k",id:"53",negative:0,positive:1,neutral:1,size:31.07303491111587,max:7},{label:"l",id:"30",negative:1,positive:4,neutral:3,size:33.77168558577854,max:7},{label:"m",id:"8",negative:1,positive:5,neutral:3,size:33.77168558577854,max:5},{label:"n",id:"2",negative:1,positive:4,neutral:3,size:48.276932962090385,max:8}];

	  var days_in_ms = function( d ) { return d * ( 24 * 60 * 60 * 1000 ) };
	  var signals = { a:[], b: [], c: [] };
	  var today = new Date();
	  for( var day = 100; day >= 0; day-- ) {
	    var date = today - days_in_ms( day );
	    signals.a.push( { date: date, value: Math.abs( Math.cos( ( 100 - day ) / 5.0 ) * 70 ) } )
	    signals.b.push( { date: date, value: Math.abs( Math.cos( ( 100 - day ) / 8.0 ) * 100 ) } )
	    signals.c.push( { date: date, value: Math.abs( Math.cos( ( 100 - day ) / 25.0 ) * 80 ) } )
	  }
	  $scope.signals = signals;
	  $scope.signals_options = {
	  	events: [
	  		{ date: today - days_in_ms( 10 ), subject: 'A', priority: 1 },
	  		{ date: today - days_in_ms( 12 ), subject: 'B', priority: 2 },
	  		{ date: today - days_in_ms( 24 ), subject: 'C', priority: 1 },
	  		{ date: today - days_in_ms( 39 ), subject: 'D', priority: 2 },
	  		{ date: today - days_in_ms( 72 ), subject: 'E', priority: 1 }
	  	]
	  };
  });
