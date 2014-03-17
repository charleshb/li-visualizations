(function() {
  var SlotMap;

  SlotMap = (function() {
    function SlotMap(totalSlots) {
      var sl, _i, _ref;
      this.totalSlots = Math.floor(totalSlots);
      this.slots = [];
      for (sl = _i = 0, _ref = this.totalSlots - 1; 0 <= _ref ? _i < _ref : _i > _ref; sl = 0 <= _ref ? ++_i : --_i) {
        this.slots.push(null);
      }
    }

    SlotMap.prototype.add = function(slot, name) {
      var _i, _ref;
      if (slot > this.totalSlots - 1) {
        slot = this.totalSlots - 1;
      }
      if (this.slots[slot] != null) {
        for (slot = _i = slot, _ref = this.totalSlots - 1; slot <= _ref ? _i < _ref : _i > _ref; slot = slot <= _ref ? ++_i : --_i) {
          if (!this.slots[slot]) {
            break;
          }
        }
      }
      if (slot === this.totalSlots - 1 && (this.slots[slot] != null)) {
        this.crunch();
      }
      return this.slots[slot] = name;
    };

    SlotMap.prototype.crunch = function() {
      var slot, _i, _ref, _results;
      _results = [];
      for (slot = _i = _ref = this.totalSlots - 1; _ref <= 0 ? _i < 0 : _i > 0; slot = _ref <= 0 ? ++_i : --_i) {
        if (this.slots[slot] == null) {
          this.slots.splice(slot, 1);
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    SlotMap.prototype.get = function(name) {
      var ind, slot, _i, _len, _ref;
      ind = 0;
      _ref = this.slots;
      for (ind = _i = 0, _len = _ref.length; _i < _len; ind = ++_i) {
        slot = _ref[ind];
        if (slot === name) {
          return ind;
        }
        ind += 1;
      }
      return 0;
    };

    return SlotMap;

  })();

  window.ElegantWaves = (function() {
    ElegantWaves.prototype.simplifyNumber = function(number) {
      var postfix, val;
      postfix = '';
      if (Math.abs(number) > 1000000000) {
        number = number / 1000000000;
        postfix = 'B';
      }
      if (Math.abs(number) > 1000000) {
        number = number / 1000000;
        postfix = 'M';
      }
      if (Math.abs(number) > 1000) {
        number = number / 1000;
        postfix = 'K';
      }
      val = Math.floor(number * 100.0) / 100.0;
      return "" + val + postfix;
    };

    ElegantWaves.prototype.createFocus = function() {
      var bisectDate, self, yOverlapRange,
        _this = this;
      this.focus = {};
      this.yMap = {};
      yOverlapRange = 11;
      bisectDate = d3.bisector(function(d) {
        return d.date;
      }).left;
      self = this;
      this.mousemove = function() {
        var calcYOffset, d, d0, d1, i, k, mmVector, stepDown, tempYOffset, x0, xOffset, y, yOffset, yTopMargin, _results,
          _this = this;
        _results = [];
        for (k in self.focus) {
          y = self.yscale[k];
          mmVector = self.data[k];
          x0 = self.x.invert(d3.mouse(this)[0]);
          i = bisectDate(mmVector, x0, 1);
          d0 = mmVector[i - 1];
          d1 = mmVector[i];
          if (d1 === void 0) {
            d1 = mmVector[i - 1];
          }
          if (x0 - d0.date > d1.date - x0) {
            d = d1;
          } else {
            d = d0;
          }
          yOffset = 0;
          tempYOffset = null;
          stepDown = false;
          yTopMargin = 6;
          calcYOffset = function() {
            var n, val, yDiff, _ref, _results1;
            tempYOffset = yOffset;
            _ref = self.yMap;
            _results1 = [];
            for (n in _ref) {
              val = _ref[n];
              if (n === k) {
                break;
              }
              _results1.push((function() {
                var _results2;
                _results2 = [];
                while (true) {
                  yDiff = Math.abs(val - (y(d.value) + yOffset));
                  if ((y(d.value) + yOffset) < yTopMargin) {
                    stepDown = true;
                  }
                  if (yDiff < yOverlapRange && stepDown === true) {
                    _results2.push(yOffset = yOffset + (yOverlapRange - yDiff));
                  } else if (yDiff < yOverlapRange) {
                    _results2.push(yOffset = yOffset - (yOverlapRange - yDiff));
                  } else {
                    break;
                  }
                }
                return _results2;
              })());
            }
            return _results1;
          };
          calcYOffset();
          while (tempYOffset !== yOffset) {
            calcYOffset();
          }
          self.yMap[k] = y(d.value) + yOffset;
          if ((new Date(d.date)).getTime() === self.max_date.getTime()) {
            xOffset = (d.value.toString().length * -5.9) - 7;
          } else {
            xOffset = 9;
          }
          self.focus[k].attr('transform', 'translate(' + self.x(d.date) + ',' + (y(d.value) + yOffset) + ')');
          self.focus[k].select('text').attr('x', xOffset);
          _results.push(self.updateFocus(k, d));
        }
        return _results;
      };
      this.mouseover = function() {
        var k, _results;
        _results = [];
        for (k in _this.focus) {
          _results.push(_this.focus[k].style('display', null));
        }
        return _results;
      };
      return this.mouseout = function() {
        var k, _results;
        _results = [];
        for (k in _this.focus) {
          _results.push(_this.focus[k].style('display', 'none'));
        }
        return _results;
      };
    };

    ElegantWaves.prototype.updateFocus = function(signal, data) {
      return this.focus[signal].select('text').text(this.formatFocusNumber(data.value));
    };

    ElegantWaves.prototype.formatFocusNumber = function(value) {
      return Math.round(value * 100.0) / 100.0;
    };

    ElegantWaves.prototype.drawFocus = function(signal) {
      var _this = this;
      this.focus[signal].append('circle').attr('r', 3.5).style('stroke', function(d) {
        return _this.color(signal);
      }).style('fill', 'none');
      return this.focus[signal].append('text').attr('x', 9).attr('y', 0).attr('dy', '.35em');
    };

    ElegantWaves.prototype.createFocusFor = function(signal) {
      this.focus[signal] = this.svg.append('g').attr('class', 'focus').style('display', 'none');
      this.drawFocus(signal);
      return this.svg.append('rect').attr('width', this.options.width).attr('height', this.options.height).style({
        'fill': 'none',
        'pointer-events': 'all'
      }).on('mouseover', this.mouseover).on('mouseout', this.mouseout).on('mousemove', this.mousemove);
    };

    ElegantWaves.prototype.drawMinMax = function() {
      this.svg.append('text').attr('transform', "translate(" + (this.x(this.max_date) + 190) + ",0)").attr('x', 3).attr('y', -10).style('fill', 'black').style('font-weight', 'bold').text(this.options.text.max);
      return this.svg.append('text').attr('transform', "translate(" + (this.x(this.max_date) + 130) + ",0)").attr('x', 3).attr('y', -10).style('fill', 'black').style('font-weight', 'bold').text(this.options.text.min);
    };

    ElegantWaves.prototype.setupOptions = function() {
      if (this.options.margin == null) {
        this.options.margin = {
          top: 20,
          right: 250,
          bottom: 30,
          left: 0
        };
      }
      if (this.options.width == null) {
        this.options.width = 600;
      }
      if (this.options.height == null) {
        this.options.height = 200;
      }
      if (this.options.text == null) {
        this.options.text = {};
      }
      if (this.options.text.min == null) {
        this.options.text.min = 'Min';
      }
      if (this.options.text.max == null) {
        return this.options.text.max = 'Max';
      }
    };

    ElegantWaves.prototype.createContainer = function() {
      return this.svg = d3.select(this.parent).append('svg').attr('class', 'elegant-waves').attr('width', this.options.width + this.options.margin.left + this.options.margin.right).attr('height', this.options.height + this.options.margin.top + this.options.margin.bottom).append('g').attr('transform', "translate(" + this.options.margin.left + "," + this.options.margin.top + ")");
    };

    ElegantWaves.prototype.drawXAxis = function() {
      var xAxis;
      xAxis = d3.svg.axis().ticks(5).scale(this.x).orient('bottom');
      return this.svg.append('g').attr('class', 'x axis').attr('transform', "translate(0," + this.options.height + ")").call(xAxis);
    };

    ElegantWaves.prototype.drawHilight = function() {
      if ((this.options.hilightstart != null) > 0) {
        return this.svg.append('rect').attr('x', this.x(this.options.hilightstart)).attr('width', this.x(this.options.hilightend) - this.x(this.options.hilightstart)).attr('y', 0).attr('height', this.options.height).style({
          fill: 'black',
          'fill-opacity': '0.2'
        });
      }
    };

    ElegantWaves.prototype.createXAxis = function() {
      this.determineMinMaxDates();
      this.x = d3.time.scale().range([0, this.options.width]);
      return this.x.domain([this.min_date, this.max_date]);
    };

    ElegantWaves.prototype.createYScales = function() {
      var k, _i, _len, _ref, _results;
      this.yscale = {};
      _ref = d3.keys(this.data);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        this.yscale[k] = d3.scale.linear().range([this.options.height - 3, 4]);
        _results.push(this.yscale[k].domain(d3.extent(this.data[k], function(v) {
          return v.value;
        })));
      }
      return _results;
    };

    ElegantWaves.prototype.eventStyle = function(event) {
      return {
        'stroke': event.priority === 1 ? 'red' : 'orange',
        'stroke-width': '4',
        'stroke-opacity': '0.5'
      };
    };

    ElegantWaves.prototype.eventAttributes = function(event) {
      return {
        'data-original-title': "" + event.date + ": " + event.subject,
        'data-placement': 'bottom',
        'data-toggle': 'tooltip',
        'data-container': 'body',
        'class': 'line-tooltip'
      };
    };

    ElegantWaves.prototype.eventClick = function(event) {};

    ElegantWaves.prototype.renderEvent = function(event, x) {
      var _this = this;
      return this.svg.append('line').datum(event).attr('x1', x).attr('x2', x).attr('y1', 0).attr('y2', this.options.height).attr(this.eventAttributes(event)).style(this.eventStyle(event)).on('click', function(d) {
        return _this.eventClick(d);
      });
    };

    ElegantWaves.prototype.drawEvents = function() {
      var c, xval, _i, _len, _ref, _results;
      if (this.options.events != null) {
        _ref = this.options.events;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          xval = this.x(c.date);
          if (c.date <= this.max_date && xval >= 0) {
            _results.push(this.renderEvent(c, this.x(c.date)));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    ElegantWaves.prototype.createOrdering = function() {
      var _this = this;
      this.ordered = d3.keys(this.data);
      return this.ordered = this.ordered.sort(function(a, b) {
        var av, bv;
        av = _this.yscale[a](_this.data[a][_this.data[a].length - 1].value);
        bv = _this.yscale[b](_this.data[b][_this.data[b].length - 1].value);
        return av > bv;
      });
    };

    ElegantWaves.prototype.createColoring = function() {
      this.color = d3.scale.category10();
      return this.color.domain(d3.keys(this.data));
    };

    ElegantWaves.prototype.determineMinMaxDates = function() {
      var d, dr, k, _i, _j, _len, _len1, _ref, _ref1;
      this.max_date = new Date();
      this.min_date = new Date();
      _ref = d3.keys(this.data);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        _ref1 = this.data[k];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          d = _ref1[_j];
          if (d.date < this.min_date) {
            this.min_date = d.date;
          }
        }
      }
      if (this.options.daterange) {
        dr = this.options.daterange + 30;
        return this.min_date = this.max_date - (dr * 24 * 60 * 60 * 1000);
      }
    };

    ElegantWaves.prototype.drawMinMaxNumbers = function(signal, yBox) {
      var max, min, vector,
        _this = this;
      vector = this.data[signal];
      min = Math.floor(d3.min(vector, function(d) {
        return d.value;
      }));
      max = Math.floor(d3.max(vector, function(d) {
        return d.value;
      }));
      this.svg.append('text').datum(function(d) {
        return {
          name: signal,
          value: vector[vector.length - 1]
        };
      }).attr('transform', function(d) {
        return "translate(" + (_this.x(_this.max_date) + 130) + "," + yBox + ")";
      }).attr('x', 3).attr('dy', '.35em').style('fill', function(d) {
        return _this.color(signal);
      }).text(this.simplifyNumber(min));
      return this.svg.append('text').datum(function(d) {
        return {
          name: signal,
          value: vector[vector.length - 1]
        };
      }).attr('transform', function(d) {
        return "translate(" + (_this.x(_this.max_date) + 190) + "," + yBox + ")";
      }).attr('x', 3).attr('dy', '.35em').style('fill', function(d) {
        return _this.color(signal);
      }).text(this.simplifyNumber(max));
    };

    ElegantWaves.prototype.drawVector = function(signal) {
      var line, vector, y,
        _this = this;
      vector = this.data[signal];
      y = this.yscale[signal];
      line = d3.svg.line().interpolate('monotone').x(function(d) {
        return _this.x(d.date);
      }).y(function(d) {
        return y(d.value);
      });
      return this.svg.append('path').datum(vector).attr('class', 'line').style('fill', 'none').attr('d', line).style('stroke', function(d) {
        return _this.color(signal);
      }).style('stroke-width', 1);
    };

    ElegantWaves.prototype.createSlotMap = function() {
      var k, vector, yBox, _i, _len, _ref, _results;
      this.yBoxSize = 15;
      this.slotMap = new SlotMap((this.options.height / this.yBoxSize) + 1);
      _ref = this.ordered;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        vector = this.data[k];
        yBox = Math.floor(this.yscale[k](vector[vector.length - 1].value) / this.yBoxSize);
        _results.push(this.slotMap.add(yBox, k));
      }
      return _results;
    };

    ElegantWaves.prototype.drawSignalText = function(signal, yBox) {
      var vector,
        _this = this;
      vector = this.data[signal];
      return this.svg.append('text').datum(function(d) {
        return {
          name: signal,
          value: vector[vector.length - 1]
        };
      }).attr('transform', function(d) {
        return "translate(" + (_this.x(_this.max_date)) + "," + yBox + ")";
      }).attr('x', 3).attr('dy', '.35em').style('fill', function(d) {
        return _this.color(signal);
      }).text("" + signal);
    };

    ElegantWaves.prototype.drawSignals = function() {
      var signal, yBox, _i, _len, _ref, _results;
      _ref = this.ordered;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        signal = _ref[_i];
        this.drawVector(signal);
        yBox = this.slotMap.get(signal) * this.yBoxSize;
        this.createFocusFor(signal);
        this.drawSignalText(signal, yBox);
        _results.push(this.drawMinMaxNumbers(signal, yBox));
      }
      return _results;
    };

    function ElegantWaves(parent, data, options) {
      this.parent = parent;
      this.data = data;
      this.options = options != null ? options : {};
      this.setupOptions();
      this.createContainer();
      this.createXAxis();
      this.createYScales();
      this.createOrdering();
      this.createColoring();
      this.createSlotMap();
      this.createFocus();
      this.drawXAxis();
      this.drawHilight();
      this.drawMinMax();
      this.drawSignals();
      this.drawEvents();
    }

    return ElegantWaves;

  })();

}).call(this);
;(function() {
  var InnerRing, ReticuleLabels;

  ReticuleLabels = (function() {
    function ReticuleLabels(parent, data, width, height, radius, start, end, color, key) {
      var d, enabled, i, inset, mtotal, ratio, sa, tx, x1, x2, y1, y2, _i, _j, _len, _len1, _ref, _ref1;
      this.parent = parent;
      this.data = data;
      this.width = width;
      this.height = height;
      this.radius = radius;
      this.start = start;
      this.end = end;
      this.color = color;
      this.key = key;
      this.svg = this.parent.append('g').attr('transform', "translate(" + (width / 2) + "," + (height / 2) + ")").style({
        'pointer-events': 'none'
      });
      this.sticks = [];
      this.balls = [];
      this.texts = [];
      ratio = (Math.PI * 2) / 360;
      start = (Math.PI / 2) * 3;
      inset = (Math.PI * 2) * (1 / 720);
      _ref = this.data;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        d = _ref[i];
        mtotal = d.size * ratio;
        sa = start + inset + (mtotal / 2);
        x1 = Math.cos(sa) * (radius * 0.3);
        x2 = Math.cos(sa) * (radius * 1.3);
        y1 = Math.sin(sa) * (radius * 0.3);
        y2 = Math.sin(sa) * (radius * 1.3);
        this.sticks[d.id] = this.svg.append('svg:line').attr({
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2
        }).style({
          stroke: 'black',
          'stroke-width': 0.3,
          'pointer-events': 'none'
        });
        this.balls[d.id] = this.svg.append('svg:ellipse').attr({
          cx: x2,
          cy: y2,
          rx: 3,
          ry: 3
        }).style({
          fill: 'black',
          'pointer-events': 'none'
        });
        tx = x2 - 5;
        if (x2 < 0) {
          tx = x2 - 13;
        }
        this.texts[d.id] = this.svg.append('svg:text').attr({
          x: tx,
          y: y2 + 4,
          dx: '0.8em',
          'text-anchor': x2 < 0 ? 'end' : 'start',
          'data-id': d.id
        }).style({
          fill: 'black'
        }).text(d.label);
        start += mtotal;
      }
      _ref1 = this.data;
      for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
        d = _ref1[i];
        enabled = false;
        if (d.positive > 0 || d.negative > 0 || d.neutral > 0) {
          enabled = true;
        }
        color = enabled ? 'black' : '#cccccc';
        this.sticks[d.id].style('stroke', color);
        this.balls[d.id].style('fill', color);
        this.texts[d.id].style('fill', color);
      }
    }

    return ReticuleLabels;

  })();

  InnerRing = (function() {
    function InnerRing(parent, data, width, height, radius, start, end, color, key) {
      var arc, g, pie;
      this.parent = parent;
      this.data = data;
      this.width = width;
      this.height = height;
      this.radius = radius;
      this.start = start;
      this.end = end;
      this.color = color;
      this.key = key;
      this.innerRadius = this.radius - this.end;
      arc = d3.svg.arc().outerRadius(this.radius - this.start).innerRadius(this.innerRadius);
      this.svg = this.parent.append('g').attr('transform', "translate(" + (width / 2) + "," + (height / 2) + ")").style({
        'pointer-events': 'none'
      });
      pie = this.build_pie();
      g = this.svg.selectAll('.arc').data(pie).enter().append('g').attr('class', 'arc').style({
        'pointer-events': 'none'
      });
      g.append('path').style({
        'fill': this.color,
        'pointer-events': 'none'
      }).attr('d', arc);
    }

    InnerRing.prototype.build_pie = function() {
      var ctotal, d, ea, i, inset, mtotal, pie, ratio, sa, start, _i, _len, _ref;
      pie = [];
      ratio = (Math.PI * 2) / 360;
      start = 0;
      inset = (Math.PI * 2) * (1 / 720);
      _ref = this.data;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        d = _ref[i];
        mtotal = d.size * ratio;
        sa = start + inset;
        ea = (start + mtotal) - inset;
        if (this.key != null) {
          ctotal = (d[this.key] / d.max) * mtotal;
          sa = (start + ((mtotal / 2) - (ctotal / 2))) + inset;
          ea = (start + ((mtotal / 2) + (ctotal / 2))) - inset;
        }
        if (ea < sa) {
          sa = ea;
        }
        pie.push({
          index: i,
          startAngle: sa,
          endAngle: ea,
          value: d[this.key],
          data: d,
          innerRadius: this.innerRadius
        });
        start += mtotal;
      }
      return pie;
    };

    return InnerRing;

  })();

  window.Reticule = (function() {
    function Reticule(parent, height, data) {
      var i, radius, ri, rings, rw, start, _i;
      this.parent = parent;
      this.height = height;
      this.data = data;
      this.width = this.height * 1.6;
      this.diameter = this.height * 0.5;
      this.svg = d3.select(this.parent).append('svg').attr('width', this.width).attr('height', this.height);
      rw = this.diameter * 0.08;
      ri = this.diameter * 0.01;
      start = ri + ri;
      rings = [];
      for (i = _i = 0; _i <= 2; i = ++_i) {
        rings.push({
          start: start,
          end: start + rw
        });
        start += rw + ri;
      }
      radius = this.diameter / 2;
      new InnerRing(this.svg, this.data, this.width, this.height, radius, 0, start, 'rgba(128,128,128,0.3)', null);
      this.p = new InnerRing(this.svg, this.data, this.width, this.height, radius, rings[0].start, rings[0].end, 'green', 'positive');
      this.o = new InnerRing(this.svg, this.data, this.width, this.height, radius, rings[1].start, rings[1].end, '#999999', 'neutral');
      this.n = new InnerRing(this.svg, this.data, this.width, this.height, radius, rings[2].start, rings[2].end, 'red', 'negative');
      this.labels = new ReticuleLabels(this.svg, this.data, this.width, this.height, radius);
    }

    return Reticule;

  })();

}).call(this);
;(function() {
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
;(function() {
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
