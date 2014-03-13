(function() {
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
