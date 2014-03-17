(function() {
  angular.module("visualizations", []).directive("sentimentwave", function() {
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
  }).directive("reticule", function() {
    return {
      restrict: "E",
      scope: {
        data: "=",
        size: "@?"
      },
      template: "<div></div>",
      link: function(scope, element, attrs) {
        var graph;
        $(element).empty();
        return graph = new window.Reticule($(element)[0], (scope.size ? scope.size : 250), scope.data);
      }
    };
  }).directive("elegantwaves", function() {
    return {
      restrict: "E",
      scope: {
        data: "=",
        options: "=?",
        size: "@?"
      },
      template: "<div></div>",
      link: function(scope, element, attrs) {
        var graph;
        $(element).empty();
        return graph = new window.ElegantWaves($(element)[0], scope.data, scope.options);
      }
    };
  });

}).call(this);
