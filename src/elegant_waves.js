(function() {
  var SlotMap, simplifyNumber;

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

  simplifyNumber = function(number) {
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

  window.ElegantWaves = (function() {
    function ElegantWaves(parent, data, options) {
      var bisectDate, c, color, d, dr, dr_start_in_ms, filtered_vector, focus, he, hs, k, line, max, max_date, max_text, min, min_date, min_text, min_vector_date, mousemove, mouseout, mouseover, ordered, orig_vector, pt, sm, svg, totalBoxes, vector, x, xAxis, xval, y, yBox, yBoxSize, yBoxUsed, yMap, yOffset, yOverlapRange, yscale, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _ref, _ref1, _ref2, _ref3, _ref4, _ref5,
        _this = this;
      this.parent = parent;
      this.data = data;
      this.options = options != null ? options : {};
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
      svg = d3.select(this.parent).append('svg').attr('class', 'elegant-waves').attr('width', this.options.width + this.options.margin.left + this.options.margin.right).attr('height', this.options.height + this.options.margin.top + this.options.margin.bottom).append('g').attr('transform', "translate(" + this.options.margin.left + "," + this.options.margin.top + ")");
      max_date = new Date();
      min_date = new Date();
      min_vector_date = new Date();
      min_vector_date.setMonth(max_date.getMonth() - 13);
      _ref = d3.keys(this.data);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        _ref1 = this.data[k];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          d = _ref1[_j];
          if (d.date < min_date) {
            min_date = d.date;
          }
        }
      }
      dr_start_in_ms = min_date;
      if (this.options.daterange) {
        dr = this.options.daterange + 30;
        dr_start_in_ms = max_date - (dr * 24 * 60 * 60 * 1000);
      }
      x = d3.time.scale().range([0, this.options.width]);
      xAxis = d3.svg.axis().ticks(5).scale(x).orient('bottom');
      x.domain([dr_start_in_ms, max_date]);
      hs = null;
      he = null;
      if (((_ref2 = this.options.hilightstart) != null ? _ref2.length : void 0) > 0) {
        hs = this.options.hilightstart;
        if (hs == null) {
          hs = this.options.hilightstart;
        }
        he = max_date;
        if (((_ref3 = this.options.hilightend) != null ? _ref3.length : void 0) > 0) {
          he = this.options.hilightend;
          if (he == null) {
            he = this.options.hilightend;
          }
        }
      }
      svg.append('g').attr('class', 'x axis').attr('transform', "translate(0," + this.options.height + ")").call(xAxis);
      color = d3.scale.category10();
      color.domain(d3.keys(this.data));
      yBoxSize = 15;
      yBoxUsed = {};
      totalBoxes = this.options.height / yBoxSize;
      sm = new SlotMap(totalBoxes + 1);
      yscale = {};
      _ref4 = d3.keys(this.data);
      for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
        k = _ref4[_k];
        vector = this.data[k].filter(function(el) {
          return el.date >= min_vector_date;
        });
        yscale[k] = d3.scale.linear().range([this.options.height - 3, 4]);
        yscale[k].domain(d3.extent(vector, function(v) {
          return v.value;
        }));
      }
      ordered = d3.keys(this.data);
      ordered = ordered.sort(function(a, b) {
        var av, bv;
        av = yscale[a](_this.data[a][_this.data[a].length - 1].value);
        bv = yscale[b](_this.data[b][_this.data[b].length - 1].value);
        return av > bv;
      });
      if (he !== null && hs !== null) {
        svg.append('rect').attr('x', x(hs)).attr('width', x(he) - x(hs)).attr('y', 0).attr('height', this.options.height).style({
          fill: 'black',
          'fill-opacity': '0.2'
        });
      }
      svg.append('text').attr('transform', "translate(" + (x(max_date) + 190) + ",0)").attr('x', 3).attr('y', -10).style('fill', 'black').style('font-weight', 'bold').text("Max");
      svg.append('text').attr('transform', "translate(" + (x(max_date) + 130) + ",0)").attr('x', 3).attr('y', -10).style('fill', 'black').style('font-weight', 'bold').text("Min");
      for (_l = 0, _len3 = ordered.length; _l < _len3; _l++) {
        k = ordered[_l];
        vector = this.data[k];
        yBox = Math.floor(yscale[k](vector[vector.length - 1].value) / yBoxSize);
        sm.add(yBox, k);
      }
      yOverlapRange = 11;
      bisectDate = d3.bisector(function(d) {
        return d.date;
      }).left;
      data = this.data;
      mousemove = function() {
        var calcYOffset, d0, d1, i, mmVector, stepDown, tempYOffset, x0, xOffset, y, yOffset, yTopMargin, _results,
          _this = this;
        _results = [];
        for (k in focus) {
          y = yscale[k];
          mmVector = data[k];
          x0 = x.invert(d3.mouse(this)[0]);
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
            var n, val, yDiff, _results1;
            tempYOffset = yOffset;
            _results1 = [];
            for (n in yMap) {
              val = yMap[n];
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
          yMap[k] = y(d.value) + yOffset;
          if ((new Date(d.date)).getTime() === max_date.getTime()) {
            xOffset = (d.value.toString().length * -5.9) - 7;
          } else {
            xOffset = 9;
          }
          focus[k].attr('transform', 'translate(' + x(d.date) + ',' + (y(d.value) + yOffset) + ')');
          _results.push(focus[k].select('text').attr('x', xOffset).text(d.value));
        }
        return _results;
      };
      mouseover = function() {
        var _results;
        _results = [];
        for (k in focus) {
          _results.push(focus[k].style('display', null));
        }
        return _results;
      };
      mouseout = function() {
        var _results;
        _results = [];
        for (k in focus) {
          _results.push(focus[k].style('display', 'none'));
        }
        return _results;
      };
      focus = {};
      yMap = {};
      yOffset = {};
      for (_m = 0, _len4 = ordered.length; _m < _len4; _m++) {
        k = ordered[_m];
        vector = this.data[k];
        y = yscale[k];
        if (this.options.autoscale) {
          orig_vector = vector;
          vector = [];
          for (_n = 0, _len5 = orig_vector.length; _n < _len5; _n++) {
            pt = orig_vector[_n];
            if (x(pt.date) >= 0) {
              vector.push(pt);
            }
          }
        }
        line = d3.svg.line().interpolate('monotone').x(function(d) {
          return x(d.date);
        }).y(function(d) {
          return y(d.value);
        });
        svg.append('path').datum(vector).attr('class', 'line').style('fill', 'none').attr('d', line).style('stroke', function(d) {
          return color(k);
        }).style('stroke-width', 1);
        yBox = sm.get(k) * yBoxSize;
        svg.append('text').datum(function(d) {
          return {
            name: k,
            value: vector[vector.length - 1]
          };
        }).attr('transform', function(d) {
          return "translate(" + (x(max_date)) + "," + yBox + ")";
        }).attr('x', 3).attr('dy', '.35em').style('fill', function(d) {
          return color(k);
        }).text("" + k);
        focus[k] = svg.append('g').attr('class', 'focus').style('display', 'none');
        focus[k].append('circle').attr('r', 3.5).style('stroke', function(d) {
          return color(k);
        }).style('fill', 'none');
        focus[k].append('text').attr('x', 9).attr('y', 0).attr('dy', '.35em');
        svg.append('rect').attr('width', this.options.width).attr('height', this.options.height).style({
          'fill': 'none',
          'pointer-events': 'all'
        }).on('mouseover', mouseover).on('mouseout', mouseout).on('mousemove', mousemove);
        filtered_vector = vector.filter(function(el) {
          return el.date >= min_vector_date;
        });
        min = Math.floor(d3.min(filtered_vector, function(d) {
          return d.value;
        }));
        max = Math.floor(d3.max(filtered_vector, function(d) {
          return d.value;
        }));
        min_text = simplifyNumber(min);
        max_text = simplifyNumber(max);
        svg.append('text').datum(function(d) {
          return {
            name: k,
            value: vector[vector.length - 1]
          };
        }).attr('transform', function(d) {
          return "translate(" + (x(max_date) + 130) + "," + yBox + ")";
        }).attr('x', 3).attr('dy', '.35em').style('fill', function(d) {
          return color(k);
        }).style('font-weight', k === 'overall_chi_score' ? 'bold' : '').text(min_text);
        svg.append('text').datum(function(d) {
          return {
            name: k,
            value: vector[vector.length - 1]
          };
        }).attr('transform', function(d) {
          return "translate(" + (x(max_date) + 190) + "," + yBox + ")";
        }).attr('x', 3).attr('dy', '.35em').style('fill', function(d) {
          return color(k);
        }).style('font-weight', k === 'overall_chi_score' ? 'bold' : '').text(max_text);
      }
      if (this.options.events != null) {
        _ref5 = this.options.events;
        for (_o = 0, _len6 = _ref5.length; _o < _len6; _o++) {
          c = _ref5[_o];
          xval = x(c.date);
          if (c.date <= max_date && xval >= 0) {
            svg.append('line').datum(c).attr('x1', x(c.date)).attr('x2', x(c.date)).attr('y1', 0).attr('y2', this.options.height).attr({
              'data-original-title': "" + c.date + ": " + c.subject,
              'data-placement': 'bottom',
              'data-toggle': 'tooltip',
              'data-container': 'body',
              'class': 'line-tooltip'
            }).style({
              'stroke': c.priority === 1 ? 'red' : 'orange',
              'stroke-width': '4',
              'stroke-opacity': '0.5'
            }).on('click', function(d) {
              if (_this.options.click != null) {
                _this.options.click(d);
              }
              return $rootScope.$apply();
            });
          }
        }
      }
    }

    return ElegantWaves;

  })();

}).call(this);
