(function() {
  window.SentimentWave = (function() {
    function SentimentWave(parent, width, height, data) {
      var layer_info,
        _this = this;
      this.parent = parent;
      this.width = width;
      this.height = height;
      this.data = data;
      layer_info = this.buildLayers(this.data);
      this.svg = d3.select(this.parent).append('svg').attr('width', this.width).attr('height', this.height);
      this.colors = ['#ff6666', '#aaaaaa', '#66ff66'];
      this.svg.selectAll('path.main').data(layer_info.layers).enter().append('path').attr({
        d: layer_info.area,
        "class": 'main'
      }).style('fill', function(d, i) {
        return _this.colors[i];
      });
    }

    SentimentWave.prototype.subwave = function(wave) {
      var layer_info,
        _this = this;
      layer_info = this.buildLayers(this.data, wave);
      this.svg.selectAll('path.main').style('opacity', 0.2);
      return this.svg.selectAll('path.subwave').data(layer_info.layers).enter().append('path').attr({
        d: layer_info.area,
        "class": 'subwave'
      }).attr('d', layer_info.area).attr('transform', "translate(0,-" + layer_info.offset + ")").style({
        fill: function(d, i) {
          return _this.colors[i];
        },
        opacity: 1
      });
    };

    SentimentWave.prototype.findMax = function(data) {
      var d, dmax, _i, _len;
      dmax = 0;
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        d = data[_i];
        if (d != null) {
          if (d.positive > dmax) {
            dmax = d.positive;
          }
          if (d.neutral > dmax) {
            dmax = d.neutral;
          }
          if (d.negative > dmax) {
            dmax = d.negative;
          }
        }
      }
      return dmax;
    };

    SentimentWave.prototype.buildWaves = function(data, dmax) {
      var negative, neutral, positive;
      positive = [];
      neutral = [];
      negative = [];
      if (dmax !== 0) {
        positive = data.map(function(d, i) {
          if (d) {
            return {
              x: i,
              y: d.positive / dmax
            };
          } else {
            return {
              x: i,
              y: 0
            };
          }
        });
        neutral = data.map(function(d, i) {
          if (d) {
            return {
              x: i,
              y: d.neutral / dmax
            };
          } else {
            return {
              x: i,
              y: 0
            };
          }
        });
        negative = data.map(function(d, i) {
          if (d) {
            return {
              x: i,
              y: d.negative / dmax
            };
          } else {
            return {
              x: i,
              y: 0
            };
          }
        });
      } else {
        positive = data.map(function(d, i) {
          return {
            x: i,
            y: 0
          };
        });
        neutral = data.map(function(d, i) {
          return {
            x: i,
            y: 0
          };
        });
        negative = data.map(function(d, i) {
          return {
            x: i,
            y: 0
          };
        });
      }
      return [negative, neutral, positive];
    };

    SentimentWave.prototype.buildLayers = function(data, subwave) {
      var area, data_layers, data_waves, dmax, layers, missing, offset, smax, stack, x, y,
        _this = this;
      if (subwave == null) {
        subwave = null;
      }
      dmax = this.findMax(data);
      data_waves = this.buildWaves(data, dmax);
      data_layers = d3.layout.stack().offset('wiggle')(data_waves);
      offset = 0;
      stack = d3.layout.stack().offset('wiggle');
      if (subwave != null) {
        layers = stack(this.buildWaves(subwave, dmax));
        smax = this.findMax(subwave);
        missing = 1.0 - (smax / dmax);
        offset = this.height * (missing / 2.0);
      } else {
        layers = stack(data_waves);
      }
      x = d3.scale.linear().domain([0, data.length]).range([0, this.width]);
      y = d3.scale.linear().domain([
        0, d3.max(data_layers, function(layer) {
          return d3.max(layer, function(d) {
            return d.y0 + d.y;
          });
        })
      ]).range([this.height, 0]);
      area = d3.svg.area().x(function(d) {
        return x(d.x);
      }).y0(function(d) {
        return y(d.y0);
      }).y1(function(d) {
        return y(d.y0 + d.y);
      }).interpolate('basis');
      return {
        layers: layers,
        area: area,
        offset: offset
      };
    };

    return SentimentWave;

  })();

}).call(this);
