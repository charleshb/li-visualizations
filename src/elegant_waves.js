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
