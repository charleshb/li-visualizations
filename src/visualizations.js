(function() {
  angular.module("visualizations", []).directive("subwave", function() {
    return {
      restrict: "E",
      scope: {
        wave: "=",
        subwave: "=?",
        width: "@?",
        height: "@?"
      },
      template: "<div></div>",
      link: function(scope, element, attrs) {
        var graph;
        $(element).empty();
        graph = new window.SentimentWave($(element)[0], (scope.width ? scope.width : 800), (scope.height ? scope.height : 100), scope.wave);
        if (scope.subwave) {
          return graph.subwave(scope.subwave);
        }
      }
    };
  });

}).call(this);
