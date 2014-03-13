angular.module("visualizations", [])
.directive "sentimentwave", ->
	restrict: "E"
	scope:
		wave: "="
		subwave: "=?"
		width: "@?"
		height: "@?"
	template: "<div></div>"
	link: (scope, element, attrs) ->
		$(element).empty()
		graph = new window.SentimentWave(
			$(element)[0],
			(if scope.width then scope.width else 800),
			(if scope.height then scope.height else 100),
			scope.wave
		)
		graph.subwave scope.subwave	if scope.subwave
.directive "reticule", ->
	restrict: "E"
	scope:
		data: "="
		size: "@?"
	template: "<div></div>"
	link: (scope, element, attrs) ->
		$(element).empty()
		graph = new window.Reticule(
			$(element)[0],
			(if scope.size then scope.size else 250),
			scope.data
		)
.directive "elegantwaves", ->
	restrict: "E"
	scope:
		data: "="
		options: "=?"
		size: "@?"
	template: "<div></div>"
	link: (scope, element, attrs) ->
		$(element).empty()
		graph = new window.ElegantWaves(
			$(element)[0],
			scope.data,
			scope.options
		)
