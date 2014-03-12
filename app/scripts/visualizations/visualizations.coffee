angular.module("visualizations", []).directive "subwave", ->
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
